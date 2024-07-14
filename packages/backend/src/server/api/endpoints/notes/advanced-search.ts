/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { RoleService } from '@/core/RoleService.js';
import { AdvancedSearchService } from '@/core/AdvancedSearchService.js';
import { ApiError } from '../../error.js';

export const meta = {
	description: '高度な検索ができます',
	tags: ['notes'],
	requireCredential: true,
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
		unavailable: {
			message: 'Advanced Search is unavailable.',
			code: 'UNAVAILABLE',
			id: '2f621660-e9b4-11ee-b87d-00155d0c9b27',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		// TODO: 整理する
		query: {
			type: 'string',
			description: '指定した文字列を含むノートを返します',
		},
		sinceId: {
			type: 'string',
			description: '指定されたID以降のノートを返します',
			format: 'misskey:id',
		},
		untilId: {
			type: 'string',
			format: 'misskey:id',
			description: '指定されたID以前のノートを返します',
		},
		limit: {
			type: 'integer',
			minimum: 1,
			maximum: 100,
			default: 10,
			description: 'ノートを取得する件数',
		},
		origin: {
			type: 'string',
			enum: ['local', 'remote', 'combined'],
			default: 'combined',
			description: 'ノートが作成された場所',
		},
		fileOption: {
			type: 'string',
			enum: ['file-only', 'no-file', 'combined'],
			default: 'combined',
			description: 'ファイルの添付状態',
		},
		sensitiveFilter: {
			type: 'string',
			enum: ['includeSensitive', 'withOutSensitive', 'sensitiveOnly', 'combined'],
			default: 'combined',
			description: '添付ファイルのセンシティブ状態',
		},
		offset: {
			type: 'integer',
			default: 0,
		},
		host: {
			type: 'string',
			description: 'ノートが作成されたインスタンス。ローカルの場合は`.`を指定します',
		},
		excludeCW: {
			type: 'boolean',
			default: false,
			description: 'CWを含むノートを除外するか',
		},
		excludeReply: {
			type: 'boolean',
			default: false,
			description: 'リプライのノートを除外するか',
		},
		excludeQuote: {
			type: 'boolean',
			default: false,
			description: '引用のノートを除外するか',
		},
		userId: {
			type: 'string',
			format: 'misskey:id',
			nullable: true,
			default: null,
			description: 'ノートを作成したユーザーのID',
		},
	},
	required: ['query'],
} as const;

// Todo: スリムにする

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private noteEntityService: NoteEntityService,
		private roleService: RoleService,
		private advancedSearchService: AdvancedSearchService,
	) {
		super(meta, paramDef, async(ps, me) => {
			const policies = await this.roleService.getUserPolicies(me ? me.id : null);
			if (!policies.canAdvancedSearchNotes) {
				throw new ApiError(meta.errors.unavailable);
			}

			const notes = await this.advancedSearchService.searchNote(ps.query, me, {
				userId: ps.userId,
				host: ps.host,
				origin: ps.origin,
				fileOption: ps.fileOption,
				sensitiveFilter: ps.sensitiveFilter,
				excludeCW: ps.excludeCW,
				excludeReply: ps.excludeReply,
				excludeQuote: ps.excludeQuote,
			}, {
				untilId: ps.untilId,
				sinceId: ps.sinceId,
				limit: ps.limit,
			});

			return await this.noteEntityService.packMany(notes, me);
		});
	}
}
