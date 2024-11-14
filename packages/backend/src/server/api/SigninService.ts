/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import * as Misskey from 'cherrypick-js';
import { DI } from '@/di-symbols.js';
import type { SigninsRepository, UserProfilesRepository } from '@/models/_.js';
import { IdService } from '@/core/IdService.js';
import type { MiLocalUser } from '@/models/User.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { SigninEntityService } from '@/core/entities/SigninEntityService.js';
import { bindThis } from '@/decorators.js';
import { EmailService } from '@/core/EmailService.js';
import { NotificationService } from '@/core/NotificationService.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class SigninService {
	constructor(
		@Inject(DI.signinsRepository)
		private signinsRepository: SigninsRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private signinEntityService: SigninEntityService,
		private emailService: EmailService,
		private notificationService: NotificationService,
		private idService: IdService,
		private globalEventService: GlobalEventService,
	) {
	}

	@bindThis
	public signin(request: FastifyRequest, reply: FastifyReply, user: MiLocalUser) {
		setImmediate(async () => {
			this.notificationService.createNotification(user.id, 'login', {
				userIp: request.ip,
			});

			const record = await this.signinsRepository.insertOne({
				id: this.idService.gen(),
				userId: user.id,
				ip: request.ip,
				headers: request.headers as any,
				success: true,
			});

			this.globalEventService.publishMainStream(user.id, 'signin', await this.signinEntityService.pack(record));

			const profile = await this.userProfilesRepository.findOneByOrFail({ userId: user.id });
			if (profile.email && profile.emailVerified) {
				this.emailService.sendEmail(profile.email, 'New login / ログインがありました / 로그인 알림',
					'There is a new login. If you do not recognize this login, update the security status of your account, including changing your password. / 新しいログインがありました。このログインに心当たりがない場合は、パスワードを変更するなど、アカウントのセキュリティ状態を更新してください。/ 새 기기에서 로그인을 시도했어요. 이 로그인이 신뢰할 수 있는 기기에서 한 것이 아니라면, 즉시 비밀번호를 변경하는 등의 조치를 통해 계정의 보안 상태를 업데이트해야 해요.',
					'There is a new login. If you do not recognize this login, update the security status of your account, including changing your password. / 新しいログインがありました。このログインに心当たりがない場合は、パスワードを変更するなど、アカウントのセキュリティ状態を更新してください。/ 새 기기에서 로그인을 시도했어요. 이 로그인이 신뢰할 수 있는 기기에서 한 것이 아니라면, 즉시 비밀번호를 변경하는 등의 조치를 통해 계정의 보안 상태를 업데이트해야 해요.');
			}
		});

		reply.code(200);
		return {
			finished: true,
			id: user.id,
			i: user.token!,
		} satisfies Misskey.entities.SigninFlowResponse;
	}
}

