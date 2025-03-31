/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { In } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { NoteDraftService } from '@/core/NoteDraftService.js';
import { MAX_NOTE_TEXT_LENGTH } from '@/const.js';
import type { MiNote, MiChannel, MiDriveFile, UsersRepository, NotesRepository, BlockingsRepository, DriveFilesRepository, ChannelsRepository } from '@/models/_.js';
import { isRenote, isQuote } from '@/misc/is-renote.js';
import type { MiUser } from '@/models/User.js';
import { DI } from '@/di-symbols.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { NoteDraftEntityService } from '@/core/entities/NoteDraftEntityService.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['notes', 'drafts'],

	requireCredential: true,

	prohibitMoved: true,

	kind: 'write:account',

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			updatedDraft: {
				type: 'object',
				optional: false, nullable: false,
				ref: 'NoteDraft',
			},
		},
	},

	errors: {
		noSuchRenoteTarget: {
			message: 'No such renote target.',
			code: 'NO_SUCH_RENOTE_TARGET',
			id: 'b5c90186-4ab0-49c8-9bba-a1f76c282ba4',
		},

		cannotReRenote: {
			message: 'You can not Renote a pure Renote.',
			code: 'CANNOT_RENOTE_TO_A_PURE_RENOTE',
			id: 'fd4cc33e-2a37-48dd-99cc-9b806eb2031a',
		},

		cannotRenoteDueToVisibility: {
			message: 'You can not Renote due to target visibility.',
			code: 'CANNOT_RENOTE_DUE_TO_VISIBILITY',
			id: 'be9529e9-fe72-4de0-ae43-0b363c4938af',
		},

		noSuchReplyTarget: {
			message: 'No such reply target.',
			code: 'NO_SUCH_REPLY_TARGET',
			id: '749ee0f6-d3da-459a-bf02-282e2da4292c',
		},

		cannotReplyToInvisibleNote: {
			message: 'You cannot reply to an invisible Note.',
			code: 'CANNOT_REPLY_TO_AN_INVISIBLE_NOTE',
			id: 'b98980fa-3780-406c-a935-b6d0eeee10d1',
		},

		cannotReplyToPureRenote: {
			message: 'You can not reply to a pure Renote.',
			code: 'CANNOT_REPLY_TO_A_PURE_RENOTE',
			id: '3ac74a84-8fd5-4bb0-870f-01804f82ce15',
		},

		cannotReplyToSpecifiedVisibilityNoteWithExtendedVisibility: {
			message: 'You cannot reply to a specified visibility note with extended visibility.',
			code: 'CANNOT_REPLY_TO_SPECIFIED_VISIBILITY_NOTE_WITH_EXTENDED_VISIBILITY',
			id: 'ed940410-535c-4d5e-bfa3-af798671e93c',
		},

		cannotCreateAlreadyExpiredPoll: {
			message: 'Poll is already expired.',
			code: 'CANNOT_CREATE_ALREADY_EXPIRED_POLL',
			id: '04da457d-b083-4055-9082-955525eda5a5',
		},

		noSuchChannel: {
			message: 'No such channel.',
			code: 'NO_SUCH_CHANNEL',
			id: 'b1653923-5453-4edc-b786-7c4f39bb0bbb',
		},

		youHaveBeenBlocked: {
			message: 'You have been blocked by this user.',
			code: 'YOU_HAVE_BEEN_BLOCKED',
			id: 'b390d7e1-8a5e-46ed-b625-06271cafd3d3',
		},

		noSuchFile: {
			message: 'Some files are not found.',
			code: 'NO_SUCH_FILE',
			id: 'b6992544-63e7-67f0-fa7f-32444b1b5306',
		},

		cannotRenoteOutsideOfChannel: {
			message: 'Cannot renote outside of channel.',
			code: 'CANNOT_RENOTE_OUTSIDE_OF_CHANNEL',
			id: '33510210-8452-094c-6227-4a6c05d99f00',
		},

		containsProhibitedWords: {
			message: 'Cannot post because it contains prohibited words.',
			code: 'CONTAINS_PROHIBITED_WORDS',
			id: 'aa6e01d3-a85c-669d-758a-76aab43af334',
		},

		containsTooManyMentions: {
			message: 'Cannot post because it exceeds the allowed number of mentions.',
			code: 'CONTAINS_TOO_MANY_MENTIONS',
			id: '4de0363a-3046-481b-9b0f-feff3e211025',
		},

		noSuchNoteDraft: {
			message: 'No such note draft.',
			code: 'NO_SUCH_NOTE_DRAFT',
			id: '49cd6b9d-848e-41ee-b0b9-adaca711a6b1',
		},

		accessDenied: {
			message: 'Access denied.',
			code: 'ACCESS_DENIED',
			id: '56f35758-7dd5-468b-8439-5d6fb8ec9b8e',
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

	limit: {
		duration: ms('1hour'),
		max: 300,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		draftId: { type: 'string', nullable: false, format: 'misskey:id' },
		visibility: { type: 'string', enum: ['public', 'home', 'followers', 'specified'], default: 'public' },
		visibleUserIds: { type: 'array', uniqueItems: true, items: {
			type: 'string', format: 'misskey:id',
		} },
		cw: { type: 'string', nullable: true, minLength: 1, maxLength: 100 },
		disableRightClick: { type: 'boolean', default: false },
		hashtag: { type: 'string', nullable: true, maxLength: 200 },
		localOnly: { type: 'boolean', default: false },
		reactionAcceptance: { type: 'string', nullable: true, enum: [null, 'likeOnly', 'likeOnlyForRemote', 'nonSensitiveOnly', 'nonSensitiveOnlyForLocalLikeOnlyForRemote'], default: null },
		replyId: { type: 'string', format: 'misskey:id', nullable: true },
		renoteId: { type: 'string', format: 'misskey:id', nullable: true },
		channelId: { type: 'string', format: 'misskey:id', nullable: true },

		// anyOf内にバリデーションを書いても最初の一つしかチェックされない
		// See https://github.com/misskey-dev/misskey/pull/10082
		text: {
			type: 'string',
			minLength: 0,
			maxLength: MAX_NOTE_TEXT_LENGTH,
			nullable: true,
		},
		fileIds: {
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
					minItems: 0,
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
		scheduledDelete: {
			type: 'object',
			nullable: true,
			properties: {
				deleteAt: { type: 'integer', nullable: true },
				deleteAfter: { type: 'integer', nullable: true, minimum: 1 },
			},
		},
	},
	required: ['draftId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.blockingsRepository)
		private blockingsRepository: BlockingsRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		private noteEntityService: NoteEntityService,
		private noteDraftService: NoteDraftService,
		private noteDraftEntityService: NoteDraftEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const draft = await this.noteDraftService.get(me, ps.draftId);

			if (draft == null) {
				throw new ApiError(meta.errors.noSuchNoteDraft);
			}

			if (draft.userId !== me.id) {
				throw new ApiError(meta.errors.accessDenied);
			}

			// TODO: ノートendpointのバリデーションとServiceとして共通化
			let visibleUsers: MiUser[] = [];
			if (ps.visibleUserIds) {
				visibleUsers = await this.usersRepository.findBy({
					id: In(ps.visibleUserIds),
				});
			}

			let files: MiDriveFile[] = [];
			const fileIds = ps.fileIds ?? null;
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

			let renote: MiNote | null = null;
			if (ps.renoteId != null) {
				// Fetch renote to note
				renote = await this.notesRepository.findOneBy({ id: ps.renoteId });

				if (renote == null) {
					throw new ApiError(meta.errors.noSuchRenoteTarget);
				} else if (isRenote(renote) && !isQuote(renote)) {
					throw new ApiError(meta.errors.cannotReRenote);
				}

				// Check blocking
				if (renote.userId !== me.id) {
					const blockExist = await this.blockingsRepository.exists({
						where: {
							blockerId: renote.userId,
							blockeeId: me.id,
						},
					});
					if (blockExist) {
						throw new ApiError(meta.errors.youHaveBeenBlocked);
					}
				}

				if (renote.visibility === 'followers' && renote.userId !== me.id) {
					// 他人のfollowers noteはreject
					throw new ApiError(meta.errors.cannotRenoteDueToVisibility);
				} else if (renote.visibility === 'specified') {
					// specified / direct noteはreject
					throw new ApiError(meta.errors.cannotRenoteDueToVisibility);
				}

				if (renote.channelId && renote.channelId !== ps.channelId) {
					// チャンネルのノートに対しリノート要求がきたとき、チャンネル外へのリノート可否をチェック
					// リノートのユースケースのうち、チャンネル内→チャンネル外は少数だと考えられるため、JOINはせず必要な時に都度取得する
					const renoteChannel = await this.channelsRepository.findOneBy({ id: renote.channelId });
					if (renoteChannel == null) {
						// リノートしたいノートが書き込まれているチャンネルが無い
						throw new ApiError(meta.errors.noSuchChannel);
					} else if (!renoteChannel.allowRenoteToExternal) {
						// リノート作成のリクエストだが、対象チャンネルがリノート禁止だった場合
						throw new ApiError(meta.errors.cannotRenoteOutsideOfChannel);
					}
				}
			}

			let reply: MiNote | null = null;
			if (ps.replyId != null) {
				// Fetch reply
				reply = await this.notesRepository.findOneBy({ id: ps.replyId });

				if (reply == null) {
					throw new ApiError(meta.errors.noSuchReplyTarget);
				} else if (isRenote(reply) && !isQuote(reply)) {
					throw new ApiError(meta.errors.cannotReplyToPureRenote);
				} else if (!await this.noteEntityService.isVisibleForMe(reply, me.id)) {
					throw new ApiError(meta.errors.cannotReplyToInvisibleNote);
				} else if (reply.visibility === 'specified' && ps.visibility !== 'specified') {
					throw new ApiError(meta.errors.cannotReplyToSpecifiedVisibilityNoteWithExtendedVisibility);
				}

				// Check blocking
				if (reply.userId !== me.id) {
					const blockExist = await this.blockingsRepository.exists({
						where: {
							blockerId: reply.userId,
							blockeeId: me.id,
						},
					});
					if (blockExist) {
						throw new ApiError(meta.errors.youHaveBeenBlocked);
					}
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

			let channel: MiChannel | null = null;
			if (ps.channelId != null) {
				channel = await this.channelsRepository.findOneBy({ id: ps.channelId, isArchived: false });

				if (channel == null) {
					throw new ApiError(meta.errors.noSuchChannel);
				}
			}

			await this.noteDraftService.update(me, draft.id, {
				files: files,
				poll: ps.poll ? {
					choices: ps.poll.choices,
					multiple: ps.poll.multiple ?? false,
					expiresAt: ps.poll.expiresAt ? new Date(ps.poll.expiresAt) : null,
					expiredAfter: ps.poll.expiredAfter ?? null,
				} : undefined,
				event: ps.event ? {
					start: new Date(ps.event.start!),
					end: ps.event.end ? new Date(ps.event.end) : null,
					title: ps.event.title!,
					metadata: ps.event.metadata ?? {},
				} : undefined,
				text: ps.text ?? null,
				reply,
				renote,
				cw: ps.cw ?? null,
				...(ps.hashtag ? { hashtag: ps.hashtag } : {}),
				localOnly: ps.localOnly,
				reactionAcceptance: ps.reactionAcceptance,
				visibility: ps.visibility,
				visibleUsers,
				channel,
				disableRightClick: ps.disableRightClick,
				deleteAt: ps.scheduledDelete?.deleteAt ? new Date(ps.scheduledDelete.deleteAt) : ps.scheduledDelete?.deleteAfter ? new Date(Date.now() + ps.scheduledDelete.deleteAfter) : null,
			});

			const updatedDraft = await this.noteDraftEntityService.pack(draft, me);

			return {
				updatedDraft,
			};
		});
	}
}
