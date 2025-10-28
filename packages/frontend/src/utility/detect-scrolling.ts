/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { throttle } from 'throttle-debounce';
import type { Ref } from 'vue';
import { deviceKind } from '@/utility/device-kind.js';
import { globalEvents } from '@/events.js';
import { mainRouter } from '@/router.js';

export function detectScrolling(rootEl: Ref<HTMLElement | null>) {
	const MOBILE_THRESHOLD = 500;

	const isMobile = ref(['smartphone', 'tablet'].includes(String(deviceKind)) || window.innerWidth <= MOBILE_THRESHOLD);
	window.addEventListener('resize', () => {
		isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
	});

	const showEl = ref(false);
	const showEl2 = ref(false);
	const lastScrollPosition = ref(0);
	const isScrolling = ref(false);
	const isAtBottom = ref(false);

	const checkIfAtBottom = () => {
		if (rootEl.value) {
			const scrollTop = rootEl.value.scrollTop;
			const scrollHeight = rootEl.value.scrollHeight;
			const clientHeight = rootEl.value.clientHeight;

			const BOTTOM_THRESHOLD = 80;

			const isScrollable = scrollHeight > clientHeight + 1;
			const atBottom = isScrollable && (scrollTop + clientHeight >= scrollHeight - BOTTOM_THRESHOLD);

			if (atBottom !== isAtBottom.value) {
				isAtBottom.value = atBottom;
				globalEvents.emit('isAtBottom', atBottom);
				if (_DEV_) console.log('isAtBottom:', atBottom, { scrollTop, scrollHeight, clientHeight, isScrollable });
			}
		}
	};

	const onScroll = throttle(100, () => {
		const currentScrollPosition = rootEl.value ? rootEl.value.scrollTop : window.scrollY;
		isScrolling.value = true;

		if (_DEV_) console.log('currentScrollPosition:', currentScrollPosition);
		if (currentScrollPosition < 0) return;

		// Check if at bottom
		checkIfAtBottom();

		// Stop executing this function if the difference between
		// current scroll position and last scroll position is less than some offset
		if (Math.abs(currentScrollPosition - lastScrollPosition.value) < 60) return;

		showEl.value = currentScrollPosition < lastScrollPosition.value;
		lastScrollPosition.value = currentScrollPosition;
		showEl.value = !showEl.value;
		globalEvents.emit('showEl', showEl.value);

		if (isMobile.value) {
			if (showEl2.value) {
				showEl2.value = showEl.value;
			} else {
				window.setTimeout(() => {
					showEl2.value = showEl.value;
				}, 100);
			}

			nextTick(() => {
				globalEvents.emit('showEl2', showEl2.value);
			});
		}

		window.setTimeout(() => {
			isScrolling.value = false;
		}, 100);
	});

	onMounted(() => {
		if (rootEl.value) {
			if (_DEV_) {
				console.log('scrollHeight:', rootEl.value.scrollHeight);
				console.log('clientHeight:', rootEl.value.clientHeight);
			}
			rootEl.value.addEventListener('scroll', onScroll, { passive: true });
			rootEl.value.addEventListener('resize', checkIfAtBottom, { passive: true });
			checkIfAtBottom();
		} else {
			if (_DEV_) console.error('rootEl is null.');
		}
	});

	onUnmounted(() => {
		if (rootEl.value) {
			rootEl.value.removeEventListener('scroll', onScroll);
			rootEl.value.removeEventListener('resize', checkIfAtBottom);
		}
	});

	watch(() => mainRouter.currentRoute.value.path, () => {
		showEl.value = false;
		showEl2.value = false;
		lastScrollPosition.value = 0;
		isAtBottom.value = false;

		globalEvents.emit('showEl', false);
		globalEvents.emit('showEl2', false);
		globalEvents.emit('isAtBottom', false);
	});
}
