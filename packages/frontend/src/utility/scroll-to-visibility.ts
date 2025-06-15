/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { globalEvents } from '@/events.js';

const showEl = ref(false);
const showEl2 = ref(false);

export function scrollToVisibility() {
	const handleShowEl = (value: boolean) => {
		showEl.value = value;
	};
	const handleShowEl2 = (value: boolean) => {
		showEl2.value = value;
	};

	onMounted(() => {
		globalEvents.on('showEl', handleShowEl);
		globalEvents.on('showEl2', handleShowEl2);
	});

	onUnmounted(() => {
		globalEvents.off('showEl', handleShowEl);
		globalEvents.off('showEl2', handleShowEl2);
	});

	return { showEl, showEl2 };
}
