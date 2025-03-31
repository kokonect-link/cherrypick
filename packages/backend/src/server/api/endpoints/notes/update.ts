/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ms from 'ms';
import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { NoteUpdateService } from '@/core/NoteUpdateService.js';
import { DI } from '@/di-symbols.js';
import { GetterService } from '@/server/api/GetterService.js';
import { MAX_NOTE_TEXT_LENGTH } from '@/const.js';
import type { DriveFilesRepository, MiDriveFile } from '@/models/_.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,
	requiredRolePolicy: 'canEditNote',

	kind: 'write:notes',

	limit: {
		duration: ms('5min'),
		max: 5,
		minInterval: ms('1sec'),
	},

	errors: {
		noSuchNote: {
			message: 'No such note.',
			code: 'NO_SUCH_NOTE',
			id: 'a6584e14-6e01-4ad3-b566-851e7bf0d474',
		},

		noSuchFile: {
			message: 'Some files are not found.',
			code: 'NO_SUCH_FILE',
			id: 'b6992544-63e7-67f0-fa7f-32444b1b5306',
		},

		cannotCreateAlreadyExpiredPoll: {
			message: 'Poll is already expired.',
			code: 'CANNOT_CREATE_ALREADY_EXPIRED_POLL',
			id: '04da457d-b083-4055-9082-955525eda5a5',
		},

		cannotCreateAlreadyExpiredEvent: {
			message: 'Event is already expired.',
			code: 'CANNOT_CREATE_ALREADY_EXPIRED_EVENT',
			id: 'a80c5545-5126-421e-969b-35c3eb2c3646',
		},

		cannotScheduleDeleteEarlierThanNow: {
			message: 'Cannot specify delete time earlier than now.',
			code: 'CANNOT_SCHEDULE_DELETE_EARLIER_THAN_NOW',
			id: '9f04994a-3aa2-11ef-a495-177eea74788f',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteId: { type: 'string', format: 'misskey:id' },
		text: {
			type: 'string',
			minLength: 1,
			maxLength: MAX_NOTE_TEXT_LENGTH,
			nullable: false,
		},
		fileIds: {
			type: 'array',
			uniqueItems: true,
			minItems: 1,
			maxItems: 16,
			items: { type: 'string', format: 'misskey:id' },
		},
		mediaIds: {
			type: 'array',
			uniqueItems: true,
			minItems: 1,
			maxItems: 16,
			items: { type: 'string', format: 'misskey:id' },
		},
		poll: {
			type: 'object',
			nullable: true,
			properties: {
				choices: {
					type: 'array',
					uniqueItems: true,
					minItems: 2,
					maxItems: 10,
					items: { type: 'string', minLength: 1, maxLength: 50 },
				},
				multiple: { type: 'boolean' },
				expiresAt: { type: 'integer', nullable: true },
				expiredAfter: { type: 'integer', nullable: true, minimum: 1 },
			},
			required: ['choices'],
		},
		event: {
			type: 'object',
			nullable: true,
			properties: {
				title: { type: 'string', minLength: 1, maxLength: 128, nullable: false },
				start: { type: 'integer', nullable: false },
				end: { type: 'integer', nullable: true },
				metadata: { type: 'object' },
			},
		},
		cw: { type: 'string', nullable: true, maxLength: 100 },
		disableRightClick: { type: 'boolean', default: false },
		scheduledDelete: {
			type: 'object',
			nullable: true,
			properties: {
				deleteAt: { type: 'integer', nullable: true },
				deleteAfter: { type: 'integer', nullable: true, minimum: 1 },
			},
		},
	},
	required: ['noteId', 'text', 'cw'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private getterService: GetterService,
		private noteEntityService: NoteEntityService,
		private noteUpdateService: NoteUpdateService,
	) {
		super({
			...meta,
			requiredRolePolicy: 'canEditNote', // 修正された部分
		}, paramDef, async (ps, me) => {
			const note = await this.getterService.getNote(ps.noteId).catch(err => {
				if (err.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new ApiError(meta.errors.noSuchNote);
				throw err;
			});

			if (note.userId !== me.id) {
				throw new ApiError(meta.errors.noSuchNote);
			}

			let files: MiDriveFile[] = [];
			const fileIds = ps.fileIds ?? ps.mediaIds ?? null;
			if (fileIds != null) {
				files = await this.driveFilesRepository.createQueryBuilder('file')
					.where('file.userId = :userId AND file.id IN (:...fileIds)', {
						userId: me.id,
						fileIds,
					})
					.orderBy('array_position(ARRAY[:...fileIds], "id"::text)')
					.setParameters({ fileIds })
					.getMany();

				if (files.length !== fileIds.length) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			}

			if (ps.poll) {
				if (typeof ps.poll.expiresAt === 'number') {
					if (ps.poll.expiresAt < Date.now()) {
						throw new ApiError(meta.errors.cannotCreateAlreadyExpiredPoll);
					}
				} else if (typeof ps.poll.expiredAfter === 'number') {
					ps.poll.expiresAt = Date.now() + ps.poll.expiredAfter;
				}
			}

			if (ps.event) {
				if (typeof ps.event.end === 'number') {
					if (ps.event.end < Date.now()) {
						throw new ApiError(meta.errors.cannotCreateAlreadyExpiredEvent);
					}
				}
			}

			if (ps.scheduledDelete) {
				if (typeof ps.scheduledDelete.deleteAt === 'number') {
					if (ps.scheduledDelete.deleteAt < Date.now()) {
						throw new ApiError(meta.errors.cannotScheduleDeleteEarlierThanNow);
					} else if (typeof ps.scheduledDelete.deleteAfter === 'number') {
						ps.scheduledDelete.deleteAt = Date.now() + ps.scheduledDelete.deleteAfter;
					}
				}
			}

			const data = {
				text: ps.text,
				files: files,
				cw: ps.cw,
				poll: ps.poll ? {
					choices: ps.poll.choices,
					multiple: ps.poll.multiple ?? false,
					expiresAt: ps.poll.expiresAt ? new Date(ps.poll.expiresAt) : null,
				} : undefined,
				event: ps.event ? {
					start: new Date(ps.event.start!),
					end: ps.event.end ? new Date(ps.event.end) : null,
					title: ps.event.title!,
					metadata: ps.event.metadata ?? {},
				} : undefined,
				disableRightClick: ps.disableRightClick,
				deleteAt: ps.scheduledDelete?.deleteAt ? new Date(ps.scheduledDelete.deleteAt) : ps.scheduledDelete?.deleteAfter ? new Date(Date.now() + ps.scheduledDelete.deleteAfter) : null,
			};

			const updatedNote = await this.noteUpdateService.update(me, data, note, false);

			return {
				updatedNote: await this.noteEntityService.pack(updatedNote!, me),
			};
		});
	}
}
