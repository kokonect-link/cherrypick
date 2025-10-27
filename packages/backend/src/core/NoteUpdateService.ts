/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setImmediate } from 'node:timers/promises';
import util from 'util';
import { In, DataSource } from 'typeorm';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import * as mfm from 'mfc-js';
import type { IMentionedRemoteUsers } from '@/models/Note.js';
import { MiNote } from '@/models/Note.js';
import { MiEvent } from '@/models/Event.js';
import type { IEvent } from '@/models/Event.js';
import type { NotesRepository, UsersRepository } from '@/models/_.js';
import type { MiUser, MiLocalUser, MiRemoteUser } from '@/models/User.js';
import { RelayService } from '@/core/RelayService.js';
import { DI } from '@/di-symbols.js';
import ActiveUsersChart from '@/core/chart/charts/active-users.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { QueueService } from '@/core/QueueService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { ApRendererService } from '@/core/activitypub/ApRendererService.js';
import { ApDeliverManagerService } from '@/core/activitypub/ApDeliverManagerService.js';
import { bindThis } from '@/decorators.js';
import { DB_MAX_NOTE_TEXT_LENGTH } from '@/const.js';
import { SearchService } from '@/core/SearchService.js';
import { normalizeForSearch } from '@/misc/normalize-for-search.js';
import { MiDriveFile } from '@/models/_.js';
import { MiPoll, IPoll } from '@/models/Poll.js';
import { concat } from '@/misc/prelude/array.js';
import { extractHashtags } from '@/misc/extract-hashtags.js';
import { extractCustomEmojisFromMfm } from '@/misc/extract-custom-emojis-from-mfm.js';
import { NoteHistorySerivce } from './NoteHistoryService.js';

type Option = {
	updatedAt?: Date | null;
	files?: MiDriveFile[] | null;
	name?: string | null;
	text?: string | null;
	disableRightClick?: boolean | null;
	cw?: string | null;
	apHashtags?: string[] | null;
	apEmojis?: string[] | null;
	poll?: IPoll | null;
	event?: IEvent | null;
	deleteAt?: Date | null;
};

@Injectable()
export class NoteUpdateService implements OnApplicationShutdown {
	#shutdownController = new AbortController();

	constructor(
		@Inject(DI.db)
		private db: DataSource,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private userEntityService: UserEntityService,
		private globalEventService: GlobalEventService,
		private queueService: QueueService,
		private relayService: RelayService,
		private apDeliverManagerService: ApDeliverManagerService,
		private apRendererService: ApRendererService,
		private searchService: SearchService,
		private activeUsersChart: ActiveUsersChart,
		private noteHistoryService: NoteHistorySerivce,
	) { }

