/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * CherryPick Entry Point!
 */

import cluster from 'node:cluster';
import { EventEmitter } from 'node:events';
import process from 'node:process';
import chalk from 'chalk';
import Xev from 'xev';
import Logger from '@/logger.js';
import { envOption } from '../env.js';
import { masterMain } from './master.js';
import { workerMain } from './worker.js';
import { readyRef } from './ready.js';

import 'reflect-metadata';

process.title = `CherryPick (${cluster.isPrimary ? 'master' : 'worker'})`;

Error.stackTraceLimit = Infinity;
EventEmitter.defaultMaxListeners = 128;

const logger = new Logger('core', 'cyan');
const clusterLogger = logger.createSubLogger('cluster', 'orange');
const ev = new Xev();

//#region Events

let isShuttingDown = false;

if (cluster.isPrimary && !envOption.disableClustering) {
	// Listen new workers
	cluster.on('fork', worker => {
		clusterLogger.debug(`Process forked: [${worker.id}]`);
	});

	// Listen online workers
	cluster.on('online', worker => {
		clusterLogger.debug(`Process is now online: [${worker.id}]`);
	});

	// Listen for dying workers
	cluster.on('exit', (worker, code, signal) => {
		// Replace the dead worker,
		// we're not sentimental
		clusterLogger.error(chalk.red(`[${worker.id}] died (${signal || code})`));
		if (!isShuttingDown) cluster.fork();
		else clusterLogger.info(chalk.yellow('Worker respawn disabled because of shutdown'));
	});

	process.on('SIGINT', () => {
		logger.warn(chalk.yellow('Process received SIGINT'));
		isShuttingDown = true;
	});

	process.on('SIGTERM', () => {
		logger.warn(chalk.yellow('Process received SIGTERM'));
		isShuttingDown = true;
	});
}

// Display detail of unhandled promise rejection
if (!envOption.quiet) {
	process.on('unhandledRejection', console.dir);
}

// Display detail of uncaught exception
process.on('uncaughtException', err => {
	try {
		logger.error(err);
		console.trace(err);
	} catch { }
});

// Dying away...
process.on('exit', code => {
	logger.warn(chalk.yellow(`The process is going to exit with code ${code}`));
});

process.on('warning', warning => {
	if ((warning as never)['code'] !== 'CHERRYPICK_SHUTDOWN') return;
	logger.warn(chalk.yellow(`${warning.message}: ${(warning as never)['detail']}`));
	for (const id in cluster.workers) cluster.workers[id]?.process.kill('SIGTERM');
	process.exit();
});

//#endregion

if (!envOption.disableClustering) {
	if (cluster.isPrimary) {
		logger.info(`Start main process... pid: ${process.pid}`);
		await masterMain();
		ev.mount();
	} else if (cluster.isWorker) {
		logger.info(`Start worker process... pid: ${process.pid}`);
		await workerMain();
	} else {
		throw new Error('Unknown process type');
	}
} else {
	// 非clusterの場合はMasterのみが起動するため、Workerの処理は行わない(cluster.isWorker === trueの状態でこのブロックに来ることはない)
	logger.info(`Start main process... pid: ${process.pid}`);
	await masterMain();
	ev.mount();
}

readyRef.value = true;

// ユニットテスト時にMisskeyが子プロセスで起動された時のため
// それ以外のときは process.send は使えないので弾く
if (process.send) {
	process.send('ok');
}
