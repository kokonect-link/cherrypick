import $ from 'cafy';
import define from '../../../define';
import { EmojiRequests } from '../../../../../models';
import { makePaginationQuery } from '../../../common/make-pagination-query';
import { ID } from '../../../../../misc/cafy-id';
import { fetchMeta } from '../../../../../misc/fetch-meta';

export const meta = {
	tags: ['suggestions'],

	requireCredential: true as const,
};

export default define(meta, async (_, user) => {
	const instance = await fetchMeta();

	const current = await EmojiRequests.count({ where: { proposerId: user.id, state: 'pending' } });
	const max = user.isAdmin || user.isModerator ? -1 : user.isPremium ? instance.emojiSuggestionLimitationPremium : instance.emojiSuggestionLimitation;

	return {
		limit: max < 0 ? null : max - current,
	};
});
