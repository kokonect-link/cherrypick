import define from '../../define';
import { RegistrationTickets } from '../../../../models';

export const meta = {
	desc: {
		'ja-JP': '招待コードを失効します。'
	},

	tags: ['admin'],

	requireCredential: true as const,
	requireModerator: true,

	params: {}
};

export default define(meta, async () => {
	await RegistrationTickets.delete({
	});
});
