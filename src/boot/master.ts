import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as os from 'os';
import * as cluster from 'cluster';
import * as chalk from 'chalk';
import * as portscanner from 'portscanner';
import { getConnection } from 'typeorm';

import Logger from '@/services/logger';
import loadConfig from '@/config/load';
import { Config } from '@/config/types';
import { lessThan } from '@/prelude/array';
import { envOption } from '../env';
import { showMachineInfo } from '@/misc/show-machine-info';
import { initDb } from '../db/postgre';

//const _filename = fileURLToPath(import.meta.url);
const _filename = __filename;
const _dirname = dirname(_filename);

const meta = JSON.parse(fs.readFileSync(`${_dirname}/../meta.json`, 'utf-8'));

const logger = new Logger('core', 'cyan');
const bootLogger = logger.createSubLogger('boot', 'magenta', false);

function greet() {
	if (!envOption.quiet) {
		//#region CherryPick logo
		const v = `v${meta.version}`;
		console.log(chalk.hex('#ffa9c3').bold('  _________ .__                                ') + chalk.hex('#95e3e8').bold('__________.__        __    '));
		console.log(chalk.hex('#ffa9c3').bold(' \\_   ___ \\|  |__   __________________ ___.__.') + chalk.hex('#95e3e8').bold('\\______   \\__| ____ |  | __'));
		console.log(chalk.hex('#ffa9c3').bold(' /    \\  \\/|  |  \\_/ __ \\_  __ \\_  __ <   |  |') + chalk.hex('#95e3e8').bold(' |     ___/  |/ ___\\|  |/ /'));
		console.log(chalk.hex('#ffa9c3').bold(' \\     \\___|   Y  \\  ___/|  | \\/|  | \\/\\___  |') + chalk.hex('#95e3e8').bold(' |    |   |  \\  \\___|    < '));
		console.log(chalk.hex('#ffa9c3').bold('  \\______  /___|  /\\___  >__|   |__|   / ____|') + chalk.hex('#95e3e8').bold(' |____|   |__|\\___  >__|_ \\'));
		console.log(chalk.hex('#ffa9c3').bold('         \\/     \\/     \\/              \\/     ') + chalk.hex('#95e3e8').bold('                  \\/     \\/'));
		//#endregion

		console.log(chalk.hex('#ffa9c3').bold(' Cherry') + chalk.hex('#95e3e8').bold('Pick') + (' is an open-source decentralized microblogging platform based from') + (chalk.hex('#9ec23f').bold(' Misskey') + ('.')));
		console.log(chalk.keyword('orange')(' If you like ') + chalk.hex('#ffa9c3').bold('Cherry') + chalk.hex('#95e3e8').bold('Pick') + chalk.keyword('orange')(', please donate to support development. https://www.patreon.com/noridev'));
		// console.log(chalk.hex('#ffa9c3').bold(' KOKO') + chalk.hex('#95e3e8').bold('NECT') + chalk.hex('#ffa9c3')(' with') + chalk.hex('#95e3e8').bold(' NoriDev.'));

		console.log('');
		console.log(chalk`--- ${os.hostname()} {gray (PID: ${process.pid.toString()})} ---`);
	}

	bootLogger.info('Welcome to CherryPick!');
	bootLogger.info(`CherryPick v${meta.version}`, null, true);
}

function isRoot() {
	// maybe process.getuid will be undefined under not POSIX environment (e.g. Windows)
	return process.getuid != null && process.getuid() === 0;
}

/**
 * Init master process
 */
