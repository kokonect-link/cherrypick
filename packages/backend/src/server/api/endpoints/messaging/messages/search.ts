/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { id } from 'date-fns/locale';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { MessagingMessageEntityService } from '@/core/entities/MessagingMessageEntityService.js';
import { DirectMessageSearchService } from '@/core/DirectMessageSearchService.js';
import { ApiError } from '@/server/api/error.js';
import { GetterService } from '@/server/api/GetterService.js';

export const meta = {
	tags: ['messaging'],
	requireCredentail: false,
	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'MessagingMessage',
		},
	},

	errors: {
		unavailable: {
			message: 'Search of direct messages is ',
			code: 'UNAVAILABLE',
			id: '5e086500-f40e-11ee-90b4-00155d403610',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		query: { type: 'string' },
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		recipientId: { type: 'string', format: 'misskey:id', nullable: true, default: null },
		groupId: { type: 'string', format: 'misskey:id', nullable: true, default: null },
	},
	required: ['query'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private messagingMessageEntityService: MessagingMessageEntityService,
		private directMessageSearchService: DirectMessageSearchService,
		private getterService: GetterService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const message = await this.directMessageSearchService.searchMessages(ps.query, me, {
				recipient: ps.recipientId,
				groupId: ps.groupId,
			}, {
				untilId: ps.untilId,
				sinceId: ps.sinceId,
				limit: ps.limit,
			});

			return await this.messagingMessageEntityService.packMany(message, me);
		});
	}
}
