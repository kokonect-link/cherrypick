import $ from 'cafy';
import define from '../../../../define';
import { ID } from '../../../../../../misc/cafy-id';
import { EmojiRequests } from '../../../../../../models';
import { ApiError } from '../../../../error';

export const meta = {
	tags: ['admin'],

	requireCredential: true as const,
	requireModerator: true as const,

	params: {
		suggestionId: {
			validator: $.type(ID),
		},
		comment: {
			validator: $.optional.str,
			default: null
		},
	},

	errors: {
		noSuchSuggestion: {
			message: 'No such suggestion.',
			code: 'NO_SUCH_SUGGESTION',
			id: 'd941af30-a7f8-11ea-b61b-7f7ca4853fd9'
		},
		alreadyAccepted: {
			message: 'Already accepted.',
			code: 'ALREADY_ACCEPTED',
			id: 'e9761000-a7fb-11ea-9591-0f668ff23de8'
		},
		alreadyRejected: {
			message: 'Already rejected.',
			code: 'ALREADY_REJECTED',
			id: 'f42f01e0-a7fc-11ea-89d1-d7f25ec3961d',
		},
	}
};

export default define(meta, async (ps) => {
	const req = await EmojiRequests.findOne(ps.suggestionId);
	if (!req) throw new ApiError(meta.errors.noSuchSuggestion);

	// 承認済みの場合、既に絵文字が追加されているので却下できない
	if (req.state === 'accepted') throw new ApiError(meta.errors.alreadyAccepted);

	if (req.state === 'rejected') throw new ApiError(meta.errors.alreadyRejected);

	EmojiRequests.update(req.id, {
		state: 'rejected',
		moderatorComment: ps.comment,
	});
});
