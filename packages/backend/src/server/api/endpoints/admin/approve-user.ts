/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { UserProfilesRepository, UsersRepository } from '@/models/_.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';
import { DI } from '@/di-symbols.js';
import { EmailService } from '@/core/EmailService.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
	kind: 'write:admin:approve-user',
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

		private moderationLogService: ModerationLogService,
		private emailService: EmailService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const user = await this.usersRepository.findOneBy({ id: ps.userId });

			if (user == null) {
				throw new Error('user not found');
			}

			const profile = await this.userProfilesRepository.findOneBy({ userId: ps.userId });

			if (user.approved) return;

			await this.usersRepository.update(user.id, {
				approved: true,
			});

			if (profile?.email) {
				this.emailService.sendEmail(profile.email, 'Account Approved / アカウント承認済み / 계정 승인됨',
					'Your Account has been approved have fun socializing! / アカウントの承認が完了しました。交流をお楽しみください！ / 가입 요청한 계정이 승인되었어요! 즐거운 교류 되세요!',
					'Your Account has been approved have fun socializing! / アカウントの承認が完了しました。交流をお楽しみください！ / 가입 요청한 계정이 승인되었어요! 즐거운 교류 되세요!');
			}

			this.moderationLogService.log(me, 'approve', {
				userId: user.id,
				userUsername: user.username,
				userHost: user.host,
			});
		});
	}
}
