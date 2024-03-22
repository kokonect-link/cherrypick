/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, esurio
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Brackets } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import type { NotesRepository, ChannelFollowingsRepository, FollowingsRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import ActiveUsersChart from '@/core/chart/charts/active-users.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { DI } from '@/di-symbols.js';
import { RoleService } from '@/core/RoleService.js';
import { IdService } from '@/core/IdService.js';
import { CacheService } from '@/core/CacheService.js';
import { FanoutTimelineName } from '@/core/FanoutTimelineService.js';
import { QueryService } from '@/core/QueryService.js';
import { UserFollowingService } from '@/core/UserFollowingService.js';
import { MetaService } from '@/core/MetaService.js';
import { MiLocalUser } from '@/models/User.js';
import { FanoutTimelineEndpointService } from '@/core/FanoutTimelineEndpointService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,
	kind: 'read:account',

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Note',
		},
	},

	errors: {
		mtlDisabled: {
			message: 'Media timeline has been disabled.',
			code: 'MTL_DISABLED',
			id: 'c1626132-e2ca-11ee-8f65-00155dc875d3',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		sinceDate: { type: 'integer' },
		untilDate: { type: 'integer' },
		withFiles: { type: 'boolean', default: false },
		withRenotes: { type: 'boolean', default: true },
		withReplies: { type: 'boolean', default: false },
		withCats: { type: 'boolean', default: false },
		fileType: { type: 'array', items: { type: 'string' } },
		excludeNsfw: { type: 'boolean', default: false },
		onlyNsfw: { type: 'boolean', default: false },
		onlyFollowees: { type: 'boolean', default: false },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.channelFollowingsRepository)
		private channelFollowingsRepository: ChannelFollowingsRepository,

		private noteEntityService: NoteEntityService,
		private roleService: RoleService,
		private activeUserschart: ActiveUsersChart,
		private idService: IdService,
		private cacheService: CacheService,
		private queryService: QueryService,
		private metaService: MetaService,
		private userFollowingService: UserFollowingService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const policies = await this.roleService.getUserPolicies(me ? me.id : null);

			if (!policies.gtlAvailable) {
				throw new ApiError(meta.errors.mtlDisabled);
			}

			const followee = await this.userFollowingService.getFollowees(me.id);
			const followingChannels = await this.channelFollowingsRepository.find({
				where: {
					followerId: me.id,
				},
			});

			const query = this.queryService.makePaginationQuery(this.notesRepository.createQueryBuilder('note'),
				ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
				.andWhere('note.visibility = \'public\'')
				.andWhere('note.fileIds != \'{}\'')
				.innerJoinAndSelect('note.user', 'user')
				.leftJoinAndSelect('note.reply', 'reply')
				.leftJoinAndSelect('note.renote', 'renote')
				.leftJoinAndSelect('reply.user', 'renoteUser');

			if (followingChannels.length > 0) {
				const followingChannelIds = followingChannels.map(x => x.followeeId);

				query.andWhere(new Brackets(qb => {
					qb.where('note.channelId IN (:...followingChannelIds)', { followingChannelIds });
					qb.orWhere('note.channelId IS NULL');
				}));
			} else {
				query.andWhere('note.channelId IS NULL');
			}

			if (!ps.withReplies) {
				query.andWhere(new Brackets(qb => {
					qb.where('note.replyId IS NULL')
						.orWhere(new Brackets(qb => {
							qb.where('note.replyId IS NOT NULL')
								.andWhere('note.replyUserId = note.userId');
						}));
				}));
			}

			if (ps.onlyNsfw) {
				query.andWhere('note.cw != \'{}\'');
				query.andWhere('0 < (SELECT COUNT(*) FROM drive_file df WHERE df.id = ANY(note."fileIds") AND df."isSensitive" = TRUE)' );
			}

			if (ps.onlyFollowees) {
				query.andWhere(new Brackets(qb => {
					if (followee.length > 0) {
						const meOrFolloweeIds = [me.id, ...followee.map(f => f.followeeId)];
						qb.orWhere('note.userId IN (:...meOrFolloweeIds)', { meOrFolloweeIds: meOrFolloweeIds });
						qb.orWhere('(note.visibility = \'public\') AND (note.userHost IS NULL) ');
					} else {
						qb.
					}
				}));
			}

			this.queryService.generateVisibilityQuery(query, me);
			this.queryService.generateMutedUserQuery(query, me);
			this.queryService.generateBlockedUserQuery(query, me);
			this.queryService.generateMutedUserRenotesQueryForNotes(query, me);
		});
	}
}
