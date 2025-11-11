/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { IsNull, Not, In } from 'typeorm';
import { DI } from '@/di-symbols.js';
import type { FollowingsRepository } from '@/models/_.js';
import type { MiLocalUser, MiRemoteUser, MiUser } from '@/models/User.js';
import { QueueService } from '@/core/QueueService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { bindThis } from '@/decorators.js';
import type { IActivity } from '@/core/activitypub/type.js';
import { ThinUser } from '@/queue/types.js';
import { LoggerService } from '@/core/LoggerService.js';
import type Logger from '@/logger.js';

interface IRecipe {
	type: string;
}

interface IFollowersRecipe extends IRecipe {
	type: 'Followers';
}

interface IDirectRecipe extends IRecipe {
	type: 'Direct';
	to: MiRemoteUser;
}

interface ISelectiveFollowersRecipe extends IRecipe {
	type: 'SelectiveFollowers';
	deliveryTargets?: { mode: 'include' | 'exclude'; hosts: string[] } | null;
}

const isFollowers = (recipe: IRecipe): recipe is IFollowersRecipe =>
	recipe.type === 'Followers';

const isDirect = (recipe: IRecipe): recipe is IDirectRecipe =>
	recipe.type === 'Direct';

const isSelectiveFollowers = (recipe: IRecipe): recipe is ISelectiveFollowersRecipe =>
	recipe.type === 'SelectiveFollowers';

class DeliverManager {
	private actor: ThinUser;
	private activity: IActivity | null;
	private recipes: IRecipe[] = [];
	private logger: Logger;

	/**
	 * Constructor
	 * @param userEntityService
	 * @param followingsRepository
	 * @param queueService
	 * @param actor Actor
	 * @param activity Activity to deliver
	 */
	constructor(
		private userEntityService: UserEntityService,
		private followingsRepository: FollowingsRepository,
		private queueService: QueueService,

		actor: { id: MiUser['id']; host: null; },
		activity: IActivity | null,
		logger: Logger,
	) {
		// 型で弾いてはいるが一応ローカルユーザーかチェック
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (actor.host != null) throw new Error('actor.host must be null');

		// パフォーマンス向上のためキューに突っ込むのはidのみに絞る
		this.actor = {
			id: actor.id,
		};
		this.activity = activity;
		this.logger = logger.createSubLogger('deliver-manager');
	}

	/**
	 * Add recipe for followers deliver
	 */
	@bindThis
	public addFollowersRecipe(): void {
		const deliver: IFollowersRecipe = {
			type: 'Followers',
		};

		this.addRecipe(deliver);
	}

	/**
	 * Add recipe for direct deliver
	 * @param to To
	 */
	@bindThis
	public addDirectRecipe(to: MiRemoteUser): void {
		const recipe: IDirectRecipe = {
			type: 'Direct',
			to,
		};

		this.addRecipe(recipe);
	}

	/**
	 * Add recipe for selective followers deliver
	 */
	@bindThis
	public addSelectiveFollowersRecipe(deliveryTargets?: { mode: 'include' | 'exclude'; hosts: string[] } | null): void {
		const deliver: ISelectiveFollowersRecipe = {
			type: 'SelectiveFollowers',
			deliveryTargets,
		};

		this.addRecipe(deliver);
	}

	/**
	 * Add recipe
	 * @param recipe Recipe
	 */
	@bindThis
	public addRecipe(recipe: IRecipe): void {
		this.recipes.push(recipe);
	}

