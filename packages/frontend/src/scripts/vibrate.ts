/*
 * SPDX-FileCopyrightText: noridev and other cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ColdDeviceStorage } from '@/store.js';

export function vibrate(pattern: VibratePattern) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!ColdDeviceStorage.get('vibrate') || !window.navigator.vibrate) return;
	window.navigator.vibrate(pattern);
}
