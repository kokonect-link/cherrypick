/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { bindThis } from '@/decorators.js';
import { MiNote } from '@/models/Note.js';
import { MiUser } from '@/models/_.js';
import type { NotesRepository } from '@/models/_.js';
import { sqlLikeEscape } from '@/misc/sql-like-escape.js';
import { isUserRelated } from '@/misc/is-user-related.js';
import { CacheService } from '@/core/CacheService.js';
import { QueryService } from '@/core/QueryService.js';
import { IdService } from '@/core/IdService.js';
import type { Index, MeiliSearch } from 'meilisearch';

type K = string;
type V = string | number | boolean;
type Q =
	{ op: '=', k: K, v: V } |
	{ op: '!=', k: K, v: V } |
	{ op: '>', k: K, v: number } |
	{ op: '<', k: K, v: number } |
	{ op: '>=', k: K, v: number } |
	{ op: '<=', k: K, v: number } |
	{ op: 'is null', k: K} |
	{ op: 'is not null', k: K} |
	{ op: 'and', qs: Q[] } |
	{ op: 'or', qs: Q[] } |
	{ op: 'not', q: Q };

@Injectable()
export class SearchService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private cacheService: CacheService,
		private queryService: QueryService,
		private idService: IdService,
	) {
	}

	/**
	 * TODO:
	 * 1. FTSの処理を書く
	 * 2. PGroongaの統合(Advanced Search廃止によるもの)
	 */

	@bindThis
	public async searchNote(q: string, me: MiUser | null, opts: {
		userId?: MiNote['userId'] | null;
		channelId?: MiNote['channelId'] | null;
		host?: string | null;
		fileOption?: string | null;
		excludeNsfw?: boolean;
		excludeBot?: boolean;
	}, pagination: {
		untilId?: MiNote['id'];
		sinceId?: MiNote['id'];
		limit?: number;
	}): Promise<MiNote[]> {
			const query = this.queryService.makePaginationQuery(this.notesRepository.createQueryBuilder('note'), pagination.sinceId, pagination.untilId);

			if (opts.userId) {
				query.andWhere('note.userId = :userId', { userId: opts.userId });
			} else if (opts.channelId) {
				query.andWhere('note.channelId = :channelId', { channelId: opts.channelId });
			}

			query
				.andWhere('note.text ILIKE :q', { q: `%${ sqlLikeEscape(q) }%` })
				.innerJoinAndSelect('note.user', 'user')
				.leftJoinAndSelect('note.reply', 'reply')
				.leftJoinAndSelect('note.renote', 'renote')
				.leftJoinAndSelect('reply.user', 'replyUser')
				.leftJoinAndSelect('renote.user', 'renoteUser')
				.andWhere('user.isIndexable = true')
				.andWhere('user.isSensitive = false');

			if (opts.host) {
				if (opts.host === '.') {
					query.andWhere('user.host IS NULL');
				} else {
					query.andWhere('user.host = :host', { host: opts.host });
				}
			}

			if (opts.fileOption) {
				if (opts.fileOption === 'fileOnly') {
					query.andWhere('note.fileIds != \'{}\' ')
				} else if (opts.fileOption === 'noFile') {
					query.andWhere('note.fileIds = \'{}\' ')
				}
			}

			if (opts.excludeNsfw) {
				query.andWhere('note.cw IS NULL');
				query.andWhere('0 = (SELECT COUNT(*) FROM drive_file df WHERE df.id = ANY(note."fileIds") AND df."isSensitive" = TRUE )');
			}

			if (opts.excludeBot) {
				query.andWhere(' (SELECT "isBot" FROM "user" WHERE id = note."userId") = FALSE ');
			}

			/**
			 * if (this.config.pgroonga) {
			 *	query.andWhere('note.text &@~ :q', { q: `%${sqlLikeEscape(q)}%` });
			 *} else {
			 *	query.andWhere('note.text ILIKE :q', { q: `%${sqlLikeEscape(q)}%` });
			 *}
			 * TODO: PGroongaの統合
			 */

			this.queryService.generateVisibilityQuery(query, me);
			if (me) this.queryService.generateMutedUserQuery(query, me);
			if (me) this.queryService.generateBlockedUserQuery(query, me);

			return await query.limit(pagination.limit).getMany();
	}
}
