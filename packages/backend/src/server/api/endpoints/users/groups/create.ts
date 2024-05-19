/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import ms from 'ms';
import type { UserGroupsRepository, UserGroupJoiningsRepository } from '@/models/_.js';
import { IdService } from '@/core/IdService.js';
import type { MiUserGroup } from '@/models/UserGroup.js';
import type { MiUserGroupJoining } from '@/models/UserGroupJoining.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { UserGroupEntityService } from '@/core/entities/UserGroupEntityService.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['groups'],

	requireCredential: true,

	kind: 'write:user-groups',

	description: 'Create a new group.',

	limit: {
		duration: ms('1hour'),
		max: 10,
	},

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'UserGroup',
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: { type: 'string', minLength: 1, maxLength: 100 },
	},
	required: ['name'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.userGroupsRepository)
		private userGroupsRepository: UserGroupsRepository,

		@Inject(DI.userGroupJoiningsRepository)
		private userGroupJoiningsRepository: UserGroupJoiningsRepository,

		private userGroupEntityService: UserGroupEntityService,
		private idService: IdService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const userGroup = await this.userGroupsRepository.insert({
				id: this.idService.gen(),
				userId: me.id,
				name: ps.name,
			} as MiUserGroup).then(x => this.userGroupsRepository.findOneByOrFail(x.identifiers[0]));

			// Push the owner
			await this.userGroupJoiningsRepository.insert({
				id: this.idService.gen(),
				userId: me.id,
				userGroupId: userGroup.id,
			} as MiUserGroupJoining);

			return await this.userGroupEntityService.pack(userGroup);
		});
	}
}
