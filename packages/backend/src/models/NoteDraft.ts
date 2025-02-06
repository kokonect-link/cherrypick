/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Entity, Index, JoinColumn, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { noteVisibilities, noteReactionAcceptances } from '@/types.js';
import * as Event from '@/models/Event.js';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiChannel } from './Channel.js';
import { MiNote } from './Note.js';
import type { MiDriveFile } from './DriveFile.js';

@Entity('note_draft')
export class MiNoteDraft {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'The ID of reply target.',
	})
	public replyId: MiNote['id'] | null;

	@ManyToOne(type => MiNote, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public reply: MiNote | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'The ID of renote target.',
	})
	public renoteId: MiNote['id'] | null;

	@ManyToOne(type => MiNote, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public renote: MiNote | null;

	@Column('boolean', {
		default: false,
	})
	public hasEvent: boolean;

	// TODO: varcharにしたい(Note.tsと同じ)
	@Column('text', {
		nullable: true,
	})
	public text: string | null;

	@Column('varchar', {
		length: 512, nullable: true,
	})
	public cw: string | null;

	@Index()
	@Column({
		...id(),
		comment: 'The ID of author.',
	})
	public userId: MiUser['id'];

	@ManyToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser | null;

	@Column('boolean', {
		default: false,
	})
	public localOnly: boolean;

	@Column('varchar', {
		length: 64, nullable: true,
	})
	public reactionAcceptance: typeof noteReactionAcceptances[number];

	@Column('boolean', {
		default: false,
	})
	public disableRightClick: boolean;

	/**
	 * public ... 公開
	 * home ... ホームタイムライン(ユーザーページのタイムライン含む)のみに流す
	 * followers ... フォロワーのみ
	 * specified ... visibleUserIds で指定したユーザーのみ
	 */
	@Column('enum', { enum: noteVisibilities })
	public visibility: typeof noteVisibilities[number];

	@Index('IDX_NOTE_DRAFT_FILE_IDS', { synchronize: false })
	@Column({
		...id(),
		array: true, default: '{}',
	})
	public fileIds: MiDriveFile['id'][];

	@Index('IDX_NOTE_DRAFT_VISIBLE_USER_IDS', { synchronize: false })
	@Column({
		...id(),
		array: true, default: '{}',
	})
	public visibleUserIds: MiUser['id'][];

	@Column('varchar', {
		length: 128, nullable: true,
	})
	public hashtag: string;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'The ID of source channel.',
	})
	public channelId: MiChannel['id'] | null;

	@ManyToOne(type => MiChannel, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public channel: MiChannel | null;

	// 以下、Pollについて追加

	@Column('boolean', {
		default: false,
	})
	public hasPoll: boolean;

	@Column('varchar', {
		length: 256, array: true, default: '{}',
	})
	public pollChoices: string[];

	@Column('boolean')
	public pollMultiple: boolean;

	@Column('timestamp with time zone', {
		nullable: true,
	})
	public pollExpiresAt: Date | null;

	@Column('bigint', {
		nullable: true,
	})
	public pollExpiredAfter: number | null;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The start time of the event',
	})
	public eventStart: Date;

	@Column('timestamp with time zone', {
		comment: 'The end of the event',
		nullable: true,
	})
	public eventEnd: Date | null;

	@Column({
		type: 'varchar',
		length: 128,
		comment: 'short name of event',
	})
	public eventTitle: string;

	@Column('jsonb', {
		default: {
			'@context': 'https://schema.org/',
			'@type': 'Event',
		},
		comment: 'metadata object describing the event. Follows https://schema.org/Event',
	})
	public eventMetadata: Event.EventSchema;

	@Column('timestamp with time zone', {
		nullable: true,
	})
	public deleteAt: Date | null;

	// ここまで追加

	constructor(data: Partial<MiNoteDraft>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
