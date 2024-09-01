/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { DI } from '@/di-symbols.js';
import type { Packed } from '@/misc/json-schema.js';
import { awaitAll } from '@/misc/prelude/await-all.js';
import type { MiUser } from '@/models/User.js';
import type { MiNote } from '@/models/Note.js';
import type { UsersRepository, NotesRepository, FollowingsRepository, PollsRepository, PollVotesRepository, NoteReactionsRepository, ChannelsRepository, NoteHistoryRepository } from '@/models/_.js';
import { bindThis } from '@/decorators.js';
import { DebounceLoader } from '@/misc/loader.js';
import { IdService } from '@/core/IdService.js';
import { NoteHistory } from '@/models/NoteHistory.js';
import type { OnModuleInit } from '@nestjs/common';
import type { CustomEmojiService } from '../CustomEmojiService.js';
import type { UserEntityService } from './UserEntityService.js';
import type { DriveFileEntityService } from './DriveFileEntityService.js';

@Injectable()
export class NoteHistoryEntityService implements OnModuleInit {
	private userEntityService: UserEntityService;
	private driveFileEntityService: DriveFileEntityService;
	private customEmojiService: CustomEmojiService;
	private idService: IdService;
	private historyLoader = new DebounceLoader(this.findNoteHistoryOrFail);

	constructor(
		private moduleRef: ModuleRef,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.noteHistoryRepository)
		private noteHistoryRepository: NoteHistoryRepository,

		@Inject(DI.followingsRepository)
		private followingsRepository: FollowingsRepository,

		//private userEntityService: UserEntityService,
		//private driveFileEntityService: DriveFileEntityService,
		//private customEmojiService: CustomEmojiService,
		//private reactionService: ReactionService,
	) {
	}

	onModuleInit() {
		this.userEntityService = this.moduleRef.get('UserEntityService');
		this.driveFileEntityService = this.moduleRef.get('DriveFileEntityService');
		this.customEmojiService = this.moduleRef.get('CustomEmojiService');
		this.idService = this.moduleRef.get('IdService');
	}

	@bindThis
	public async packAttachedFiles(fileIds: NoteHistory['fileIds'], packedFiles: Map<NoteHistory['fileIds'][number], Packed<'DriveFile'> | null>): Promise<Packed<'DriveFile'>[]> {
		const missingIds = [];
		for (const id of fileIds) {
			if (!packedFiles.has(id)) missingIds.push(id);
		}
		if (missingIds.length) {
			const additionalMap = await this.driveFileEntityService.packManyByIdsMap(missingIds);
			for (const [k, v] of additionalMap) {
				packedFiles.set(k, v);
			}
		}
		return fileIds.map(id => packedFiles.get(id)).filter(x => x != null);
	}

	@bindThis
	private async pack(
		src: NoteHistory['id'],
		host: MiNote['userHost'],
		options?: {
			_hint_?: {
				packedFiles: Map<NoteHistory['fileIds'][number], Packed<'DriveFile'> | null>;
			};
		},
	): Promise<Packed<'NoteHistory'>> {
		const history = await this.historyLoader.load(src);

		const text = history.text;
		const packedFiles = options?._hint_?.packedFiles;

		const packed: Packed<'NoteHistory'> = await awaitAll({
			id: history.id,
			noteId: history.noteId,
			createdAt: history.createdAt.toISOString(),
			updatedAt: history.updatedAt.toISOString(),
			userId: history.userId,
			text: text,
			visibility: history.visibility,
			visibleUserIds: history.visibility === 'specified' ? history.visibleUserIds : undefined,
			emojis: host != null ? this.customEmojiService.populateEmojis(history.emojis, host) : undefined,
			fileIds: history.fileIds,
			files: packedFiles != null ? this.packAttachedFiles(history.fileIds, packedFiles) : this.driveFileEntityService.packManyByIds(history.fileIds),
		});

		return packed;
	}

	@bindThis
	public async packMany (
		histories: NoteHistory[],
		noteHost: MiNote['userHost'] | null,
		me?: MiUser | null,
	): Promise<Packed<'NoteHistory'>[]> {
		const packed: Packed<'NoteHistory'>[] = [];
		const meId = me?.id ?? null;
		for (const history of histories) {
			const packed_history = await this.pack(history.id, noteHost);
			const isVisibleForMe = await this.isVisible(packed_history, meId);
			if (isVisibleForMe) {
				packed.push(packed_history);
			}
		}
		return packed;
	}

	@bindThis
	private findNoteHistoryOrFail(id: string): Promise<NoteHistory> {
		return this.noteHistoryRepository.findOneOrFail({
			where: { id },
		});
	}

	@bindThis
	private async isVisible(packedHistory: Packed<'NoteHistory'>, meId: MiUser['id'] | null) {
		let hide = false;
		if (packedHistory.visibility === 'specified') {
			if (meId == null) {
				hide = true;
			} else if (meId === packedHistory.userId) {
				hide = false;
			} else {
				const specified = packedHistory.visibleUserIds?.some((id: string) => meId === id);
				if (specified) {
					hide = false;
				} else {
					hide = true;
				}
			}
		}
		if (packedHistory.visibility === 'followers') {
			if (meId == null) {
				hide = true;
			} else if (meId === packedHistory.userId) {
				hide = false;
			} else {
				const isFollowing = await this.followingsRepository.exists({
					where: {
						followeeId: packedHistory.userId,
						followerId: meId,
					},
				});

				hide = !isFollowing;
			}
		}
		if (packedHistory.userId === meId) {
			hide = false;
		}
		return !hide;
	}
}