	/**
	 * Execute delivers
	 */
	@bindThis
	public async execute(): Promise<void> {
		// The value flags whether it is shared or not.
		// key: inbox URL, value: whether it is sharedInbox
		const inboxes = new Map<string, boolean>();

		// build inbox list
		// Process follower recipes first to avoid duplication when processing direct recipes later.
		// SelectiveFollowers takes priority over general Followers
		if (this.recipes.some(r => isSelectiveFollowers(r))) {
			const recipe = this.recipes.find(r => isSelectiveFollowers(r)) as ISelectiveFollowersRecipe;
			const deliveryTargets = recipe.deliveryTargets;

			const whereClause: any = {
				followeeId: this.actor.id,
				followerHost: Not(IsNull()),
			};

			if (deliveryTargets) {
				if (deliveryTargets.mode === 'include') {
					whereClause.followerHost = In(deliveryTargets.hosts);
				} else if (deliveryTargets.mode === 'exclude') {
					whereClause.followerHost = Not(In(deliveryTargets.hosts));
				}
			}

			const followers = await this.followingsRepository.find({
				where: whereClause,
				select: {
					followerSharedInbox: true,
					followerInbox: true,
				},
			});

			for (const following of followers) {
				const inbox = following.followerSharedInbox ?? following.followerInbox;
				//if (inbox === null) throw new Error('inbox is null');
				if (inbox === null) {
					this.logger.warn('inbox is null, skipping delivery', {
						followerSharedInbox: following.followerSharedInbox,
						followerInbox: following.followerInbox,
						actorId: this.actor.id,
					});
					continue;
				}
				inboxes.set(inbox, following.followerSharedInbox != null);
			}
		} else if (this.recipes.some(r => isFollowers(r))) {
			// followers deliver
			// TODO: SELECT DISTINCT ON ("followerSharedInbox") "followerSharedInbox" みたいな問い合わせにすればよりパフォーマンス向上できそう
			// ただ、sharedInboxがnullなリモートユーザーも稀におり、その対応ができなさそう？
			const followers = await this.followingsRepository.find({
				where: {
					followeeId: this.actor.id,
					followerHost: Not(IsNull()),
				},
				select: {
					followerSharedInbox: true,
					followerInbox: true,
				},
			});

			for (const following of followers) {
				const inbox = following.followerSharedInbox ?? following.followerInbox;
				//if (inbox === null) throw new Error('inbox is null');
				if (inbox === null) {
					this.logger.warn('inbox is null, skipping delivery', {
						followerSharedInbox: following.followerSharedInbox,
						followerInbox: following.followerInbox,
						actorId: this.actor.id,
					});
					continue;
				}
				inboxes.set(inbox, following.followerSharedInbox != null);
			}
		}

		for (const recipe of this.recipes.filter(isDirect)) {
			// check that shared inbox has not been added yet
			if (recipe.to.sharedInbox !== null && inboxes.has(recipe.to.sharedInbox)) continue;

			// check that they actually have an inbox
			if (recipe.to.inbox === null) continue;

			inboxes.set(recipe.to.inbox, false);
		}

		// deliver
		await this.queueService.deliverMany(this.actor, this.activity, inboxes);
	}
}

@Injectable()
export class ApDeliverManagerService {
	private logger: Logger;

	constructor(
		@Inject(DI.followingsRepository)
		private followingsRepository: FollowingsRepository,

		private userEntityService: UserEntityService,
		private queueService: QueueService,
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger('ap-deliver-manager', 'blue');
	}

	/**
	 * Deliver activity to followers
	 * @param actor
	 * @param activity Activity
	 */
	@bindThis
	public async deliverToFollowers(actor: { id: MiLocalUser['id']; host: null; }, activity: IActivity): Promise<void> {
		const manager = new DeliverManager(
			this.userEntityService,
			this.followingsRepository,
			this.queueService,
			actor,
			activity,
			this.logger,
		);
		manager.addFollowersRecipe();
		await manager.execute();
	}

	/**
	 * Deliver activity to user
	 * @param actor
	 * @param activity Activity
	 * @param to Target user
	 */
	@bindThis
	public async deliverToUser(actor: { id: MiLocalUser['id']; host: null; }, activity: IActivity, to: MiRemoteUser): Promise<void> {
		const manager = new DeliverManager(
			this.userEntityService,
			this.followingsRepository,
			this.queueService,
			actor,
			activity,
			this.logger,
		);
		manager.addDirectRecipe(to);
		await manager.execute();
	}

	/**
	 * Deliver activity to users
	 * @param actor
	 * @param activity Activity
	 * @param targets Target users
	 */
	@bindThis
	public async deliverToUsers(actor: { id: MiLocalUser['id']; host: null; }, activity: IActivity, targets: MiRemoteUser[]): Promise<void> {
		const manager = new DeliverManager(
			this.userEntityService,
			this.followingsRepository,
			this.queueService,
			actor,
			activity,
			this.logger,
		);
		for (const to of targets) manager.addDirectRecipe(to);
		await manager.execute();
	}

	@bindThis
	public createDeliverManager(actor: { id: MiUser['id']; host: null; }, activity: IActivity | null): DeliverManager {
		return new DeliverManager(
			this.userEntityService,
			this.followingsRepository,
			this.queueService,

			actor,
			activity,
			this.logger,
		);
	}
}
