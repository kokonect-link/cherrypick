/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { AntennasRepository, UserGroupJoiningsRepository } from '@/models/_.js';
import type { Packed } from '@/misc/json-schema.js';
import type { MiAntenna } from '@/models/Antenna.js';
import { bindThis } from '@/decorators.js';
import { IdService } from '@/core/IdService.js';

@Injectable()
export class AntennaEntityService {
	constructor(
		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		@Inject(DI.userGroupJoiningsRepository)
		private userGroupJoiningsRepository: UserGroupJoiningsRepository,

		private idService: IdService,
	) {
	}

	@bindThis
	public async pack(
		src: MiAntenna['id'] | MiAntenna,
	): Promise<Packed<'Antenna'>> {
		const antenna = typeof src === 'object' ? src : await this.antennasRepository.findOneByOrFail({ id: src });

		const userGroupJoining = antenna.userGroupJoiningId ? await this.userGroupJoiningsRepository.findOneBy({ id: antenna.userGroupJoiningId }) : null;

		return {
			id: antenna.id,
			createdAt: this.idService.parse(antenna.id).date.toISOString(),
			name: antenna.name,
			keywords: antenna.keywords,
			excludeKeywords: antenna.excludeKeywords,
			src: antenna.src,
			userListId: antenna.userListId,
			userGroupId: userGroupJoining ? userGroupJoining.userGroupId : null,
			users: antenna.users,
			caseSensitive: antenna.caseSensitive,
			localOnly: antenna.localOnly,
			excludeBots: antenna.excludeBots,
			withReplies: antenna.withReplies,
			withFile: antenna.withFile,
			isActive: antenna.isActive,
			hasUnreadNote: false, // TODO
		};
	}
}
