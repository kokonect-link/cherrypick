/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import * as os from 'node:os';
import cluster from 'node:cluster';
import chalk from 'chalk';
import chalkTemplate from 'chalk-template';
import Logger from '@/logger.js';
import { loadConfig } from '@/config.js';
import type { Config } from '@/config.js';
import { showMachineInfo } from '@/misc/show-machine-info.js';
import { envOption } from '@/env.js';
import { jobQueue, server } from './common.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const meta = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/meta.json`, 'utf-8'));

const logger = new Logger('core', 'cyan');
const bootLogger = logger.createSubLogger('boot', 'magenta');

const themeColorCherry = chalk.hex('#ffbcdc');
const themeColorPick = chalk.hex('#b1d3ff');
const themeColorMisskey = chalk.hex('#9ec23f');
const themeColorWarning = chalk.hex('#ffbb00');

function greet() {
	if (!envOption.quiet) {
		//#region CherryPick logo
		const v = `v${meta.version}`;
		console.log(themeColorCherry.bold('   _____ _                         ') + themeColorPick.bold(' _____ _      _'));
		console.log(themeColorCherry.bold('  / ____| |                        ') + themeColorPick.bold('|  __ (_)    | |'));
		console.log(themeColorCherry.bold(' | |    | |__   ___ _ __ _ __ _   _') + themeColorPick.bold('| |__) |  ___| | __'));
		console.log(themeColorCherry.bold(' | |    | \'_ \\ / _ \\ \'__| \'__| | | ') + themeColorPick.bold('|  ___/ |/ __| |/ /'));
		console.log(themeColorCherry.bold(' | |____| | | |  __/ |  | |  | |_| ') + themeColorPick.bold('| |   | | (__|   <'));
		console.log(themeColorCherry.bold('  \\_____|_| |_|\\___|_|  |_|   \\__, ') + themeColorPick.bold('|_|   |_|\\___|_|\\_\\'));
		console.log(themeColorCherry.bold('                               __/ |'));
		console.log(themeColorCherry.bold('                              |___/'));
		//#endregion

		console.log(themeColorCherry.bold(' Cherry') + themeColorPick.bold('Pick') + (' is an open-source decentralized microblogging platform based from') + (themeColorMisskey.bold(' Misskey') + ('.')));
		console.log(themeColorWarning(' If you like ') + themeColorCherry.bold('Cherry') + themeColorPick.bold('Pick') + themeColorWarning(', please consider donating to support dev.'));
		console.log(themeColorWarning(' ・Patreon: https://www.patreon.com/noridev'));
		console.log(themeColorWarning(' ・Paypal: https://www.paypal.me/noridev'));
		console.log(themeColorWarning(' ・GitHub Sponsers: https://github.com/sponsors/noridev'));
		console.log(themeColorWarning(' ・Kakao Pay: https://qr.kakaopay.com/Ej9SHx6pQ'));
		console.log(themeColorWarning(' ・pixivFANBOX: https://noridev.fanbox.cc/plans'));

		let config!: Config;

		// initialize app
		try {
			config = loadConfigBoot(false);
		} catch (e) {
			bootLogger.error('Fatal error occurred during initialization', null, true);
			process.exit(1);
		}

		const kokonectHosts = [
			'kokonect.link',
			'beta.kokonect.link',
			'universe.noridev.moe',
		];

		function getHostToCompare(url: string): string | null {
			try {
				const fullUrl = url.startsWith('http') ? url : `http://${url}`;
				const urlObject = new URL(fullUrl);

				if (urlObject.port && urlObject.port !== '80' && urlObject.port !== '443') {
					return `${urlObject.hostname}:${urlObject.port}`;
				}
				return urlObject.hostname;
			} catch (e) {
				console.error(`Invalid URL in config: ${url}`);
				return null;
			}
		}

		const currentHost = getHostToCompare(config.url);

		if (currentHost && kokonectHosts.includes(currentHost)) {
			console.log('');
			console.log(themeColorCherry.bold(' KOKO') + themeColorPick.bold('NECT') + ' with' + themeColorCherry.bold(' Nori') + themeColorPick.bold('Dev') + '.');
		}

		console.log('');
		console.log(chalkTemplate`--- ${os.hostname()} {gray (PID: ${process.pid.toString()})} ---`);
	}

	bootLogger.info('Welcome to CherryPick!');
	bootLogger.info(`CherryPick v${meta.version}`, null, true);
	bootLogger.info(`Based on Misskey v${meta.basedMisskeyVersion}`, null, true);
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
		//await connectDb();
		if (config.pidFile) fs.writeFileSync(config.pidFile, process.pid.toString());
	} catch (e) {
		bootLogger.error('Fatal error occurred during initialization', null, true);
		process.exit(1);
	}

	bootLogger.succ(themeColorCherry('Cherry') + themeColorPick('Pick') + (' initialized'));

	if (config.sentryForBackend) {
		const Sentry = await import('@sentry/node');
		const { nodeProfilingIntegration } = await import('@sentry/profiling-node');

		Sentry.init({
			integrations: [
				...(config.sentryForBackend.enableNodeProfiling ? [nodeProfilingIntegration()] : []),
			],

			// Performance Monitoring
			tracesSampleRate: 1.0, //  Capture 100% of the transactions

			// Set sampling rate for profiling - this is relative to tracesSampleRate
			profilesSampleRate: 1.0,

			maxBreadcrumbs: 0,

			...config.sentryForBackend.options,
		});
	}

	bootLogger.info(
		`mode: [disableClustering: ${envOption.disableClustering}, onlyServer: ${envOption.onlyServer}, onlyQueue: ${envOption.onlyQueue}]`,
	);

	if (!envOption.disableClustering) {
		// clusterモジュール有効時

		if (envOption.onlyServer) {
			// onlyServer かつ enableCluster な場合、メインプロセスはforkのみに制限する(listenしない)。
			// ワーカープロセス側でlistenすると、メインプロセスでポートへの着信を受け入れてワーカープロセスへの分配を行う動作をする。
			// そのため、メインプロセスでも直接listenするとポートの競合が発生して起動に失敗してしまう。
			// see: https://nodejs.org/api/cluster.html#cluster
		} else if (envOption.onlyQueue) {
			await jobQueue();
		} else {
			await server();
		}

		await spawnWorkers(config.clusterLimit);
	} else {
		// clusterモジュール無効時

		if (envOption.onlyServer) {
			await server();
		} else if (envOption.onlyQueue) {
			await jobQueue();
		} else {
			await server();
			await jobQueue();
		}
	}

	if (envOption.onlyQueue) {
		bootLogger.succ('Queue started', null, true);
	} else {
		bootLogger.succ(config.socket ? `Now listening on socket ${config.socket} on ${config.url}` : `Now listening on port ${config.port} on ${config.url}`, null, true);
	}
}

