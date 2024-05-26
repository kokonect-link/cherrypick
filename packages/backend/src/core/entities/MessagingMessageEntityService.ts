/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { MessagingMessagesRepository } from '@/models/_.js';
import type { Packed } from '@/misc/json-schema.js';
import type { MiUser } from '@/models/User.js';
import type { MiMessagingMessage } from '@/models/MessagingMessage.js';
import { bindThis } from '@/decorators.js';
import { IdService } from '@/core/IdService.js';
import { UserEntityService } from './UserEntityService.js';
import { DriveFileEntityService } from './DriveFileEntityService.js';
import { UserGroupEntityService } from './UserGroupEntityService.js';

@Injectable()
export class MessagingMessageEntityService {
	constructor(
		@Inject(DI.messagingMessagesRepository)
		private messagingMessagesRepository: MessagingMessagesRepository,

		private idService: IdService,
		private userEntityService: UserEntityService,
		private userGroupEntityService: UserGroupEntityService,
		private driveFileEntityService: DriveFileEntityService,
	) {
	}

	@bindThis
	public async pack(
		src: MiMessagingMessage['id'] | MiMessagingMessage,
		me?: { id: MiUser['id'] } | null | undefined,
		options?: {
			populateRecipient?: boolean,
			populateGroup?: boolean,
		},
	): Promise<Packed<'MessagingMessage'>> {
		const opts = options ?? {
			populateRecipient: true,
			populateGroup: true,
		};

		const message = typeof src === 'object' ? src : await this.messagingMessagesRepository.findOneByOrFail({ id: src });

		return {
			id: message.id,
			createdAt: this.idService.parse(message.id).date.toISOString(),
			text: message.text,
			userId: message.userId,
			user: await this.userEntityService.pack(message.user ?? message.userId, me),
			recipientId: message.recipientId,
			recipient: message.recipientId && opts.populateRecipient ? await this.userEntityService.pack(message.recipient ?? message.recipientId, me) : undefined,
			groupId: message.groupId,
			group: message.groupId && opts.populateGroup ? await this.userGroupEntityService.pack(message.group ?? message.groupId) : undefined,
			fileId: message.fileId,
			file: message.fileId ? await this.driveFileEntityService.pack(message.fileId) : null,
			isRead: message.isRead,
			reads: message.reads,
		};
	}
}

