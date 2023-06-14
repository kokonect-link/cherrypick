import * as misskey from 'cherrypick-js';
import * as Acct from 'cherrypick-js/built/acct';
import { url } from '@/config';
import { defaultStore } from '@/store';

export const acct = (user: misskey.Acct) => {
	return Acct.toString(user);
};

export const userName = (user: misskey.entities.User) => {
	if (!defaultStore.state.nicknameEnabled) {
		return user.name || user.username;
	}
	return defaultStore.reactiveState.nicknameMap.value[user.id] || user.name || user.username;
};

export const userPage = (user: misskey.Acct, path?, absolute = false) => {
	return `${absolute ? url : ''}/@${acct(user)}${(path ? `/${path}` : '')}`;
};
