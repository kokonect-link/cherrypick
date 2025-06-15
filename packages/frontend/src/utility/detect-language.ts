/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { detect } from 'tinyld';
import * as mfm from 'mfc-js';

export default function detectLanguage(text: string): string {
	const nodes = mfm.parse(text);
	const filtered = mfm.extract(nodes, (node) => {
		return node.type === 'text' || node.type === 'quote';
	});
	const purified = mfm.toString(filtered);

	if (detect(purified) === '') return 'en';
	return detect(purified);
}
