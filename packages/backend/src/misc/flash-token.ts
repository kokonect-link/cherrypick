/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MiLocalUser } from '@/models/User.js';

export type FlashToken = {
	permissions: string[];
	user: MiLocalUser
};
