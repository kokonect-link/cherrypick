/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MenuItem } from '@/types/menu.js';

// Add dividers between menu sections. if some menu section has menu item
export function addDividersBetweenMenuSections(...sections:MenuItem[][]): MenuItem[] {
	const result:MenuItem[] = [];

	let needDivider = false;
	for (const section of sections) {
		if (section.length !== 0) {
			if (needDivider) result.push({ type: 'divider' });
			needDivider = true;
			result.push(...section);
		}
	}

	return result;
}
