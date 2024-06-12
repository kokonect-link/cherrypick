/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'cherrypick-js';

export function shouldCollapsed(note: Misskey.entities.Note, urls: string[]): boolean {
	return note.cw == null && (
		note.text != null && (
			(note.text.split('\n').length > 9) ||
			(note.text.length > 500) ||
			(urls.length >= 4)
		) || note.files.length >= 5
	);
}

export function shouldMfmCollapsed(note: Misskey.entities.Note): boolean {
	return note.cw == null && note.text != null && (
		(note.text.includes('$[x2')) ||
		(note.text.includes('$[x3')) ||
		(note.text.includes('$[x4')) ||
		(note.text.includes('$[scale'))
	);
}
