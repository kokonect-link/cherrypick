/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as mfm from 'cherrypick-mfm-js';
import * as misskey from 'cherrypick-js';
import { extractUrlFromMfm } from './extract-url-from-mfm';

export function shouldCollapsed(note: misskey.entities.Note): boolean {
	const urls = note.text ? extractUrlFromMfm(mfm.parse(note.text)) : null;
	return note.cw == null && note.text != null && (
		(note.text.split('\n').length > 9) ||
		(note.text.length > 500) ||
		(note.files.length >= 5) ||
		(!!urls && urls.length >= 4)
	);
}

export function shouldMfmCollapsed(note: misskey.entities.Note): boolean {
	return note.cw == null && note.text != null && (
		(note.text.includes('$[x2')) ||
		(note.text.includes('$[x3')) ||
		(note.text.includes('$[x4')) ||
		(note.text.includes('$[scale'))
	);
}
