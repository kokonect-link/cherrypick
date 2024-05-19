/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export default (v) => {
	if (v == null) return '?';
	const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
	if (v === 0) return sizes[0];
	const i = Math.floor(Math.log(v) / Math.log(1024));
	return sizes[i];
};
