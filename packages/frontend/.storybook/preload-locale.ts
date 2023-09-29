/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { writeFile } from 'node:fs/promises';
import locales from '../../../locales/index.js';

await writeFile(
	new URL('locale.ts', import.meta.url),
	`export default ${JSON.stringify(locales['ko-KR'], undefined, 2)} as const;`,
	'utf8',
)
