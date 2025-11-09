/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { FollowingsRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['account'],
	requireCredential: true,
	kind: 'read:following',

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			servers: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'object',
					optional: false, nullable: false,
					properties: {
						host: { type: 'string' },
						followersCount: { type: 'number' },
					},
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.followingsRepository)
		private followingsRepository: FollowingsRepository,
	) {
		super(meta, paramDef, async (ps, me) => {
			const serverStats = await this.followingsRepository
				.createQueryBuilder('following')
				.select('following.followerHost', 'host')
				.addSelect('COUNT(*)', 'followers_count')
				.where('following.followeeId = :userId', { userId: me.id })
				.andWhere('following.followerHost IS NOT NULL')
				.groupBy('following.followerHost')
				.orderBy('followers_count', 'DESC')
				.getRawMany();

			return {
				servers: serverStats.map(s => ({
					host: s.host,
					followersCount: Number(s.followers_count),
				})),
			};
		});
	}
}
