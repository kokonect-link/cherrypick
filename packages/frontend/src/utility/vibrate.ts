/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { prefer } from '@/preferences.js';

export function vibrate(pattern: VibratePattern) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!prefer.s.vibrate || !window.navigator.vibrate) return;
	window.navigator.vibrate(pattern);
}
