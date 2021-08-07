import $ from 'cafy';
import define from '../../../define';
import { ID } from '../../../../../misc/cafy-id';
import { EmojiRequests } from '../../../../../models';
import { ApiError } from '../../../error';

export const meta = {
	tags: ['suggestions'],

	requireCredential: true as const,

	params: {
		id: {
			validator: $.type(ID),
		},
	},

	errors: {
		noSuchSuggestion: {
			message: 'No such suggestion.',
			code: 'NO_SUCH_SUGGESTION',
			id: '3105e770-a7d3-11ea-a1b1-7b172efd1bb8'
		},
		itIsNotYourSuggestion: {
			message: 'You can not delete other user\'s suggestion.',
			code: 'IT_IS_NOT_YOUR_SUGGESTION',
			id: '3c3f7b00-a7d4-11ea-b04a-b93abd1ecc70'
		}
	}
};

export default define(meta, async ({ id }, user) => {
	const req = await EmojiRequests.findOne(id);

	if (req == null) throw new ApiError(meta.errors.noSuchSuggestion);

	// 自分自身の提案ではなく、なおかつ自分が管理者でもモデレーターでも無ければエラー
	if (req.proposerId !== user.id && !user.isAdmin && !user.isModerator) throw new ApiError(meta.errors.itIsNotYourSuggestion);

	await EmojiRequests.delete(id);
});
