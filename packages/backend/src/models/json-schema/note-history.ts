/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const packedNoteHistorySchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
			example: 'xxxxxxxxxx',
		},
		noteId: {
			type: 'string',
			optional: false, nullable: false,
		},
		createdAt: {
			type: 'string',
			optional: false, nullable: false,
			format: 'date-time',
		},
		updatedAt: {
			type: 'string',
			optional: false, nullable: false,
			format: 'date-time',
		},
		userId: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		text: {
			type: 'string',
			optional: false, nullable: true,
		},
		cw: {
			type: 'string',
			optional: true, nullable: true,
		},
		poll: {
			type: 'object',
			optional: true, nullable: true,
			properties: {
				choices: {
					type: 'array',
					items: {
						type: 'string',
					},
				},
				multiple: {
					type: 'boolean',
				},
				expiresAt: {
					type: 'string',
					format: 'date-time',
					nullable: true,
				},
			},
		},
		event: {
			type: 'object',
			optional: true, nullable: true,
			properties: {
				title: {
					type: 'string',
				},
				start: {
					type: 'string',
					format: 'date-time',
				},
				end: {
					type: 'string',
					format: 'date-time',
					nullable: true,
				},
				metadata: {
					type: 'object',
				},
			},
		},
		fileIds: {
			type: 'array',
			optional: true, nullable: false,
			items: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
		files: {
			type: 'array',
			optional: true, nullable: false,
			items: {
				type: 'object',
				optional: false, nullable: false,
				ref: 'DriveFile',
			},
		},
		visibility: {
			type: 'string',
			optional: false, nullable: false,
			enum: ['public', 'home', 'followers', 'specified'],
		},
		visibleUserIds: {
			type: 'array',
			optional: true, nullable: false,
			items: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
		emojis: {
			type: 'object',
			optional: true, nullable: false,
			additionalProperties: {
				anyOf: [{
					type: 'string',
				}],
			},
		},
	},
} as const;
