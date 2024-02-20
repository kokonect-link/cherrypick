/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'cherrypick-js';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';

export async function editNickname(user: Misskey.entities.User) {
	if (!defaultStore.state.nicknameEnabled) return;
	const { result, canceled } = await os.inputText({
		title: i18n.ts.editNickName,
		placeholder: user.name || user.username,
		default: defaultStore.state.nicknameMap[user.id] ?? null,
	});
	if (canceled) return;
	const newMap = { ...defaultStore.state.nicknameMap };
	if (result) {
		newMap[user.id] = result;
	} else {
		delete newMap[user.id];
	}
	await defaultStore.set('nicknameMap', newMap);
}
