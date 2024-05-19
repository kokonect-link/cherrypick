/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { UserGroupInvitationsRepository, UserGroupJoiningsRepository } from '@/models/_.js';
import { IdService } from '@/core/IdService.js';
import type { MiUserGroupJoining } from '@/models/UserGroupJoining.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../../../error.js';

export const meta = {
	tags: ['groups', 'users'],

	requireCredential: true,

	kind: 'write:user-groups',

	errors: {
		noSuchInvitation: {
			message: 'No such invitation.',
			code: 'NO_SUCH_INVITATION',
			id: '98c11eca-c890-4f42-9806-c8c8303ebb5e',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		invitationId: { type: 'string', format: 'misskey:id' },
	},
	required: ['invitationId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.userGroupInvitationsRepository)
		private userGroupInvitationsRepository: UserGroupInvitationsRepository,

		@Inject(DI.userGroupJoiningsRepository)
		private userGroupJoiningsRepository: UserGroupJoiningsRepository,

		private idService: IdService,
	) {
		super(meta, paramDef, async (ps, me) => {
			// Fetch the invitation
			const invitation = await this.userGroupInvitationsRepository.findOneBy({
				id: ps.invitationId,
			});

			if (invitation == null) {
				throw new ApiError(meta.errors.noSuchInvitation);
			}

			if (invitation.userId !== me.id) {
				throw new ApiError(meta.errors.noSuchInvitation);
			}

			// Push the user
			await this.userGroupJoiningsRepository.insert({
				id: this.idService.gen(),
				userId: me.id,
				userGroupId: invitation.userGroupId,
			} as MiUserGroupJoining);

			return await this.userGroupInvitationsRepository.delete(invitation.id);
		});
	}
}
