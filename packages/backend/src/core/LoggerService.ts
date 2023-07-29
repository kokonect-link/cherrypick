import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import Logger from '@/logger.js';
import { bindThis } from '@/decorators.js';
import type { KEYWORD } from 'color-convert/conversions.js';

@Injectable()
export class LoggerService {
	private cloudLogging;
	constructor(
		@Inject(DI.config)
		private config: Config,
	) {
		if (this.config.cloudLogging) {
			this.cloudLogging = this.config.cloudLogging;
		}
	}

	@bindThis
	public getLogger(domain: string, color?: KEYWORD | undefined, store?: boolean) {
		return new Logger(domain, color, store, this.cloudLogging);
	}
}
