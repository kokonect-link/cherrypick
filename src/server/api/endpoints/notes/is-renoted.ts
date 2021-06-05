import $ from 'cafy';
import { ID } from '@/misc/cafy-id';
import define from '../../define';
import { getNote } from '../../common/getters';
import { ApiError } from '../../error';
import { generateVisibilityQuery } from '../../common/generate-visibility-query';
import { generateMutedUserQuery } from '../../common/generate-muted-user-query';
import { makePaginationQuery } from '../../common/make-pagination-query';
import { Notes } from '../../../../models';
import { Brackets } from 'typeorm';

export const meta = {
	desc: {
		'ja-JP': '指定した投稿がRenote, 引用されているかどうかを取得します。',
		'en-US': 'Get whether the specified note is renoted or quoted.'
	},

	tags: ['notes'],

	requireCredential: false as const,

	params: {
		noteId: {
			validator: $.type(ID),
			desc: {
				'ja-JP': '対象の投稿のID',
				'en-US': 'Target note ID'
			}
		},
	},

	res: {
		type: 'object' as const,
		optional: false as const, nullable: false as const,
	},

	errors: {
		noSuchNote: {
			message: 'No such note.',
			code: 'NO_SUCH_NOTE',
			id: '12908022-2e21-46cd-ba6a-3edaf6093f46'
		}
	}
};

export default define(meta, async (ps, user) => {
	const note = await getNote(ps.noteId).catch(e => {
		if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new ApiError(meta.errors.noSuchNote);
		throw e;
	});

	const query = makePaginationQuery(Notes.createQueryBuilder('note'))
		.andWhere(`note.renoteId = :renoteId`, { renoteId: note.id })
		.andWhere(`note.text IS NULL`)
		.andWhere(`note.fileIds = '{}'`)
		.andWhere(`note.hasPoll = FALSE`)
		.leftJoinAndSelect('note.user', 'user');

	const query2 = makePaginationQuery(Notes.createQueryBuilder('note'))
		.andWhere(new Brackets(qb => { qb
			.where(`note.renoteId = :noteId`, { noteId: ps.noteId })
			.andWhere(new Brackets(qb => { qb
				.where(`note.text IS NOT NULL`)
				.orWhere(`note.fileIds != '{}'`)
				.orWhere(`note.hasPoll = TRUE`);
			}));
		}));

	generateVisibilityQuery(query, user);
	generateVisibilityQuery(query2, user);

	if (user) {
		generateMutedUserQuery(query, user);
		generateMutedUserQuery(query2, user);
	}

	const isRenoted = await query.getCount() > 0;
	const isQuoted = await query2.getCount() > 0;

	return { isRenoted, isQuoted };
});