	@bindThis
	public async update(user: {
		id: MiUser['id'];
		username: MiUser['username'];
		host: MiUser['host'];
		isBot: MiUser['isBot'];
	}, data: Option, note: MiNote, silent = false): Promise<MiNote | null> {
		if (data.updatedAt == null) data.updatedAt = new Date();

		if (data.text) {
			if (data.text.length > DB_MAX_NOTE_TEXT_LENGTH) {
				data.text = data.text.slice(0, DB_MAX_NOTE_TEXT_LENGTH);
			}
			data.text = data.text.trim();
		} else {
			data.text = null;
		}

		let tags = data.apHashtags;
		let emojis = data.apEmojis;

		// Parse MFM if needed
		if (!tags || !emojis) {
			const tokens = data.text ? mfm.parse(data.text)! : [];
			const cwTokens = data.cw ? mfm.parse(data.cw)! : [];
			const choiceTokens = data.poll && data.poll.choices
				? concat(data.poll.choices.map(choice => mfm.parse(choice)!))
				: [];

			const combinedTokens = tokens.concat(cwTokens).concat(choiceTokens);

			tags = data.apHashtags ?? extractHashtags(combinedTokens);

			emojis = data.apEmojis ?? extractCustomEmojisFromMfm(combinedTokens);
		}

		tags = tags.filter(tag => Array.from(tag ?? '').length <= 128).splice(0, 32);

		const updatedNote = await this.updateNote(user, note, data, tags, emojis);

		if (updatedNote) {
			setImmediate('post updated', { signal: this.#shutdownController.signal }).then(
				() => this.postNoteUpdated(updatedNote, user, silent),
				() => { /* aborted, ignore this */ },
			);
		}

		return updatedNote;
	}

	@bindThis
	private async updateNote(user: {
		id: MiUser['id']; host: MiUser['host'];
	}, note: MiNote, data: Option, tags: string[], emojis: string[]): Promise<MiNote | null> {
		const updatedAtHistory = note.updatedAtHistory ? note.updatedAtHistory : [];

		const values = new MiNote({
			updatedAt: data.updatedAt,
			fileIds: data.files ? data.files.map(file => file.id) : [],
			text: data.text,
			hasPoll: data.poll != null,
			hasEvent: data.event != null,
			cw: data.cw ?? null,
			tags: tags.map(tag => normalizeForSearch(tag)),
			emojis,
			disableRightClick: data.disableRightClick!,
			attachedFileTypes: data.files ? data.files.map(file => file.type) : [],
			updatedAtHistory: [...updatedAtHistory, new Date()],
			deleteAt: data.deleteAt!,
		});

		// 投稿を更新
		try {
			const [originalPoll, originalEvent] = await Promise.all([
				note.hasPoll
					? this.db.getRepository(MiPoll).findOneBy({ noteId: note.id }).then(poll =>
						poll ? {
							choices: poll.choices,
							multiple: poll.multiple,
							expiresAt: poll.expiresAt,
						} : null,
					)
					: Promise.resolve(null),
				note.hasEvent
					? this.db.getRepository(MiEvent).findOneBy({ noteId: note.id }).then(event =>
						event ? {
							title: event.title,
							start: event.start,
							end: event.end,
							metadata: event.metadata,
						} : null,
					)
					: Promise.resolve(null),
			]);

			// Start transaction for any poll or event changes
			const needsTransaction = note.hasPoll || values.hasPoll || note.hasEvent || values.hasEvent;

			if (needsTransaction) {
				await this.db.transaction(async transactionalEntityManager => {
					await transactionalEntityManager.update(MiNote, { id: note.id }, values);

					if (note.hasPoll && values.hasPoll) {
						const old_poll = await transactionalEntityManager.findOneBy(MiPoll, { noteId: note.id });
						if (old_poll && (old_poll.choices.toString() !== data.poll!.choices.toString() || old_poll.multiple !== data.poll!.multiple)) {
							await transactionalEntityManager.delete(MiPoll, { noteId: note.id });
							const poll = new MiPoll({
								noteId: note.id,
								choices: data.poll!.choices,
								expiresAt: data.poll!.expiresAt,
								multiple: data.poll!.multiple,
								votes: new Array(data.poll!.choices.length).fill(0),
								noteVisibility: note.visibility,
								userId: user.id,
								userHost: user.host,
							});
							await transactionalEntityManager.insert(MiPoll, poll);
						}
					} else if (!note.hasPoll && values.hasPoll) {
						const poll = new MiPoll({
							noteId: note.id,
							choices: data.poll!.choices,
							expiresAt: data.poll!.expiresAt,
							multiple: data.poll!.multiple,
							votes: new Array(data.poll!.choices.length).fill(0),
							noteVisibility: note.visibility,
							userId: user.id,
							userHost: user.host,
						});
						await transactionalEntityManager.insert(MiPoll, poll);
					} else if (note.hasPoll && !values.hasPoll) {
						// Remove poll
						await transactionalEntityManager.delete(MiPoll, { noteId: note.id });
					}

					if (note.hasEvent && values.hasEvent) {
						const old_event = await transactionalEntityManager.findOneBy(MiEvent, { noteId: note.id });
						if (old_event && (
							old_event.start !== data.event!.start ||
							old_event.end !== data.event!.end ||
							old_event.title !== data.event!.title ||
							old_event.metadata !== data.event!.metadata
						)) {
							await transactionalEntityManager.delete(MiEvent, { noteId: note.id });
							const event = new MiEvent({
								noteId: note.id,
								title: data.event!.title,
								start: data.event!.start,
								end: data.event!.end ?? undefined,
								metadata: data.event!.metadata,
								noteVisibility: note.visibility,
								userId: user.id,
								userHost: user.host,
							});
							await transactionalEntityManager.insert(MiEvent, event);
						}
					} else if (!note.hasEvent && values.hasEvent) {
						const event = new MiEvent({
							noteId: note.id,
							title: data.event!.title,
							start: data.event!.start,
							end: data.event!.end ?? undefined,
							metadata: data.event!.metadata,
							noteVisibility: note.visibility,
							userId: user.id,
							userHost: user.host,
						});
						await transactionalEntityManager.insert(MiEvent, event);
					} else if (note.hasEvent && !values.hasEvent) {
						await transactionalEntityManager.delete(MiEvent, { noteId: note.id });
					}
				});
			} else {
				await this.notesRepository.update({ id: note.id }, values);
			}

			await this.noteHistoryService.recordHistory(values, note, originalPoll, originalEvent, { updatedAt: data.updatedAt });

			return await this.notesRepository.findOneBy({ id: note.id });
		} catch (e) {
			console.error(e);

			throw e;
		}
	}

	@bindThis
	private async postNoteUpdated(note: MiNote, user: {
		id: MiUser['id'];
		username: MiUser['username'];
		host: MiUser['host'];
		isBot: MiUser['isBot'];
	}, silent: boolean) {
		if (!silent) {
			if (this.userEntityService.isLocalUser(user)) this.activeUsersChart.write(user);

			if (note.deleteAt) {
				const delay = note.deleteAt.getTime() - Date.now();
				await this.queueService.scheduledNoteDeleteQueue.remove(note.id);
				await this.queueService.scheduledNoteDeleteQueue.add(note.id, {
					noteId: note.id,
				}, {
					delay,
					removeOnComplete: true,
				});
			}

			this.globalEventService.publishNoteStream(note.id, 'updated', { cw: note.cw, text: note.text, disableRightClick: note.disableRightClick, deleteAt: note.deleteAt });

			//#region AP deliver
			if (this.userEntityService.isLocalUser(user) && !note.localOnly) {
				await (async () => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					const noteActivity = await this.renderNoteActivity(note, user);

					await this.deliverToConcerned(user, note, noteActivity);
				})();
			}
			//#endregion
		}

		// Register to search database
		this.reIndex(note);
	}

