/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { UserFollowingService } from '@/core/UserFollowingService.js';
import { ReactionService } from '@/core/ReactionService.js';
import { RelayService } from '@/core/RelayService.js';
import { NotePiningService } from '@/core/NotePiningService.js';
import { UserBlockingService } from '@/core/UserBlockingService.js';
import { NoteDeleteService } from '@/core/NoteDeleteService.js';
import { NoteCreateService } from '@/core/NoteCreateService.js';
import { NoteUpdateService } from '@/core/NoteUpdateService.js';
import { NotificationService } from '@/core/NotificationService.js';
import { ChatService } from '@/core/ChatService.js';
import { concat, toArray, toSingle, unique } from '@/misc/prelude/array.js';
import { AppLockService } from '@/core/AppLockService.js';
import type Logger from '@/logger.js';
import { IdService } from '@/core/IdService.js';
import { StatusError } from '@/misc/status-error.js';
import { UtilityService } from '@/core/UtilityService.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { QueueService } from '@/core/QueueService.js';
import type { UsersRepository, NotesRepository, FollowingsRepository, AbuseUserReportsRepository, FollowRequestsRepository, MiMeta, ChatMessagesRepository, ChatRoomsRepository, ChatRoomInvitationsRepository, ChatRoomMembershipsRepository } from '@/models/_.js';
import { bindThis } from '@/decorators.js';
import type { MiRemoteUser } from '@/models/User.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { AbuseReportService } from '@/core/AbuseReportService.js';
import { IdentifiableError } from '@/misc/identifiable-error.js';
import { getApHrefNullable, getApId, getApIds, getApType, isAccept, isActor, isAdd, isAnnounce, isBlock, isCollection, isCollectionOrOrderedCollection, isCreate, isDelete, isFlag, isFollow, isInvite, isLike, isMove, isPost, isReject, isRemove, isTombstone, isUndo, isUpdate, validActor, validPost } from './type.js';
import { ApNoteService } from './models/ApNoteService.js';
import { ApLoggerService } from './ApLoggerService.js';
import { ApDbResolverService } from './ApDbResolverService.js';
import { ApResolverService } from './ApResolverService.js';
import { ApAudienceService } from './ApAudienceService.js';
import { ApPersonService } from './models/ApPersonService.js';
import { ApQuestionService } from './models/ApQuestionService.js';
import { ApImageService } from './models/ApImageService.js';
import { ApMfmService } from './ApMfmService.js';
import type { Resolver } from './ApResolverService.js';
import type { IAccept, IAdd, IAnnounce, IBlock, ICreate, IDelete, IFlag, IFollow, IInvite, ILike, IObject, IRead, IReject, IRemove, IUndo, IUpdate, IMove, IPost } from './type.js';

