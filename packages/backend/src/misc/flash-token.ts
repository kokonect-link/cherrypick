/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MiLocalUser } from '@/models/User.js';

export type FlashToken = {
	permissions: string[];
	user: MiLocalUser
};
