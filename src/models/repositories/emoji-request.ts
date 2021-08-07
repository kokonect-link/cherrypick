import { EntityRepository, Repository } from 'typeorm';
import { EmojiRequest } from '../entities/emoji-request';
import { Users, DriveFiles } from '..';
import { SchemaType } from '@/misc/schema';

export type PackedEmojiRequest = SchemaType<typeof packedEmojiRequestSchema>;

@EntityRepository(EmojiRequest)
export class EmojiRequestRepository extends Repository<EmojiRequest> {
	public async pack(
		src: EmojiRequest['id'] | EmojiRequest,
		me?: any
	): Promise<PackedEmojiRequest> {
		const {
			id, createdAt,
			fileId, file,
			name,
			aliases,
			description,
			proposerId, proposer,
			state,
			moderatorComment
		} = typeof src === 'object' ? src : await this.findOneOrFail(src);

		return {
			id, createdAt,
			name, aliases, description,
			fileId, proposerId,
			state, moderatorComment,
			file: await DriveFiles.pack(file || fileId, me),
			proposer: await Users.pack(proposer || proposerId, me),
		};
	}

	public packMany(
		requests: (EmojiRequest['id'] | EmojiRequest)[],
		me?: any
	): Promise<PackedEmojiRequest[]>  {
		return Promise.all(requests.map(x => this.pack(x, me)));
	}
}

export const packedEmojiRequestSchema = {
	type: 'object' as const,
	optional: false as const, nullable: false as const,
	properties: {
		id: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'id',
			description: 'The unique identifier for this emoji.',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'date-time',
			description: 'The date that the request was created on Groundpolis.'
		},
		fileId: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
		},
		file: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
		},
		name: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
		},
		aliases: {
			type: 'array' as const,
			optional: false as const, nullable: false as const,
		},
		description: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
		},
		proposerId: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
		},
		proposer: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
		},
		state: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
		},
		moderatorComment: {
			type: 'string' as const,
			optional: false as const, nullable: true as const,
		},
	},
};