@Injectable()
export class ApInboxService {
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.meta)
		private meta: MiMeta,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.followingsRepository)
		private followingsRepository: FollowingsRepository,

		@Inject(DI.followRequestsRepository)
		private followRequestsRepository: FollowRequestsRepository,

		@Inject(DI.chatMessagesRepository)
		private chatMessagesRepository: ChatMessagesRepository,

		@Inject(DI.chatRoomsRepository)
		private chatRoomsRepository: ChatRoomsRepository,

		@Inject(DI.chatRoomInvitationsRepository)
		private chatRoomInvitationsRepository: ChatRoomInvitationsRepository,

		@Inject(DI.chatRoomMembershipsRepository)
		private chatRoomMembershipsRepository: ChatRoomMembershipsRepository,

		private userEntityService: UserEntityService,
		private noteEntityService: NoteEntityService,
		private utilityService: UtilityService,
		private idService: IdService,
		private abuseReportService: AbuseReportService,
		private userFollowingService: UserFollowingService,
		private apAudienceService: ApAudienceService,
		private reactionService: ReactionService,
		private relayService: RelayService,
		private notePiningService: NotePiningService,
		private userBlockingService: UserBlockingService,
		private noteCreateService: NoteCreateService,
		private noteUpdateService: NoteUpdateService,
		private noteDeleteService: NoteDeleteService,
		private notificationService: NotificationService,
		private chatService: ChatService,
		private appLockService: AppLockService,
		private apResolverService: ApResolverService,
		private apDbResolverService: ApDbResolverService,
		private apLoggerService: ApLoggerService,
		private apNoteService: ApNoteService,
		private apPersonService: ApPersonService,
		private apQuestionService: ApQuestionService,
		private apImageService: ApImageService,
		private apMfmService: ApMfmService,
		private queueService: QueueService,
		private globalEventService: GlobalEventService,
	) {
		this.logger = this.apLoggerService.logger;
	}

	@bindThis
	public async performActivity(actor: MiRemoteUser, activity: IObject, resolver?: Resolver): Promise<string | void> {
		let result = undefined as string | void;
		if (isCollectionOrOrderedCollection(activity)) {
			const results = [] as [string, string | void][];
			// eslint-disable-next-line no-param-reassign
			resolver ??= this.apResolverService.createResolver();

			const items = toArray(isCollection(activity) ? activity.items : activity.orderedItems);
			if (items.length >= resolver.getRecursionLimit()) {
				throw new Error(`skipping activity: collection would surpass recursion limit: ${this.utilityService.extractDbHost(actor.uri)}`);
			}

			for (const item of items) {
				const act = await resolver.resolve(item);
				if (act.id == null || this.utilityService.extractDbHost(act.id) !== this.utilityService.extractDbHost(actor.uri)) {
					this.logger.debug('skipping activity: activity id is null or mismatching');
					continue;
				}
				try {
					results.push([getApId(item), await this.performOneActivity(actor, act, resolver)]);
				} catch (err) {
					if (err instanceof Error || typeof err === 'string') {
						this.logger.error(err);
					} else {
						throw err;
					}
				}
			}

			const hasReason = results.some(([, reason]) => (reason != null && !reason.startsWith('ok')));
			if (hasReason) {
				result = results.map(([id, reason]) => `${id}: ${reason}`).join('\n');
			}
		} else {
			result = await this.performOneActivity(actor, activity, resolver);
		}

		// ついでにリモートユーザーの情報が古かったら更新しておく
		if (actor.uri) {
			if (actor.lastFetchedAt == null || Date.now() - actor.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24) {
				setImmediate(() => {
					// 同一ユーザーの情報を再度処理するので、使用済みのresolverを再利用してはいけない
					this.apPersonService.updatePerson(actor.uri);
				});
			}
		}
		return result;
	}

	@bindThis
	public async performOneActivity(actor: MiRemoteUser, activity: IObject, resolver?: Resolver): Promise<string | void> {
		if (actor.isSuspended) return;

		if (isCreate(activity)) {
			return await this.create(actor, activity, resolver);
		} else if (isDelete(activity)) {
			return await this.delete(actor, activity);
		} else if (isUpdate(activity)) {
			return await this.update(actor, activity, resolver);
		} else if (isFollow(activity)) {
			return await this.follow(actor, activity);
		} else if (isAccept(activity)) {
			return await this.accept(actor, activity, resolver);
		} else if (isReject(activity)) {
			return await this.reject(actor, activity, resolver);
		} else if (isAdd(activity)) {
			return await this.add(actor, activity, resolver);
		} else if (isRemove(activity)) {
			return await this.remove(actor, activity, resolver);
		} else if (isAnnounce(activity)) {
			return await this.announce(actor, activity, resolver);
		} else if (isLike(activity)) {
			return await this.like(actor, activity);
		} else if (isUndo(activity)) {
			return await this.undo(actor, activity, resolver);
		} else if (isBlock(activity)) {
			return await this.block(actor, activity);
		} else if (isFlag(activity)) {
			return await this.flag(actor, activity);
		} else if (isMove(activity)) {
			return await this.move(actor, activity, resolver);
		} else if (isInvite(activity)) {
			return await this.invite(actor, activity, resolver);
		} else {
			return `unrecognized activity type: ${activity.type}`;
		}
	}

	@bindThis
	private async follow(actor: MiRemoteUser, activity: IFollow): Promise<string> {
		const followee = await this.apDbResolverService.getUserFromApId(activity.object);

		if (followee == null) {
			return 'skip: followee not found';
		}

		if (followee.host != null) {
			return 'skip: フォローしようとしているユーザーはローカルユーザーではありません';
		}

		// don't queue because the sender may attempt again when timeout
		await this.userFollowingService.follow(actor, followee, { requestId: activity.id });
		return 'ok';
	}

	@bindThis
	private async like(actor: MiRemoteUser, activity: ILike): Promise<string> {
		const targetUri = getApId(activity.object);

		const note = await this.apNoteService.fetchNote(targetUri);
		if (!note) return `skip: target note not found ${targetUri}`;

		await this.apNoteService.extractEmojis(activity.tag ?? [], actor.host).catch(() => null);

		try {
			await this.reactionService.create(actor, note, activity._misskey_reaction ?? activity.content ?? activity.name);
			return 'ok';
		} catch (err) {
			if (err instanceof IdentifiableError && err.id === '51c42bb4-931a-456b-bff7-e5a8a70dd298') {
				return 'skip: already reacted';
			} else {
				throw err;
			}
		}
	}

	@bindThis
	private async accept(actor: MiRemoteUser, activity: IAccept, resolver?: Resolver): Promise<string> {
		const uri = activity.id ?? activity;

		this.logger.info(`Accept: ${uri}`);

		// eslint-disable-next-line no-param-reassign
		resolver ??= this.apResolverService.createResolver();

		const object = await resolver.resolve(activity.object).catch(err => {
			this.logger.error(`Resolution failed: ${err}`);
			throw err;
		});

		if (isFollow(object)) return await this.acceptFollow(actor, object);
		if (isInvite(object)) return await this.acceptInvite(actor, object);

		return `skip: Unknown Accept type: ${getApType(object)}`;
	}

	@bindThis
	private async acceptFollow(actor: MiRemoteUser, activity: IFollow): Promise<string> {
		// ※ activityはこっちから投げたフォローリクエストなので、activity.actorは存在するローカルユーザーである必要がある

		const follower = await this.apDbResolverService.getUserFromApId(activity.actor);

		if (follower == null) {
			return 'skip: follower not found';
		}

		if (follower.host != null) {
			return 'skip: follower is not a local user';
		}

		// relay
		const match = activity.id?.match(/follow-relay\/(\w+)/);
		if (match) {
			return await this.relayService.relayAccepted(match[1]);
		}

		await this.userFollowingService.acceptFollowRequest(actor, follower);
		return 'ok';
	}

	@bindThis
	private async acceptInvite(actor: MiRemoteUser, activity: IInvite): Promise<string> {
		// actor is the one who accepted the invitation (invitee)
		// activity.target should be the actor who accepted
		// activity.object should be the room

		const roomObject = activity.object;
		if (typeof roomObject === 'string') return 'skip: object must be a full object, not a URI';

		const roomUri = getApId(roomObject);
		if (!roomUri) return 'skip: invalid room object';

		// Extract room ID from URI
		const roomIdMatch = roomUri.match(/\/chat\/rooms\/([a-zA-Z0-9]+)$/);
		if (!roomIdMatch) return 'skip: invalid room URI format';
		const roomId = roomIdMatch[1];

		// Find the room
		const room = await this.chatRoomsRepository.findOneBy({ id: roomId });
		if (!room) {
			this.logger.warn(`Room not found: ${roomId}`);
			return 'skip: room not found';
		}

		// Delete the invitation
		const invitation = await this.chatRoomInvitationsRepository.findOneBy({
			roomId,
			userId: actor.id,
		});
		if (invitation) {
			await this.chatRoomInvitationsRepository.delete(invitation.id);
		}

		// Check if already a member
		const existingMembership = await this.chatService.isRoomMember(room, actor.id);
		if (existingMembership) {
			this.logger.info(`User ${actor.id} is already a member of room ${roomId}`);
			return 'ok';
		}

		// Add membership
		const membership = {
			id: this.idService.gen(),
			roomId: room.id,
			userId: actor.id,
		};

		await this.chatRoomMembershipsRepository.insertOne(membership);

		this.logger.info(`Remote user ${actor.id} accepted invitation and joined room ${roomId}`);
		return 'ok';
	}

	@bindThis
	private async add(actor: MiRemoteUser, activity: IAdd, resolver?: Resolver): Promise<string | void> {
		if (actor.uri !== activity.actor) {
			return 'invalid actor';
		}

		if (activity.target == null) {
			return 'target is null';
		}

		if (activity.target === actor.featured) {
			const note = await this.apNoteService.resolveNote(activity.object, { resolver });
			if (note == null) return 'note not found';
			await this.notePiningService.addPinned(actor, note.id);
			return;
		}

		return `unknown target: ${activity.target}`;
	}

	@bindThis
	private async announce(actor: MiRemoteUser, activity: IAnnounce, resolver?: Resolver): Promise<string | void> {
		const uri = getApId(activity);

		this.logger.info(`Announce: ${uri}`);

		// eslint-disable-next-line no-param-reassign
		resolver ??= this.apResolverService.createResolver();

		if (!activity.object) return 'skip: activity has no object property';
		const targetUri = getApId(activity.object);
		if (targetUri.startsWith('bear:')) return 'skip: bearcaps url not supported.';

		const target = await resolver.resolve(activity.object).catch(e => {
			this.logger.error(`Resolution failed: ${e}`);
			throw e;
		});

		if (isPost(target)) return await this.announceNote(actor, activity, target);

		return `skip: unknown object type ${getApType(target)}`;
	}

	@bindThis
	private async announceNote(actor: MiRemoteUser, activity: IAnnounce, target: IPost, resolver?: Resolver): Promise<string | void> {
		const uri = getApId(activity);

		if (actor.isSuspended) {
			return;
		}

		// アナウンス先が許可されているかチェック
		if (!this.utilityService.isFederationAllowedUri(uri)) return;

		const relays = await this.relayService.getAcceptedRelays();
		const fromRelay = !!actor.inbox && relays.map(r => r.inbox).includes(actor.inbox);

		const unlock = await this.appLockService.getApLock(uri);

		try {
			// 既に同じURIを持つものが登録されていないかチェック
			const exist = await this.apNoteService.fetchNote(fromRelay ? target : uri);
			if (exist) {
				return;
			}

			// Announce対象をresolve
			let renote;
			try {
				renote = await this.apNoteService.resolveNote(target, { resolver });
				if (renote == null) return 'announce target is null';
			} catch (err) {
				// 対象が4xxならスキップ
				if (err instanceof StatusError) {
					if (!err.isRetryable) {
						return `Ignored announce target ${target.id} - ${err.statusCode}`;
					}
					return `Error in announce target ${target.id} - ${err.statusCode}`;
				}
				throw err;
			}

			if (!await this.noteEntityService.isVisibleForMe(renote, actor.id)) {
				return 'skip: invalid actor for this activity';
			}

			if (fromRelay) {
				const noteObj = await this.noteEntityService.pack(renote);
				this.globalEventService.publishNotesStream(noteObj);
				return;
			}

			this.logger.info(`Creating the (Re)Note: ${uri}`);

			const activityAudience = await this.apAudienceService.parseAudience(actor, activity.to, activity.cc, resolver);
			const createdAt = activity.published ? new Date(activity.published) : null;

			if (createdAt && createdAt < this.idService.parse(renote.id).date) {
				return 'skip: malformed createdAt';
			}

			await this.noteCreateService.create(actor, {
				createdAt,
				renote,
				visibility: activityAudience.visibility,
				visibleUsers: activityAudience.visibleUsers,
				uri,
			});
		} finally {
			unlock();
		}
	}

	@bindThis
	private async block(actor: MiRemoteUser, activity: IBlock): Promise<string> {
		// ※ activity.objectにブロック対象があり、それは存在するローカルユーザーのはず

		const blockee = await this.apDbResolverService.getUserFromApId(activity.object);

		if (blockee == null) {
			return 'skip: blockee not found';
		}

		if (blockee.host != null) {
			return 'skip: ブロックしようとしているユーザーはローカルユーザーではありません';
		}

		await this.userBlockingService.block(await this.usersRepository.findOneByOrFail({ id: actor.id }), await this.usersRepository.findOneByOrFail({ id: blockee.id }));
		return 'ok';
	}

	@bindThis
	private async create(actor: MiRemoteUser, activity: ICreate, resolver?: Resolver): Promise<string | void> {
		const uri = getApId(activity);

		this.logger.info(`Create: ${uri}`);

		if (!activity.object) return 'skip: activity has no object property';
		const targetUri = getApId(activity.object);
		if (targetUri.startsWith('bear:')) return 'skip: bearcaps url not supported.';

		// copy audiences between activity <=> object.
		if (typeof activity.object === 'object') {
			const to = unique(concat([toArray(activity.to), toArray(activity.object.to)]));
			const cc = unique(concat([toArray(activity.cc), toArray(activity.object.cc)]));

			activity.to = to;
			activity.cc = cc;
			activity.object.to = to;
			activity.object.cc = cc;
		}

		// If there is no attributedTo, use Activity actor.
		if (typeof activity.object === 'object' && !activity.object.attributedTo) {
			activity.object.attributedTo = activity.actor;
		}

		// eslint-disable-next-line no-param-reassign
		resolver ??= this.apResolverService.createResolver();

		const object = await resolver.resolve(activity.object).catch(e => {
			this.logger.error(`Resolution failed: ${e}`);
			throw e;
		});

		if (isPost(object)) {
			// Check if this is a chat message (legacy Misskey format)
			if (typeof object === 'object' && '_misskey_talk' in object && object._misskey_talk === true) {
				await this.createChatMessage(resolver, actor, object, activity);
			} else {
				// Check if this is a reply to a chat message
				// If so, treat it as a chat message even without _misskey_talk flag
				let isReplyToChatMessage = false;
				if (typeof object === 'object' && object.inReplyTo) {
					try {
						const inReplyToUri = getApId(object.inReplyTo);
						// Check if inReplyTo is our chat message by checking the URI pattern and host
						const url = new URL(inReplyToUri);
						if (this.utilityService.isSelfHost(url.hostname) && inReplyToUri.includes('/chat/messages/')) {
							isReplyToChatMessage = true;
						} else {
							// Check if inReplyTo exists in our chat_messages table
							// This handles cases where the reply is to a previous reply that was saved as a chat message
							const inReplyToId = inReplyToUri.split('/').pop();
							if (inReplyToId) {
								const chatMessage = await this.chatMessagesRepository.findOneBy({ uri: inReplyToUri });
								if (chatMessage) {
									isReplyToChatMessage = true;
								}
							}
						}
					} catch (e) {
						// Ignore error, treat as normal note
					}
				}

				if (isReplyToChatMessage) {
					await this.createChatMessage(resolver, actor, object, activity);
				} else {
					await this.createNote(resolver, actor, object, false, activity);
				}
			}
		} else {
			return `Unknown type: ${getApType(object)}`;
		}
	}

	@bindThis
	private async createNote(resolver: Resolver, actor: MiRemoteUser, note: IObject, silent = false, activity?: ICreate): Promise<string> {
		const uri = getApId(note);

		if (typeof note === 'object') {
			if (actor.uri !== note.attributedTo) {
				return 'skip: actor.uri !== note.attributedTo';
			}

			if (typeof note.id === 'string') {
				if (this.utilityService.extractDbHost(actor.uri) !== this.utilityService.extractDbHost(note.id)) {
					return 'skip: host in actor.uri !== note.id';
				}
			} else {
				return 'skip: note.id is not a string';
			}
		}

		const unlock = await this.appLockService.getApLock(uri);

		try {
			const exist = await this.apNoteService.fetchNote(note);
			if (exist) return 'skip: note exists';

			await this.apNoteService.createNote(note, actor, resolver, silent);
			return 'ok';
		} catch (err) {
			if (err instanceof StatusError && !err.isRetryable) {
				return `skip ${err.statusCode}`;
			} else {
				throw err;
			}
		} finally {
			unlock();
		}
	}

	@bindThis
	private async createChatMessage(resolver: Resolver, actor: MiRemoteUser, object: IPost, activity: ICreate): Promise<string> {
		this.logger.info('Receiving chat message from remote');

		if (typeof object !== 'object') return 'skip: object is not an object';
		if (!object.id) return 'skip: object has no id';

		// Check if this message already exists (by URI)
		// Note: Cannot use fetchNote because chat messages are not in the notes table
		// For now, let ChatService handle duplicates
		this.logger.info(`Processing chat message: ${object.id}`);

		// Get recipients from the 'to' field
		const toUris = getApIds(object.to);
		if (!toUris || toUris.length === 0) return 'skip: no recipients';

		// Resolve recipient users
		const recipients = [];
		for (const uri of toUris) {
			try {
				const user = await this.apPersonService.resolvePerson(uri, resolver);
				if (user) {
					recipients.push(user);
				}
			} catch (e) {
				this.logger.warn(`Failed to resolve recipient: ${uri}`);
			}
		}

		if (recipients.length === 0) return 'skip: no valid recipients';

		// Extract message content
		let text: string | null = null;
		if (object.source?.mediaType === 'text/x.misskeymarkdown' && typeof object.source.content === 'string') {
			text = object.source.content;
		} else if (typeof object._misskey_content !== 'undefined') {
			text = object._misskey_content;
		} else if (typeof object.content === 'string') {
			text = this.apMfmService.htmlToMfm(object.content, object.tag);
		}
		const uri = object.id;

		// Handle file attachments
		let file = null;
		if (object.attachment && Array.isArray(object.attachment) && object.attachment.length > 0) {
			try {
				const attach = object.attachment[0]; // Take first attachment for now
				attach.sensitive ??= object.sensitive;
				file = await this.apImageService.resolveImage(actor, attach);
			} catch (e) {
				this.logger.warn(`Failed to resolve attachment: ${e}`);
			}
		}

		// Extract emojis
		const emojis = await this.apNoteService.extractEmojis(object.tag ?? [], actor.host).catch(e => {
			this.logger.info(`extractEmojis: ${e}`);
			return [];
		});

		const apEmojis = emojis.map(emoji => emoji.name);

		try {
			// Determine if this is a 1:1 chat or group chat
			if (recipients.length === 1) {
				// 1:1 chat
				const recipient = recipients[0];
				await this.chatService.createMessageToUser(actor, recipient, {
					text,
					file,
					uri,
					emojis: apEmojis,
				});
			} else {
				// Group chat
				// Extract room ID from context
				const contextUri = object['@context'];
				if (!contextUri || typeof contextUri !== 'string') {
					this.logger.warn('Group chat message missing context');
					return 'skip: group chat message missing context';
				}

				const roomIdMatch = contextUri.match(/\/chat\/rooms\/([a-zA-Z0-9]+)$/);
				if (!roomIdMatch) {
					this.logger.warn(`Invalid context URI format: ${contextUri}`);
					return 'skip: invalid context URI format';
				}

				const roomId = roomIdMatch[1];

				// Check if the room exists locally
				const room = await this.chatRoomsRepository.findOneBy({ id: roomId });
				if (!room) {
					this.logger.warn(`Room not found: ${roomId}`);
					return 'skip: room not found';
				}

				// Check if at least one recipient is a local user who is a member of the room
				let hasLocalMember = false;
				for (const recipient of recipients) {
					if (this.userEntityService.isLocalUser(recipient)) {
						// Check if this local user is a member of the room
						const isMember = await this.chatService.isRoomMember(room, recipient.id);
						if (isMember) {
							hasLocalMember = true;
							break;
						}
					}
				}

				if (!hasLocalMember) {
					this.logger.warn('No local members found in the room');
					return 'skip: no local members in room';
				}

				// Create the message to the room
				await this.chatService.createMessageToRoom(actor, room, {
					text,
					file,
					uri,
					emojis: apEmojis,
				});
			}

			return 'ok';
		} catch (err) {
			this.logger.error(`Failed to create chat message: ${err}`);
			throw err;
		}
	}

	@bindThis
	private async delete(actor: MiRemoteUser, activity: IDelete): Promise<string> {
		if (actor.uri !== activity.actor) {
			return 'invalid actor';
		}

		// 削除対象objectのtype
		let formerType: string | undefined;

		if (typeof activity.object === 'string') {
			// typeが不明だけど、どうせ消えてるのでremote resolveしない
			formerType = undefined;
		} else {
			const object = activity.object;
			if (isTombstone(object)) {
				formerType = toSingle(object.formerType);
			} else {
				formerType = toSingle(object.type);
			}
		}

		const uri = getApId(activity.object);

		// type不明でもactorとobjectが同じならばそれはPersonに違いない
		if (!formerType && actor.uri === uri) {
			formerType = 'Person';
		}

		// それでもなかったらおそらくNote
		if (!formerType) {
			formerType = 'Note';
		}

		if (validPost.includes(formerType)) {
			return await this.deleteNote(actor, uri);
		} else if (validActor.includes(formerType)) {
			return await this.deleteActor(actor, uri);
		} else {
			return `Unknown type ${formerType}`;
		}
	}

	@bindThis
	private async deleteActor(actor: MiRemoteUser, uri: string): Promise<string> {
		this.logger.info(`Deleting the Actor: ${uri}`);

		if (actor.uri !== uri) {
			return `skip: delete actor ${actor.uri} !== ${uri}`;
		}

		if (!(await this.usersRepository.update({ id: actor.id, isDeleted: false }, { isDeleted: true })).affected) {
			return 'skip: already deleted or actor not found';
		}

		const job = await this.queueService.createDeleteAccountJob(actor);

		this.globalEventService.publishInternalEvent('remoteUserUpdated', { id: actor.id });

		return `ok: queued ${job.name} ${job.id}`;
	}

	@bindThis
	private async deleteNote(actor: MiRemoteUser, uri: string): Promise<string> {
		this.logger.info(`Deleting the Note: ${uri}`);

		const unlock = await this.appLockService.getApLock(uri);

		try {
			const note = await this.apDbResolverService.getNoteFromApId(uri);

			if (note == null) {
				return 'message not found';
			}

			if (note.userId !== actor.id) {
				return '投稿を削除しようとしているユーザーは投稿の作成者ではありません';
			}

			await this.noteDeleteService.delete(actor, note);
			return 'ok: note deleted';
		} finally {
			unlock();
		}
	}

	@bindThis
	private async flag(actor: MiRemoteUser, activity: IFlag): Promise<string> {
		// objectは `(User|Note) | (User|Note)[]` だけど、全パターンDBスキーマと対応させられないので
		// 対象ユーザーは一番最初のユーザー として あとはコメントとして格納する
		const uris = getApIds(activity.object);

		const userIds = uris
			.filter(uri => uri.startsWith(this.config.url + '/users/'))
			.map(uri => uri.split('/').at(-1))
			.filter(x => x != null);
		const users = await this.usersRepository.findBy({
			id: In(userIds),
		});
		if (users.length < 1) return 'skip';

		await this.abuseReportService.report([{
			targetUserId: users[0].id,
			targetUserHost: users[0].host,
			reporterId: actor.id,
			reporterHost: actor.host,
			comment: `${activity.content}\n${JSON.stringify(uris, null, 2)}`,
		}]);

		return 'ok';
	}

	@bindThis
	private async reject(actor: MiRemoteUser, activity: IReject, resolver?: Resolver): Promise<string> {
		const uri = activity.id ?? activity;

		this.logger.info(`Reject: ${uri}`);

		// eslint-disable-next-line no-param-reassign
		resolver ??= this.apResolverService.createResolver();

		const object = await resolver.resolve(activity.object).catch(e => {
			this.logger.error(`Resolution failed: ${e}`);
			throw e;
		});

		if (isFollow(object)) return await this.rejectFollow(actor, object);
		if (isInvite(object)) return await this.rejectInvite(actor, object);

		return `skip: Unknown Reject type: ${getApType(object)}`;
	}

	@bindThis
	private async rejectFollow(actor: MiRemoteUser, activity: IFollow): Promise<string> {
		// ※ activityはこっちから投げたフォローリクエストなので、activity.actorは存在するローカルユーザーである必要がある

		const follower = await this.apDbResolverService.getUserFromApId(activity.actor);

		if (follower == null) {
			return 'skip: follower not found';
		}

		if (!this.userEntityService.isLocalUser(follower)) {
			return 'skip: follower is not a local user';
		}

		// relay
		const match = activity.id?.match(/follow-relay\/(\w+)/);
		if (match) {
			return await this.relayService.relayRejected(match[1]);
		}

		await this.userFollowingService.remoteReject(actor, follower);
		return 'ok';
	}

	@bindThis
	private async rejectInvite(actor: MiRemoteUser, activity: IInvite): Promise<string> {
		// actor is the one who rejected the invitation (invitee)
		// activity.object should be the Invite object being rejected
		// activity.object.object should be the room URI

		this.logger.info(`[rejectInvite] Processing rejection from actor: ${actor.id}, username: ${actor.username}@${actor.host}`);

		const inviteObject = activity.object;
		if (typeof inviteObject === 'string') return 'skip: object must be a full Invite object, not a URI';

		// The Invite object contains the room URI in its object property
		const roomObject = (inviteObject as any).object;
		if (!roomObject) return 'skip: invite object missing room';

		const roomUri = getApId(roomObject);
		if (!roomUri) return 'skip: invalid room object';

		this.logger.info(`[rejectInvite] Room URI: ${roomUri}`);

		// Extract room ID from URI
		const roomIdMatch = roomUri.match(/\/chat\/rooms\/([a-zA-Z0-9]+)$/);
		if (!roomIdMatch) return 'skip: invalid room URI format';
		const roomId = roomIdMatch[1];

		this.logger.info(`[rejectInvite] Searching for invitation - roomId: ${roomId}, userId: ${actor.id}`);

		// Find the invitation and delete it
		const invitation = await this.chatRoomInvitationsRepository.findOneBy({
			roomId,
			userId: actor.id,
		});

		if (!invitation) {
			this.logger.warn(`[rejectInvite] Invitation not found for roomId: ${roomId}, userId: ${actor.id}`);
			// Try to find all invitations for this room to debug
			const allInvitations = await this.chatRoomInvitationsRepository.findBy({ roomId });
			this.logger.warn(`[rejectInvite] All invitations for room ${roomId}:`, JSON.stringify(allInvitations.map(i => ({ id: i.id, userId: i.userId }))));
			return 'skip: invitation not found';
		}

		this.logger.info(`[rejectInvite] Found invitation: ${invitation.id}, deleting...`);

		// Delete the invitation
		const deleteResult = await this.chatRoomInvitationsRepository.delete({ id: invitation.id });

		this.logger.info(`[rejectInvite] Delete result:`, JSON.stringify(deleteResult));
		this.logger.info(`[rejectInvite] Successfully deleted invitation ${invitation.id} from user ${actor.id} for room ${roomId}`);

		return 'ok';
	}

	@bindThis
	private async remove(actor: MiRemoteUser, activity: IRemove, resolver?: Resolver): Promise<string | void> {
		if (actor.uri !== activity.actor) {
			return 'invalid actor';
		}

		if (activity.target == null) {
			return 'target is null';
		}

		if (activity.target === actor.featured) {
			const note = await this.apNoteService.resolveNote(activity.object, { resolver });
			if (note == null) return 'note not found';
			await this.notePiningService.removePinned(actor, note.id);
			return;
		}

		// Handle chat room membership removal
		const targetUri = getApId(activity.target);
		this.logger.info(`[ApInboxService.remove] Processing Remove activity, target: ${targetUri}`);

		const roomIdMatch = targetUri.match(/\/chat\/rooms\/([a-zA-Z0-9]+)$/);
		if (roomIdMatch) {
			const roomId = roomIdMatch[1];
			this.logger.info(`[ApInboxService.remove] Matched room ID: ${roomId}, actor: ${actor.uri}`);

			const room = await this.chatRoomsRepository.findOneBy({ id: roomId });
			if (!room) {
				this.logger.warn(`[ApInboxService.remove] Room not found: ${roomId}`);
				return 'room not found';
			}

			// Delete the membership
			const result = await this.chatRoomMembershipsRepository.delete({
				roomId: room.id,
				userId: actor.id,
			});

			this.logger.info(`[ApInboxService.remove] Deleted membership, affected rows: ${result.affected}, room: ${room.id}, user: ${actor.id}`);
			return 'ok: removed from chat room';
		}

		return `unknown target: ${activity.target}`;
	}

	@bindThis
	private async undo(actor: MiRemoteUser, activity: IUndo, resolver?: Resolver): Promise<string> {
		if (actor.uri !== activity.actor) {
			return 'invalid actor';
		}

		const uri = activity.id ?? activity;

		this.logger.info(`Undo: ${uri}`);

		// eslint-disable-next-line no-param-reassign
		resolver ??= this.apResolverService.createResolver();

		const object = await resolver.resolve(activity.object).catch(e => {
			this.logger.error(`Resolution failed: ${e}`);
			throw e;
		});

		// don't queue because the sender may attempt again when timeout
		if (isFollow(object)) return await this.undoFollow(actor, object);
		if (isBlock(object)) return await this.undoBlock(actor, object);
		if (isLike(object)) return await this.undoLike(actor, object);
		if (isAnnounce(object)) return await this.undoAnnounce(actor, object);
		if (isAccept(object)) return await this.undoAccept(actor, object);
		if (isInvite(object)) return await this.undoInvite(actor, object);

		return `skip: unknown object type ${getApType(object)}`;
	}

	@bindThis
	private async undoAccept(actor: MiRemoteUser, activity: IAccept): Promise<string> {
		const follower = await this.apDbResolverService.getUserFromApId(activity.object);
		if (follower == null) {
			return 'skip: follower not found';
		}

		const isFollowing = await this.followingsRepository.exists({
			where: {
				followerId: follower.id,
				followeeId: actor.id,
			},
		});

		if (isFollowing) {
			await this.userFollowingService.unfollow(follower, actor);
			return 'ok: unfollowed';
		}

		return 'skip: フォローされていない';
	}

	@bindThis
	private async undoInvite(actor: MiRemoteUser, activity: IInvite): Promise<string> {
		// Parse the room object from the Invite activity
		const roomObject = activity.object;
		if (typeof roomObject === 'string') return 'skip: object must be a full object, not a URI';

		const roomUri = getApId(roomObject);
		if (!roomUri) return 'skip: invalid room object';

		// Extract room ID from URI
		const roomIdMatch = roomUri.match(/\/chat\/rooms\/([a-zA-Z0-9]+)$/);
		if (!roomIdMatch) return 'skip: invalid room URI format';
		const roomId = roomIdMatch[1];

		// Get the target user (invitee)
		const targetUri = getApHrefNullable(activity.target);
		if (!targetUri) return 'skip: invalid activity target';

		const invitee = await this.apDbResolverService.getUserFromApId(targetUri);
		if (!invitee) return 'skip: target user not found';
		if (!this.userEntityService.isLocalUser(invitee)) return 'skip: target user is not local';

		// Find and delete the invitation
		const invitation = await this.chatRoomInvitationsRepository.findOneBy({
			roomId: roomId,
			userId: invitee.id,
		});

		if (!invitation) {
			this.logger.warn(`Invitation not found: room=${roomId}, user=${invitee.id}`);
			return 'skip: invitation not found';
		}

		await this.chatRoomInvitationsRepository.delete(invitation.id);

		this.logger.info(`Cancelled invitation: room=${roomId}, user=${invitee.id}`);
		return 'ok: invitation cancelled';
	}

	@bindThis
	private async undoAnnounce(actor: MiRemoteUser, activity: IAnnounce): Promise<string> {
		const uri = getApId(activity);

		const note = await this.notesRepository.findOneBy({
			uri,
			userId: actor.id,
		});

		if (!note) return 'skip: no such Announce';

		await this.noteDeleteService.delete(actor, note);
		return 'ok: deleted';
	}

	@bindThis
	private async undoBlock(actor: MiRemoteUser, activity: IBlock): Promise<string> {
		const blockee = await this.apDbResolverService.getUserFromApId(activity.object);

		if (blockee == null) {
			return 'skip: blockee not found';
		}

		if (blockee.host != null) {
			return 'skip: ブロック解除しようとしているユーザーはローカルユーザーではありません';
		}

		await this.userBlockingService.unblock(await this.usersRepository.findOneByOrFail({ id: actor.id }), blockee);
		return 'ok';
	}

	@bindThis
	private async undoFollow(actor: MiRemoteUser, activity: IFollow): Promise<string> {
		const followee = await this.apDbResolverService.getUserFromApId(activity.object);
		if (followee == null) {
			return 'skip: followee not found';
		}

		if (followee.host != null) {
			return 'skip: フォロー解除しようとしているユーザーはローカルユーザーではありません';
		}

		const requestExist = await this.followRequestsRepository.exists({
			where: {
				followerId: actor.id,
				followeeId: followee.id,
			},
		});

		const isFollowing = await this.followingsRepository.exists({
			where: {
				followerId: actor.id,
				followeeId: followee.id,
			},
		});

		if (requestExist) {
			await this.userFollowingService.cancelFollowRequest(followee, actor);
			return 'ok: follow request canceled';
		}

		if (isFollowing) {
			await this.userFollowingService.unfollow(actor, followee);
			return 'ok: unfollowed';
		}

		return 'skip: リクエストもフォローもされていない';
	}

	@bindThis
	private async undoLike(actor: MiRemoteUser, activity: ILike): Promise<string> {
		const targetUri = getApId(activity.object);

		const note = await this.apNoteService.fetchNote(targetUri);
		if (!note) return `skip: target note not found ${targetUri}`;

		await this.reactionService.delete(actor, note).catch(e => {
			if (e.id === '60527ec9-b4cb-4a88-a6bd-32d3ad26817d') return;
			throw e;
		});

		return 'ok';
	}

	@bindThis
	private async update(actor: MiRemoteUser, activity: IUpdate, resolver?: Resolver): Promise<string> {
		const uri = getApId(activity);

		if (actor.uri !== activity.actor) {
			return 'skip: invalid actor';
		}

		this.logger.debug(`Update: ${uri}`);

		// eslint-disable-next-line no-param-reassign
		resolver ??= this.apResolverService.createResolver();

		const object = await resolver.resolve(activity.object).catch(e => {
			this.logger.error(`Resolution failed: ${e}`);
			throw e;
		});

		if (isActor(object)) {
			await this.apPersonService.updatePerson(actor.uri, resolver, object);
			return 'ok: Person updated';
		} else if (getApType(object) === 'Question') {
			await this.apQuestionService.updateQuestion(object, actor, resolver).catch(err => console.error(err));
			return 'ok: Question updated';
		} else if (getApType(object) === 'Note') {
			await this.updateNote(resolver, actor, object, false, activity);
			return 'ok: Note updated';
		} else {
			return `skip: Unknown type: ${getApType(object)}`;
		}
	}

	@bindThis
	private async updateNote(resolver: Resolver, actor: MiRemoteUser, note: IObject, silent = false, activity?: IUpdate): Promise<string> {
		const uri = getApId(note);

		if (typeof note === 'object') {
			if (actor.uri !== note.attributedTo) {
				return 'skip: actor.uri !== note.attributedTo';
			}

			if (typeof note.id === 'string') {
				if (this.utilityService.extractDbHost(actor.uri) !== this.utilityService.extractDbHost(note.id)) {
					return 'skip: host in actor.uri !== note.id';
				}
			}
		}

		const unlock = await this.appLockService.getApLock(uri);

		try {
			const target = await this.notesRepository.findOneBy({ uri: uri });
			if (!target) return `skip: target note not located: ${uri}`;
			await this.apNoteService.updateNote(note, target, resolver, silent);
			return 'ok';
		} catch (err) {
			if (err instanceof StatusError && err.isClientError) {
				return `skip ${err.statusCode}`;
			} else {
				throw err;
			}
		} finally {
			unlock();
		}
	}

	@bindThis
	private async move(actor: MiRemoteUser, activity: IMove, resolver?: Resolver): Promise<string> {
		// fetch the new and old accounts
		const targetUri = getApHrefNullable(activity.target);
		if (!targetUri) return 'skip: invalid activity target';

		return await this.apPersonService.updatePerson(actor.uri, resolver) ?? 'skip: nothing to do';
	}

	@bindThis
	private async invite(actor: MiRemoteUser, activity: IInvite, resolver?: Resolver): Promise<string> {
		// Parse the room object
		const roomObject = activity.object;
		if (typeof roomObject === 'string') return 'skip: object must be a full object, not a URI';

		const roomUri = getApId(roomObject);
		if (!roomUri) return 'skip: invalid room object';

		// Extract room ID from URI (format: https://example.com/chat/rooms/{roomId})
		const roomIdMatch = roomUri.match(/\/chat\/rooms\/([a-zA-Z0-9]+)$/);
		if (!roomIdMatch) return 'skip: invalid room URI format';
		const roomId = roomIdMatch[1];

		// Get the target user (invitee)
		const targetUri = getApHrefNullable(activity.target);
		if (!targetUri) return 'skip: invalid activity target';

		const invitee = await this.apDbResolverService.getUserFromApId(targetUri);
		if (!invitee) return 'skip: target user not found';
		if (!this.userEntityService.isLocalUser(invitee)) return 'skip: target user is not local';

		// Check if the room already exists locally
		let room = await this.chatRoomsRepository.findOneBy({ id: roomId });

		// If the room doesn't exist, create a local copy for the remote room
		if (!room) {
			const roomName = typeof roomObject.name === 'string' ? roomObject.name : 'Remote Chat Room';
			const roomDescription = typeof roomObject.summary === 'string' ? roomObject.summary : '';

			// Extract owner from attributedTo field
			let ownerId = actor.id; // Default to actor if attributedTo is not available

			if (roomObject.attributedTo) {
				// Handle both single value and array
				const attributedTo = Array.isArray(roomObject.attributedTo)
					? roomObject.attributedTo[0]
					: roomObject.attributedTo;
				const ownerUri = getApHrefNullable(attributedTo);

				if (ownerUri) {
					const owner = await this.apDbResolverService.getUserFromApId(ownerUri);
					if (owner) {
						ownerId = owner.id;
					}
				}
			}

			room = await this.chatRoomsRepository.insertOne({
				id: roomId,
				name: roomName,
				description: roomDescription,
				ownerId: ownerId,
				isArchived: false,
			});
		}

		// Check if invitation already exists
		const existingInvitation = await this.chatRoomInvitationsRepository.findOneBy({
			roomId: room.id,
			userId: invitee.id,
		});
		if (existingInvitation) {
			return 'skip: invitation already exists';
		}

		// Create the invitation directly
		const invitation = {
			id: this.idService.gen(),
			roomId: room.id,
			userId: invitee.id,
		};

		await this.chatRoomInvitationsRepository.insertOne(invitation);

		// Send local notification
		this.notificationService.createNotification(invitee.id, 'chatRoomInvitationReceived', {
			invitationId: invitation.id,
		}, actor.id);

		this.logger.info(`Created chat room invitation for local user ${invitee.id} to remote room ${room.id}`);
		return 'ok';
	}
}
