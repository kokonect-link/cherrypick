import $ from 'cafy';
import define from '../../../define';
import { EmojiRequests } from '../../../../../models';
import { makePaginationQuery } from '../../../common/make-pagination-query';
import { ID } from '../../../../../misc/cafy-id';

export const meta = {
	tags: ['suggestions'],

	requireCredential: false as const,

	params: {
		proposerId: {
			validator: $.optional.type(ID),
		},

		includingStates: {
			validator: $.optional.arr($.str.or(['pending', 'rejected', 'accepted'])),
			default: [ 'pending', 'rejected', 'accepted' ]
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		sinceId: {
			validator: $.optional.type(ID),
		},

		untilId: {
			validator: $.optional.type(ID),
		}
	}
};

export default define(meta, async (ps) => {
	let q = makePaginationQuery(EmojiRequests.createQueryBuilder('req'), ps.sinceId, ps.untilId);

	if (ps.proposerId) {
		q = q.andWhere('req.proposerId = :proposerId', { proposerId: ps.proposerId });
	}

	// specify state
	if (ps.includingStates && ps.includingStates.length > 0) {
		q = q.andWhere('req.state in (:...states)', { states: ps.includingStates! });
	}

	const requests = await q.take(ps.limit!).getMany();
	return EmojiRequests.packMany(requests);
});
