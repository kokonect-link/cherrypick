/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { InstancesRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { MetaService } from '@/core/MetaService.js';

export const meta = {
	tags: ['federation'],

	requireCredential: false,

	allowGet: true,
	cacheSec: 60 * 60,

	res: {
		type: 'array',
		optional: false,
		nullable: false,
		items: {
			type: 'object',
			optional: false,
			nullable: false,
			properties: {
				softwareName: {
					type: 'string',
					optional: false,
					nullable: false,
				},
				color: {
					type: 'string',
					optional: false,
					nullable: true,
				},
				count: {
					type: 'integer',
					optional: false,
					nullable: false,
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		blocked: { type: 'boolean', nullable: true },
		notResponding: { type: 'boolean', nullable: true },
		suspended: { type: 'boolean', nullable: true },
		silenced: { type: 'boolean', nullable: true },
		federating: { type: 'boolean', nullable: true },
		subscribing: { type: 'boolean', nullable: true },
		publishing: { type: 'boolean', nullable: true },
		quarantined: { type: 'boolean', nullable: true },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.instancesRepository)
		private instancesRepository: InstancesRepository,

		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps) => {
			const query = this.instancesRepository
				.createQueryBuilder('instance')
				.select('"softwareName"');

			if (typeof ps.blocked === 'boolean' || typeof ps.silenced === 'boolean') {
				const meta = await this.metaService.fetch(true);

				if (typeof ps.blocked === 'boolean') {
					if (meta.blockedHosts.length === 0) return [];

					query.andWhere(`instance.host ${ ps.blocked ? 'IN' : 'NOT IN'} (:...blocked)`, {
						blocked: meta.blockedHosts,
					});
				}

				if (typeof ps.silenced === 'boolean') {
					if (meta.silencedHosts.length === 0) return [];

					query.andWhere(`instance.host ${ ps.silenced ? 'IN' : 'NOT IN'} (:...silences)`, {
						silences: meta.silencedHosts,
					});
				}
			}

			if (typeof ps.federating === 'boolean') {
				if (typeof ps.subscribing === 'boolean' && ps.subscribing !== ps.federating) return [];
				if (typeof ps.publishing === 'boolean' && ps.publishing !== ps.federating) return [];
				query.andWhere(ps.federating ?
					'(("followingCount" > 0) OR ("followersCount" > 0))' :
					'(("followingCount" = 0) AND ("followersCount" = 0))');
			} else {
				if (typeof ps.subscribing === 'boolean') {
					query.andWhere( ps.subscribing ?
						'instance.followersCount > 0' : 'instance.followersCount = 0');
				}

				if (typeof ps.publishing === 'boolean') {
					query.andWhere( ps.subscribing ?
						'instance.followingCount > 0' : 'instance.followingCount = 0');
				}
			}

			if (typeof ps.suspended === 'boolean') {
				query.andWhere(`instance.suspensionState ${ ps.suspended ? '!=' : '='} 'none'`);
			}

			if (typeof ps.quarantined === 'boolean') {
				query.andWhere('instance.quarantineLimited = :quarantineLimited', { quarantineLimited: ps.quarantined });
			}

			if (typeof ps.notResponding === 'boolean') {
				query.andWhere('instance.isNotResponding = :isNotResponding', { isNotResponding: ps.notResponding });
			}

			const queryResult = await query.getRawMany();
			const softwareName = [...new Set(queryResult.map( x => x.softwareName))];
			return softwareName.map(s => ({
				softwareName: s ?? 'null',
				count: queryResult.filter(x => x.softwareName === s).length,
				color: getColor(s),
			}));
		});
	}
}

function getColor(name: string | null): string | null {
	switch (name) {
		case 'misskey':
			return '#86b300';
		case 'sharkey':
			return '#43BBE5';
		case 'cherrypick':
			return '#ffa9c3';
		case 'yojo-art':
			return '#ffbcdc';
		case 'mastodon':
			return '#6364FF';
		case 'kmyblue':
			return '#86AFE5';
		case 'fedibird':
			return '#282c37';
		case 'pleroma':
			return '#FAA459';
		case 'akkoma':
			return '#462E7A';

		// hollo, mitra, null
		default:
			return null;
	}
}
