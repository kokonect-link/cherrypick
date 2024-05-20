/**
 * SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Client as OpenSearch } from '@opensearch-project/opensearch';
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
import { LoggerService } from '@/core/LoggerService.js';

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

function compileValue(value: V): string {
	if (typeof value === 'string' ) {
		return `'${value}'`;
	} else if (typeof value === 'number' ) {
		return value.toString();
	} else if (typeof value === 'boolean' ) {
		return value.toString();
	}
	throw new Error('unrecognized value');
}

function compileQuery(q: Q): string {
	switch (q.op) {
		case '=': return `(${q.k} = ${compileValue(q.v)})`;
		case '!=': return `(${q.k} != ${compileValue(q.v)})`;
		case '>': return `(${q.k} > ${compileValue(q.v)})`;
		case '<': return `(${q.k} < ${compileValue(q.v)})`;
		case '>=': return `(${q.k} >= ${compileValue(q.v)})`;
		case '<=': return `(${q.k} <= ${compileValue(q.v)})`;
		case 'and': return q.qs.length === 0 ? '' : `(${ q.qs.map(_q => compileQuery(_q)).join(' AND ') })`;
		case 'or': return q.qs.length === 0 ? '' : `(${ q.qs.map(_q => compileQuery(_q)).join(' OR ')})`;
		case 'is null': return `(${q.k} IS NULL)`;
		case 'is not null': return `(${q.k} IS NOT NULL)`;
		case 'not': return `(NOT ${compileQuery(q.q)})`;
		default: throw new Error('unrecognized query operator');
	}
}

@Injectable()
export class AdvancedSearchService {
	private opensearchNoteIndex: string | null = null;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.opensearch)
		private opensearch: OpenSearch | null,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private cacheService: CacheService,
		private queryService: QueryService,
		private idService: IdService,
		private loggerService: LoggerService,
	) {
		if (opensearch && config.opensearch && config.opensearch.index) {
			const indexname = `${config.opensearch.index}---notes`;
			this.opensearchNoteIndex = indexname;

			this.opensearch?.indices.exists({
				index: indexname,
			}).then((indexExists) => {
				if (!indexExists) [
					this.opensearch?.indices.create({
						index: indexname + `-${new Date().toISOString().slice(0, 7).split(/-/g).join('')}` + `-${randomUUID()}`,
						body: {
							mappings: {
								properties: {
									text: { type: 'text' },
									cw: { type: 'text' },
									userId: { type: 'keyword' },
									userHost: { type: 'keyword' },
									channelId: { type: 'keyword' },
									tags: { type: 'keyword' },
									replyId: { type: 'keyword' },
									fileId: { type: 'keyword' },
								},
							},
							settings: {
								// TODO: いい感じにする
								index: {
									analysis: {
										tokenizer: {
											sudachi_c_tokenizer: {
												type: 'sudachi_tokenizer',
												additional_settings: '',
												split_mode: 'C',
												discard_punctuation: true,
											},
											sudachi_b_tokenizer: {
												type: 'sudachi_tokenizer',
												additional_settings: '',
												split_mode: 'B',
												discard_punctuation: true,
											},
											sudachi_a_tokenizer: {
												type: 'sudachi_tokenizer',
												additional_settings: '',
												split_mode: 'A',
												discard_punctuation: true,
											},
										},
										analyzer: {
											c_analyzer: {
												filter: [],
												tokenizer: 'sudachi_c_tokenizer',
												type: 'custom',
											},
											b_analyzer: {
												filter: [],
												tokenizer: 'sudachi_b_tokenizer',
												type: 'custom',
											},
											a_normalization_analyzer: {
												filter: [],
												tokenizer: 'sudachi_a_tokenizer',
												type: 'custom',
											},
										},
									},
								},
							},
						},
					}).catch((error) => {
						console.error(error);
					}),
				];
			}).catch((error) => {
				console.error(error);
			});
		} else {
			console.error('OpenSearch is not available');
			this.opensearchNoteIndex = null;
		}
	}

	@bindThis
	public async indexNote(note: MiNote): Promise<void> {
		if (note.text == null && note.cw == null) return;
		if (!['home', 'public', 'followers'].includes(note.visibility)) return;

		if (this.opensearch) {
			const body = {
				text: note.text,
				cw: note.cw,
				userId: note.userId,
				userHost: note.userHost,
				channelId: note.channelId,
				createdAt: this.idService.parse(note.id).date.getTime(),
				tags: note.tags,
				replyId: note.replyId,
			};

			await this.opensearch.index({
				index: this.opensearchNoteIndex + `-${new Date().toISOString().slice(0, 7).split(/-/g).join('')}` + `${randomUUID()}` as string,
				id: note.id,
				body: body,
			}).catch((error) => {
				console.error(error);
			});
		}
	}

	@bindThis
	public async fullIndexNote(): Promise<void> {
		const notesCount = await this.notesRepository.createQueryBuilder('note').where('note.userHost IS NULL').getCount();
		const limit = 100;
		let latestid = '';
		for (let index = 0; index < notesCount; index += limit) {
			const notes = await this.notesRepository
				.createQueryBuilder('note')
				.where('note.userHost IS NULL')
				.andWhere('note.id > :latestid', { latestid })
				.orderBy('note.id', 'ASC')
				.limit(limit)
				.getMany();
			notes.forEach(note => {
				this.indexNote(note);
				latestid = note.id;
			});
		}
		this.loggerService.getLogger('search').info('All notes has been indexed.');
	}

	@bindThis
	public async unindexNote(note: MiNote): Promise<void> {
		if (!['home', 'public', 'followers'].includes(note.visibility)) return;

		if (this.opensearch) {
			this.opensearch.delete({
				index: this.opensearchNoteIndex + `-${new Date().toISOString().slice(0, 7).split(/-/g).join('')}` + `${randomUUID()}` as string,
				id: note.id,
			}).catch((error) => {
				console.error(error);
			});
		}
	}

	@bindThis
	public async searchNote(q: string, me: MiUser | null, opts: {
		userId?: MiNote['userId'] | null;
		channelId?: MiNote['channelId'] | null;
		host?: string | null;
		origin?: string | null;
		fileOption?: string | null;
		visibility?: MiNote['visibility'] | null;
		excludeNsfw?: boolean;
		excludeReply?: boolean;
	}, pagination: {
		untilId?: MiNote['id'];
		sinceId?: MiNote['id'];
		limit?: number;
	}): Promise<MiNote[]> {
		if (this.opensearch) {
			const osFilter: any = {
				bool: {
					must: [],
				},
			};

			if (pagination.untilId) osFilter.bool.must.push({ range: { createdAt: { lt: this.idService.parse(pagination.untilId).date.getTime() } } });
			if (pagination.sinceId) osFilter.bool.must.push({ range: { createdAt: { gt: this.idService.parse(pagination.sinceId).date.getTime() } } });
			if (opts.userId) osFilter.bool.must.push({ term: { userId: opts.userId } });
			if (opts.channelId) osFilter.bool.must.push({ term: { channelId: opts.channelId } });
			if (opts.host) {
				if (opts.host === '.') {
					osFilter.bool.must.push({ term: { must_not: [{ exists: { field: 'userHost' } }] } });
				} else {
					osFilter.bool.must.push({ term: { userHost: opts.host } });
				}
			}
			if (opts.excludeReply) osFilter.bool.must.push({ term: { must_not: [{ exists: { field: 'replyId' } }] } });
			if (opts.excludeNsfw) osFilter.bool.must.push({ term: { must_not: [{ exists: { field: 'cw' } }] } });
			if (opts.fileOption) {
				if (opts.fileOption === 'file-only') {
					osFilter.bool.must.push({ term: { must: [{ exists: { field: 'fileId' } }] } });
				} else if (opts.fileOption === 'no-file') {
					osFilter.bool.must.push({ term: { must_not: [{ exists: { field: 'fileId' } }] } });
				}
			}

			if (q !== '') {
				osFilter.bool.must.push({
					bool: {
						should: [
							{ wildcard: { 'text': { value: q } } },
							{ simple_query_string: { fields: ['text'], 'query': q, default_operator: 'and' } },
							{ wildcard: { 'cw': { value: q } } },
							{ simple_query_string: { fields: ['cw'], 'query': q, default_operator: 'and' } },
						],
						minimum_should_match: 1,
					},
				});
			}

			const res = await this.opensearch.search({
				index: this.opensearchNoteIndex + `-${new Date().toISOString().slice(0, 7).split(/-/g).join('')}` + `${randomUUID()}` as string,
				body: {
					query: osFilter,
					sort: [{ createdAt: { order: 'desc' } }],
				},
				_source: ['id', 'createdAt'],
				size: pagination.limit,
			});

			const noteIds = res.body.hits.hits.map((hit: any) => hit._id);
			if (noteIds.length === 0) return [];
			const [
				userIdsWhoMeMuting,
				userIdsWhoMeBlockingMe,
			] = me ? await Promise.all([
				this.cacheService.userMutingsCache.fetch(me.id),
				this.cacheService.userBlockedCache.fetch(me.id),
			]) : [new Set<string>(), new Set<string>()];
			const notes = (await this.notesRepository.findBy({
				id: In(noteIds),
			})).filter(note => {
				if (me && isUserRelated(note, userIdsWhoMeMuting)) return false;
				if (me && isUserRelated(note, userIdsWhoMeBlockingMe)) return false;
				return true;
			});

			return notes.sort((a, b) => a.id > b.id ? -1 : 1);
		} else {
			const query = this.queryService.makePaginationQuery(this.notesRepository.createQueryBuilder('note'), pagination.sinceId, pagination.untilId);

			if (opts.userId) {
				query.andWhere('note.userId = :userId', { userId: opts.userId });
			} else if (opts.channelId) {
				query.andWhere('note.channelId = :channelId', { channelId: opts.channelId });
			}

			if (opts.origin === 'local') {
				query.andWhere('note.userHost IS NULL');
			} else if (opts.origin === 'remote') {
				query.andWhere('note.userHost IS NOT NULL');
			}

			if (this.config.pgroonga) {
				query.andWhere('note.text &@~ :q', { q: `%${sqlLikeEscape(q)}%` });
			} else {
				query.andWhere('note.text ILIKE :q', { q: `%${sqlLikeEscape(q)}%` });
			}

			query
				.innerJoinAndSelect('note.user', 'user')
				.leftJoinAndSelect('note.reply', 'reply')
				.leftJoinAndSelect('note.renote', 'renote')
				.leftJoinAndSelect('reply.user', 'replyUser')
				.leftJoinAndSelect('renote.user', 'renoteUser');

			if (opts.host) {
				if (opts.host === '.') {
					query.andWhere('note.userHost IS NULL');
				} else {
					query.andWhere('note.userHost = :host', { host: opts.host });
				}
			}

			if (opts.visibility) {
				if (opts.visibility === 'home') {
					query.andWhere('(note.visibility = \'home\')');
				} else if (opts.visibility === 'followers') {
					query.andWhere('(note.visibility = \'followers\')');
				} else if (opts.visibility === 'public') {
					query.andWhere('(note.visibility === \'public\')');
				}
			}

			if (opts.excludeNsfw) {
				query.andWhere('note.cw IS NULL');
			}

			if (opts.excludeReply) {
				query.andWhere('note.replyId IS NULL');
			}

			if (opts.fileOption) {
				if (opts.fileOption === 'file-only') {
					query.andWhere('note.fileIds != \'{}\'');
				} else if (opts.fileOption === 'no-file') {
					query.andWhere('note.fileIds = :fIds', { fIds: '{}' });
				}
			}

			this.queryService.generateVisibilityQuery(query, me);
			if (me) this.queryService.generateMutedUserQuery(query, me);
			if (me) this.queryService.generateBlockedUserQuery(query, me);

			return await query.limit(pagination.limit).getMany();
		}
	}
}
