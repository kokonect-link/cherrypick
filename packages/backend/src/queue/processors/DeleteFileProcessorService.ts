/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type Logger from '@/logger.js';
import { DriveService } from '@/core/DriveService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import type { DriveFilesRepository } from '@/models/_.js';
import { bindThis } from '@/decorators.js';
import { QueueLoggerService } from '../QueueLoggerService.js';
import type * as Bull from 'bullmq';
import type { ObjectStorageFileJobData } from '../types.js';

@Injectable()
export class DeleteFileProcessorService {
	private logger: Logger;

	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private driveService: DriveService,
		private userEntityService: UserEntityService,
		private queueLoggerService: QueueLoggerService,
	) {
		this.logger = this.queueLoggerService.logger.createSubLogger('delete-file');
	}

	@bindThis
	public async process(job: Bull.Job<ObjectStorageFileJobData>): Promise<string> {
		const key: string = job.data.key;

		const file = await this.driveFilesRepository.createQueryBuilder('file')
			.where('file.accessKey = :accessKey', { accessKey: key })
			.orWhere('file.thumbnailAccessKey = :thumbnailAccessKey', { thumbnailAccessKey: key })
			.orWhere('file.webpublicAccessKey = :webpublicAccessKey', { webpublicAccessKey: key })
			.getOne();
		const isRemote = file?.user ? this.userEntityService.isRemoteUser(file.user) : false;

		await this.driveService.deleteObjectStorageFile(key, isRemote);

		return 'Success';
	}
}
