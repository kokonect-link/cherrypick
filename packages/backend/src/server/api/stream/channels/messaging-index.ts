/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { bindThis } from '@/decorators.js';
import Channel from '../channel.js';

class MessagingIndexChannel extends Channel {
	public readonly chName = 'messagingIndex';
	public static shouldShare = true;
	public static requireCredential = true;

	@bindThis
	public async init(params: any) {
		// Subscribe messaging index stream
		this.subscriber.on(`messagingIndexStream:${this.user!.id}`, data => {
			this.send(data);
		});
	}
}

@Injectable()
export class MessagingIndexChannelService {
	public readonly shouldShare = MessagingIndexChannel.shouldShare;
	public readonly requireCredential = MessagingIndexChannel.requireCredential;
	public readonly kind: string = 'messagingIndex'; // kind の型を string に変更し、適切な値を代入する

	constructor() {}

	@bindThis
	public create(id: string, connection: Channel['connection']): MessagingIndexChannel {
		return new MessagingIndexChannel(
			id,
			connection,
		);
	}
}
