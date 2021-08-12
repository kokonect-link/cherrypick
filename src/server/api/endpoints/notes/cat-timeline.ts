import $ from 'cafy';
import { ID } from '@/misc/cafy-id';
import define from '../../define';
import { fetchMeta } from '@/misc/fetch-meta';
import { ApiError } from '../../error';
import { makePaginationQuery } from '../../common/make-pagination-query';
import { Notes } from '../../../../models';
import { generateMutedUserQuery } from '../../common/generate-muted-user-query';
import { activeUsersChart } from '../../../../services/chart';
import { generateRepliesQuery } from '../../common/generate-replies-query';
import { injectPromo } from '../../common/inject-promo';
import { injectFeatured } from '../../common/inject-featured';
import { generateMutedNoteQuery } from '../../common/generate-muted-note-query';

export const meta = {
	tags: ['notes'],

	params: {
		withFiles: {
			validator: $.optional.bool,
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
		},

		sinceDate: {
			validator: $.optional.num
		},

		untilDate: {
			validator: $.optional.num
		},
	},

	res: {
		type: 'array' as const,
		optional: false as const, nullable: false as const,
		items: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
			ref: 'Note',
		}
	},

	errors: {
		ctlDisabled: {
			message: 'Cat timeline has been disabled.',
			code: 'CTL_DISABLED',
			id: '34e75d20-a18d-11ea-904d-05cf299ca891'
		},
	}
};

export default define(meta, async (ps, user) => {
	const m = await fetchMeta();
	if (m.disableCatTimeline) {
		if (user == null || (!user.isAdmin && !user.isModerator)) {
			throw new ApiError(meta.errors.ctlDisabled);
		}
	}

	//#region Construct query
	const query = makePaginationQuery(Notes.createQueryBuilder('note'),
		ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
		.andWhere('note.visibility = \'public\'')
		.andWhere('(select "isCat" from "user" where id = note."userId")')
		.leftJoinAndSelect('note.user', 'user');

	generateRepliesQuery(query, user);
	if (user) generateMutedUserQuery(query, user);
	if (user) generateMutedNoteQuery(query, user);

	if (ps.withFiles) {
		query.andWhere('note.fileIds != \'{}\'');
	}
	//#endregion

	const timeline = await query.take(ps.limit!).getMany();

	// await injectPromo(timeline, user);
	// await injectFeatured(timeline, user);

	process.nextTick(() => {
		if (user) {
			activeUsersChart.update(user);
		}
	});

	return await Notes.packMany(timeline, user);
});
