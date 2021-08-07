import $ from 'cafy';
import define from '../../../../define';
import { ID } from '../../../../../../misc/cafy-id';
import { EmojiRequests, Emojis, DriveFiles } from '../../../../../../models';
import { ApiError } from '../../../../error';
import { genId } from '../../../../../../misc/gen-id';
import { getConnection } from 'typeorm';
import { publishBroadcastStream } from '../../../../../../services/stream';
import { insertModerationLog } from '../../../../../../services/insert-moderation-log';

export const meta = {
	tags: ['admin'],

	requireCredential: true as const,
	requireModerator: true as const,

	params: {
		suggestionId: {
			validator: $.type(ID),
		},
	},

	errors: {
		noSuchSuggestion: {
			message: 'No such suggestion.',
			code: 'NO_SUCH_SUGGESTION',
			id: 'd941af30-a7f8-11ea-b61b-7f7ca4853fd9'
		},
		noSuchFile: {
			message: 'Suggested emoji file is deleted.',
			code: 'NO_SUCH_FILE',
			id: '891261c0-a7f9-11ea-b315-053fb9a79850',
		},
		alreadyAccepted: {
			message: 'Already accepted.',
			code: 'ALREADY_ACCEPTED',
			id: 'f42f01e0-a7fc-11ea-89d1-d7f25ec3961d',
		},
	}
};

export default define(meta, async (ps, me) => {
	const req = await EmojiRequests.findOne(ps.suggestionId);
	if (!req) throw new ApiError(meta.errors.noSuchSuggestion);

	// 承認済みであればエラー
	if (req.state === 'accepted') throw new ApiError(meta.errors.alreadyAccepted);

	EmojiRequests.update(req.id, {
		state: 'accepted',
		moderatorComment: null,
	});

	const file = await DriveFiles.findOne(req.fileId);
	if (!file) throw new ApiError(meta.errors.noSuchFile);

	const emoji = await Emojis.save({
		id: genId(),
		updatedAt: new Date(),
		name: req.name,
		category: null,
		host: null,
		aliases: req.aliases,
		url: file.url,
		type: file.type,
	});


	await getConnection().queryResultCache!.remove(['meta_emojis']);

	publishBroadcastStream('emojiAdded', {
		emoji: await Emojis.pack(emoji.id)
	});

	insertModerationLog(me, 'addEmoji', {
		emojiId: emoji.id
	});
});