export async function masterMain() {
	let config!: Config;

	// initialize app
	try {
		greet();
		showEnvironment();
		await showMachineInfo(bootLogger);
		showNodejsVersion();
		config = loadConfigBoot();
		await connectDb();
		await validatePort(config);
	} catch (e) {
		bootLogger.error('Fatal error occurred during initialization', null, true);
		process.exit(1);
	}

	bootLogger.succ('CherryPick initialized');

	if (!envOption.disableClustering) {
		await spawnWorkers(config.clusterLimit);
	}

	bootLogger.succ(`Now listening on port ${config.port} on ${config.url}`, null, true);

	if (!envOption.noDaemons) {
		require('../daemons/server-stats').default();
		require('../daemons/queue-stats').default();
		require('../daemons/janitor').default();
	}
}

const runningNodejsVersion = process.version.slice(1).split('.').map(x => parseInt(x, 10));
const requiredNodejsVersion = [11, 7, 0];
const satisfyNodejsVersion = !lessThan(runningNodejsVersion, requiredNodejsVersion);

function showEnvironment(): void {
	const env = process.env.NODE_ENV;
	const logger = bootLogger.createSubLogger('env');
	logger.info(typeof env === 'undefined' ? 'NODE_ENV is not set' : `NODE_ENV: ${env}`);

	if (env !== 'production') {
		logger.warn('The environment is not in production mode.');
		logger.warn('DO NOT USE FOR PRODUCTION PURPOSE!', null, true);
	}

	logger.info(`You ${isRoot() ? '' : 'do not '}have root privileges`);
}

function showNodejsVersion(): void {
	const nodejsLogger = bootLogger.createSubLogger('nodejs');

	nodejsLogger.info(`Version ${runningNodejsVersion.join('.')}`);

	if (!satisfyNodejsVersion) {
		nodejsLogger.error(`Node.js version is less than ${requiredNodejsVersion.join('.')}. Please upgrade it.`, null, true);
		process.exit(1);
	}
}

function loadConfigBoot(): Config {
	const configLogger = bootLogger.createSubLogger('config');
	let config;

	try {
		config = loadConfig();
	} catch (exception) {
		if (typeof exception === 'string') {
			configLogger.error(exception);
			process.exit(1);
		}
		if (exception.code === 'ENOENT') {
			configLogger.error('Configuration file not found', null, true);
			process.exit(1);
		}
		throw exception;
	}

	configLogger.succ('Loaded');

	return config;
}

async function connectDb(): Promise<void> {
	const dbLogger = bootLogger.createSubLogger('db');

	// Try to connect to DB
	try {
		dbLogger.info('Connecting...');
		await initDb();
		const v = await getConnection().query('SHOW server_version').then(x => x[0].server_version);
		dbLogger.succ(`Connected: v${v}`);
	} catch (e) {
		dbLogger.error('Cannot connect', null, true);
		dbLogger.error(e);
		process.exit(1);
	}
}

async function validatePort(config: Config): Promise<void> {
	const isWellKnownPort = (port: number) => port < 1024;

	async function isPortAvailable(port: number): Promise<boolean> {
		return await portscanner.checkPortStatus(port, '127.0.0.1') === 'closed';
	}

	if (config.port == null || Number.isNaN(config.port)) {
		bootLogger.error('The port is not configured. Please configure port.', null, true);
		process.exit(1);
	}

	if (process.platform === 'linux' && isWellKnownPort(config.port) && !isRoot()) {
		bootLogger.error('You need root privileges to listen on well-known port on Linux', null, true);
		process.exit(1);
	}

	if (!await isPortAvailable(config.port)) {
		bootLogger.error(`Port ${config.port} is already in use`, null, true);
		process.exit(1);
	}
}

async function spawnWorkers(limit: number = 1) {
	const workers = Math.min(limit, os.cpus().length);
	bootLogger.info(`Starting ${workers} worker${workers === 1 ? '' : 's'}...`);
	await Promise.all([...Array(workers)].map(spawnWorker));
	bootLogger.succ('All workers started');
}

function spawnWorker(): Promise<void> {
	return new Promise(res => {
		const worker = cluster.fork();
		worker.on('message', message => {
			if (message !== 'ready') return;
			res();
		});
	});
}
