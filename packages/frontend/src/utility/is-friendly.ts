/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ref } from 'vue';
import { miLocalStorage } from '@/local-storage.js';

export function isFriendly() {
	return ref(miLocalStorage.getItem('ui') === 'friendly');
}
