/*
 * SPDX-FileCopyrightText: syuilo and noridev and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Entity, Index, JoinColumn, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';

@Entity('user_group')
export class MiUserGroup {
	@PrimaryColumn(id())
	public id: string;

	@Column('varchar', {
		length: 256,
	})
	public name: string;

	@Index()
	@Column({
		...id(),
		comment: 'The ID of owner.',
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
	public isPrivate: boolean;

	constructor(data: Partial<MiUserGroup>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
