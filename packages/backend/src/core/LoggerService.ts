/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import Logger from '@/logger.js';
import { bindThis } from '@/decorators.js';
import type { Logging } from '@google-cloud/logging';
import type { KEYWORD } from 'color-convert/conversions.js';

@Injectable()
export class LoggerService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.cloudLogging)
		private cloudLogging: Logging | null,
	) {
	}

	@bindThis
	public getLogger(domain: string, color?: KEYWORD | undefined) {
		const logger = this.cloudLogging?.log(this.config.cloudLogging?.logName ?? 'cherrypick');
		return new Logger(domain, color, logger);
	}
}
