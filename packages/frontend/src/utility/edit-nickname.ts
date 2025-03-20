/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'cherrypick-js';
import * as os from '@/os.js';
import { prefer } from '@/preferences.js';
import { i18n } from '@/i18n.js';

export async function editNickname(user: Misskey.entities.User) {
	if (!prefer.s.nicknameEnabled) return;
	const { result, canceled } = await os.inputText({
		title: i18n.ts.editNickName,
		placeholder: user.name || user.username,
		default: prefer.s.nicknameMap[user.id] ?? null,
	});
	if (canceled) return;
	const newMap = { ...prefer.s.nicknameMap };
	if (result) {
		newMap[user.id] = result;
	} else {
		delete newMap[user.id];
	}
	await prefer.commit('nicknameMap', newMap);
}