	@bindThis
	private async renderNoteActivity(note: MiNote, user: MiUser) {
		const content = this.apRendererService.renderUpdate(await this.apRendererService.renderNote(note, false), user);

		return this.apRendererService.addContext(content);
	}

	@bindThis
	private async getMentionedRemoteUsers(note: MiNote) {
		const where = [] as any[];

		// mention / reply / dm
		const uris = (JSON.parse(note.mentionedRemoteUsers) as IMentionedRemoteUsers).map(x => x.uri);
		if (uris.length > 0) {
			where.push(
				{ uri: In(uris) },
			);
		}

		// renote / quote
		if (note.renoteUserId) {
			where.push({
				id: note.renoteUserId,
			});
		}

		if (where.length === 0) return [];

		return await this.usersRepository.find({
			where,
		}) as MiRemoteUser[];
	}

	@bindThis
	private async deliverToConcerned(user: { id: MiLocalUser['id']; host: null; }, note: MiNote, content: any) {
		console.log('deliverToConcerned', util.inspect(content, { depth: null }));
		await this.apDeliverManagerService.deliverToFollowers(user, content);
		await this.relayService.deliverToRelays(user, content);
		const remoteUsers = await this.getMentionedRemoteUsers(note);
		for (const remoteUser of remoteUsers) {
			await this.apDeliverManagerService.deliverToUser(user, content, remoteUser);
		}
	}

	@bindThis
	private reIndex(note: MiNote) {
		if (note.text == null && note.cw == null) return;

		this.searchService.unindexNote(note);
		this.searchService.indexNote(note);
	}

	@bindThis
	public dispose(): void {
		this.#shutdownController.abort();
	}

	@bindThis
	public onApplicationShutdown(signal?: string | undefined): void {
		this.dispose();
	}
}