function showEnvironment(): void {
	const env = process.env.NODE_ENV;
	const logger = bootLogger.createSubLogger('env');
	logger.info(typeof env === 'undefined' ? 'NODE_ENV is not set' : `NODE_ENV: ${env}`);

	if (env !== 'production') {
		logger.warn('The environment is not in production mode.');
		logger.warn('DO NOT USE FOR PRODUCTION PURPOSE!', null, true);
	}
}

function showNodejsVersion(): void {
	const nodejsLogger = bootLogger.createSubLogger('nodejs');

	nodejsLogger.info(`Version ${process.version} detected.`);
}

function loadConfigBoot(debug = true): Config {
	const configLogger = bootLogger.createSubLogger('config');
	let config;

	try {
		config = loadConfig();
	} catch (exception) {
		if (typeof exception === 'string') {
			configLogger.error(exception);
			process.exit(1);
		} else if ((exception as any).code === 'ENOENT') {
			configLogger.error('Configuration file not found', null, true);
			process.exit(1);
		}
		throw exception;
	}

	if (debug) configLogger.succ('Loaded');

	return config;
}

/*
async function connectDb(): Promise<void> {
	const dbLogger = bootLogger.createSubLogger('db');

	// Try to connect to DB
	try {
		dbLogger.info('Connecting...');
		await initDb();
		const v = await db.query('SHOW server_version').then(x => x[0].server_version);
		dbLogger.succ(`Connected: v${v}`);
	} catch (err) {
		dbLogger.error('Cannot connect', null, true);
		dbLogger.error(err);
		process.exit(1);
	}
}
*/

async function spawnWorkers(limit = 1) {
	const workers = Math.min(limit, os.cpus().length);
	bootLogger.info(`Starting ${workers} worker${workers === 1 ? '' : 's'}...`);
	await Promise.all([...Array(workers)].map(spawnWorker));
	bootLogger.succ('All workers started');
}

function spawnWorker(): Promise<void> {
	return new Promise(res => {
		const worker = cluster.fork();
		worker.on('message', message => {
			if (message === 'listenFailed') {
				bootLogger.error('The server Listen failed due to the previous error.');
				process.exit(1);
			}
			if (message !== 'ready') return;
			res();
		});
	});
}
