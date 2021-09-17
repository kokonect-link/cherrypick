import $ from 'cafy';
import define from '../../../define';
import { ID } from '../../../../../misc/cafy-id';
import { DriveFiles, Emojis, EmojiRequests } from '../../../../../models';
import { ApiError } from '../../../error';
import { genId } from '../../../../../misc/gen-id';
import { fetchMeta } from '../../../../../misc/fetch-meta';

export const meta = {
	tags: ['suggestions'],

	requireCredential: true as const,

	params: {
		fileId: {
			validator: $.type(ID),
		},
		name: {
			validator: $.str,
		},
		aliases: {
			validator: $.arr($.str),
		},
		description: {
			validator: $.str
		},
	},

	errors: {
		noSuchFile: {
			message: 'No such file.',
			code: 'NO_SUCH_FILE',
			id: 'e9f3e270-a7c2-11ea-8619-ebae3e00218c'
		},
		notImage: {
			message: 'The specified file is not an image.',
			code: 'NOT_IMAGE',
			id: 'e0a20fc0-a7c3-11ea-83f1-47ad21540613'
		},
		alreadyExists: {
			message: 'The name is already exists.',
			code: 'ALREADY_EXISTS',
			id: '5c6ae780-a7c4-11ea-9cce-594df8f0a075'
		},
		tooManySuggestions: {
			message: 'You have reached the limit of suggestions.',
			code: 'TOO_MANY_SUGGESTIONS',
			id: 'c28fa1ef-c459-48dc-809a-99a40a4af48b'
		},
	}
};

export default define(meta, async (ps, user) => {
	const file = await DriveFiles.findOne(ps.fileId);

	if (file == null) throw new ApiError(meta.errors.noSuchFile);
	if (!file.type.startsWith('image')) throw new ApiError(meta.errors.notImage);

	// 既に存在している名前であればエラー
	if (await Emojis.findOne({ name: ps.name, host: null })) throw new ApiError(meta.errors.alreadyExists);

	const instance = await fetchMeta();

	// 上限に達していればエラー
	const count = await EmojiRequests.count({ where: { proposerId: user.id, state: 'pending' } }) + 1;
	const max = user.isAdmin || user.isModerator ? -1 : user.isVip ? instance.emojiSuggestionLimitationVip : instance.emojiSuggestionLimitation;
	if (max >= 0 && count > max) throw new ApiError(meta.errors.tooManySuggestions);

	await EmojiRequests.insert({
		id: genId(),
		createdAt: new Date(),
		name: ps.name,
		aliases: ps.aliases,
		fileId: ps.fileId,
		description: ps.description,
		proposerId: user.id,
	});
});
