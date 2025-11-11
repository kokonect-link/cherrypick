/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as mfm from 'mfc-js';

interface CacheEntry {
	result: mfm.MfmNode[];
	timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 150;

/**
 * Parse MFC text with LRU caching
 * Improves performance by caching parsed MFC results
 */
export function parseMfmCached(text: string): mfm.MfmNode[] {
	if (cache.has(text)) {
		const entry = cache.get(text)!;
		// Update timestamp for LRU
		entry.timestamp = Date.now();
		return entry.result;
	}

	const result = mfm.parse(text);
	cache.set(text, { result, timestamp: Date.now() });

	// Clean up oldest entries if cache is too large
	if (cache.size > MAX_CACHE_SIZE) {
		const entries = Array.from(cache.entries());
		const oldest = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
		cache.delete(oldest[0]);
	}

	return result;
}

/**
 * Get current cache size (for debugging)
 */
export function getMfmCacheSize(): number {
	return cache.size;
}

/**
 * Clear the MFC cache (for testing)
 */
export function clearMfmCache(): void {
	cache.clear();
}
