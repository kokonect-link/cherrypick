/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { UsedUsernamesRepository, UserProfilesRepository, UsersRepository } from '@/models/_.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';
import { DI } from '@/di-symbols.js';
import { EmailService } from '@/core/EmailService.js';
import { DeleteAccountService } from '@/core/DeleteAccountService.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
	kind: 'write:admin:decline-user',
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
	},
	required: ['userId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		@Inject(DI.usedUsernamesRepository)
		private usedUsernamesRepository: UsedUsernamesRepository,

		private moderationLogService: ModerationLogService,
		private emailService: EmailService,
		private deleteAccountService: DeleteAccountService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const user = await this.usersRepository.findOneBy({ id: ps.userId });

			if (user == null || user.isDeleted) {
				throw new Error('user not found or already deleted');
			}

			if (user.approved) {
				throw new Error('user is already approved');
			}

			if (user.host) {
				throw new Error('user is not local');
			}

			const profile = await this.userProfilesRepository.findOneBy({ userId: ps.userId });

			if (profile?.email) {
				this.emailService.sendEmail(profile.email, 'Account Declined / 登録承認されていない / 가입 거부됨',
					'Your Account has been declined.. / アカウントが拒否されました… / 가입 요청한 계정이 거부되었어요..',
					'Your Account has been declined.. / アカウントが拒否されました… / 가입 요청한 계정이 거부되었어요..');
			}

			await this.usedUsernamesRepository.delete({ username: user.username.toLowerCase() });

			await this.deleteAccountService.deleteAccount(user);

			this.moderationLogService.log(me, 'decline', {
				userId: user.id,
				userUsername: user.username,
				userHost: user.host,
			});
		});
	}
}
