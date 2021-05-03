import $ from 'cafy';
import { ID } from '@/misc/cafy-id';
import define from '../../../define';
import { Users } from '../../../../../models';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーを後援者にします。',
		'en-US': 'Mark a user as patron.'
	},

	tags: ['admin'],

	requireCredential: true as const,
	requireAdmin: true,

	params: {
		userId: {
			validator: $.type(ID),
			desc: {
				'ja-JP': '対象のユーザーID',
				'en-US': 'The user ID'
			}
		},
	}
};

export default define(meta, async (ps) => {
	const user = await Users.findOne(ps.userId as string);

	if (user == null) {
		throw new Error('user not found');
	}

	/* if (user.isAdmin) {
		throw new Error('cannot mark as patron if admin user');
	} */

	await Users.update(user.id, {
		isPatron: true
	});
});
