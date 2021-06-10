import $ from 'cafy';
import define from '../../define';
import { Users } from '@/models';
import { Brackets } from 'typeorm';
import { ID } from '@/misc/cafy-id';
import { makePaginationQuery } from '../../common/make-pagination-query';
import { generateMutedUserQueryForUsers } from '../../common/generate-muted-user-query';
import parseAcct from '../../../../misc/acct/parse';

export const meta = {
	tags: ['users'],

	requireCredential: false as const,

	params: {
		query: {
			validator: $.str
		},

		sinceId: {
			validator: $.optional.type(ID),
		},

		untilId: {
			validator: $.optional.type(ID),
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},
	},

	res: {
		type: 'array' as const,
		optional: false as const, nullable: false as const,
		items: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
			ref: 'User',
		}
	},

	errors: {
	}
};

export default define(meta, async (ps, me) => {
	const trimmed = ps.query.trim();
	const query = makePaginationQuery(Users.createQueryBuilder('user'), ps.sinceId, ps.untilId)
		.andWhere('user.isSuspended = FALSE');

	console.log(`trimmed: ${trimmed}`);

	for (const word of trimmed.split(/\s+/)) {
		query.andWhere(new Brackets(qb => {
			const q = `%${word}%`;
			const parsed = word.startsWith('@') ? parseAcct(word) : null;
			if (parsed) {
				qb.where('"user".username ILIKE :q', { q: `%${parsed.username}%` });
				if (parsed.host) {
					qb.andWhere('"user".host ILIKE :q', { q: `%${parsed.host}%` });
				}
			} else {
				qb.where('user.username ILIKE :q', { q })
					.orWhere('user.name ILIKE :q', { q })
					.orWhere('user.host ILIKE :q', { q })
					.orWhere('(select "description" from "user_profile" where "userId" = user.id) ILIKE :q', { q })
					.orWhere('(select "location" from "user_profile" where "userId" = user.id) ILIKE :q', { q });
			}
		}));
	}

	query.orderBy('user.updatedAt', 'DESC', 'NULLS LAST');

	if (me) generateMutedUserQueryForUsers(query, me);

	const users = await query.take(ps.limit!).getMany();

	return await Users.packMany(users, me, { detail: true });
});
