/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';
import type { MiUser } from '@/models/entities/User.js';
import type { MiNote } from '@/models/entities/Note.js';
import type { MiUserList } from '@/models/entities/UserList.js';
import type { MiUserGroup } from '@/models/entities/UserGroup.js';
import type { MiAntenna } from '@/models/entities/Antenna.js';
import type {
	StreamChannels,
	AdminStreamTypes,
	AntennaStreamTypes,
	BroadcastTypes,
	DriveStreamTypes,
	GroupMessagingStreamTypes,
	InternalStreamTypes,
	MainStreamTypes,
	MessagingIndexStreamTypes,
	MessagingStreamTypes,
	NoteStreamTypes,
	UserListStreamTypes,
	RoleTimelineStreamTypes,
} from '@/server/api/stream/types.js';
import type { Packed } from '@/misc/json-schema.js';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { bindThis } from '@/decorators.js';
import { MiRole } from '@/models/index.js';

@Injectable()
export class GlobalEventService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.redisForPub)
		private redisForPub: Redis.Redis,
	) {
	}

	@bindThis
	private publish(channel: StreamChannels, type: string | null, value?: any): void {
		const message = type == null ? value : value == null ?
			{ type: type, body: null } :
			{ type: type, body: value };

		this.redisForPub.publish(this.config.host, JSON.stringify({
			channel: channel,
			message: message,
		}));
	}

	@bindThis
	public publishInternalEvent<K extends keyof InternalStreamTypes>(type: K, value?: InternalStreamTypes[K]): void {
		this.publish('internal', type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishBroadcastStream<K extends keyof BroadcastTypes>(type: K, value?: BroadcastTypes[K]): void {
		this.publish('broadcast', type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishMainStream<K extends keyof MainStreamTypes>(userId: MiUser['id'], type: K, value?: MainStreamTypes[K]): void {
		this.publish(`mainStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishDriveStream<K extends keyof DriveStreamTypes>(userId: MiUser['id'], type: K, value?: DriveStreamTypes[K]): void {
		this.publish(`driveStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishNoteStream<K extends keyof NoteStreamTypes>(noteId: MiNote['id'], type: K, value?: NoteStreamTypes[K]): void {
		this.publish(`noteStream:${noteId}`, type, {
			id: noteId,
			body: value,
		});
	}

	@bindThis
	public publishUserListStream<K extends keyof UserListStreamTypes>(listId: MiUserList['id'], type: K, value?: UserListStreamTypes[K]): void {
		this.publish(`userListStream:${listId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishAntennaStream<K extends keyof AntennaStreamTypes>(antennaId: MiAntenna['id'], type: K, value?: AntennaStreamTypes[K]): void {
		this.publish(`antennaStream:${antennaId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishMessagingStream<K extends keyof MessagingStreamTypes>(userId: MiUser['id'], otherpartyId: MiUser['id'], type: K, value?: MessagingStreamTypes[K]): void {
		this.publish(`messagingStream:${userId}-${otherpartyId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishGroupMessagingStream<K extends keyof GroupMessagingStreamTypes>(groupId: MiUserGroup['id'], type: K, value?: GroupMessagingStreamTypes[K]): void {
		this.publish(`messagingStream:${groupId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishMessagingIndexStream<K extends keyof MessagingIndexStreamTypes>(userId: MiUser['id'], type: K, value?: MessagingIndexStreamTypes[K]): void {
		this.publish(`messagingIndexStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishRoleTimelineStream<K extends keyof RoleTimelineStreamTypes>(roleId: MiRole['id'], type: K, value?: RoleTimelineStreamTypes[K]): void {
		this.publish(`roleTimelineStream:${roleId}`, type, typeof value === 'undefined' ? null : value);
	}

	@bindThis
	public publishNotesStream(note: Packed<'Note'>): void {
		this.publish('notesStream', null, note);
	}

	@bindThis
	public publishAdminStream<K extends keyof AdminStreamTypes>(userId: MiUser['id'], type: K, value?: AdminStreamTypes[K]): void {
		this.publish(`adminStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}
}
