/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultStore } from '@/store.js';

export function vibrate(pattern: VibratePattern) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!defaultStore.state.vibrate || !window.navigator.vibrate) return;
	window.navigator.vibrate(pattern);
}
