/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { onMounted, onUnmounted, watch } from 'vue';
import { throttle } from 'throttle-debounce';
import type { Ref } from 'vue';

interface VirtualScrollerOptions {
	enabled: Ref<boolean>;
	buffer?: number;
	minItems?: number;
}

interface VirtualItem {
	id: string;
	element: HTMLElement;
	placeholder: HTMLElement | null;
	isVisible: boolean;
	height: number;
	top: number;
}

export function useTimelineVirtualScroller(
	containerRef: Ref<HTMLElement | null>,
	options: VirtualScrollerOptions,
) {
	const { enabled, buffer = 1000, minItems = 100 } = options;
	const items = new Map<string, VirtualItem>();
	let resizeObserver: ResizeObserver | null = null;

	const createPlaceholder = (height: number): HTMLElement => {
		const placeholder = window.document.createElement('div');
		placeholder.style.cssText = `height: ${height}px; min-height: ${height}px; pointer-events: none;`;
		return placeholder;
	};

	const hideItem = (item: VirtualItem) => {
		if (!item.isVisible || !item.element.parentElement) return;

		const rect = item.element.getBoundingClientRect();
		item.height = rect.height || 150;

		item.placeholder = createPlaceholder(item.height);
		item.element.parentElement.replaceChild(item.placeholder, item.element);
		item.isVisible = false;
	};

	const showItem = (item: VirtualItem) => {
		if (item.isVisible || !item.placeholder?.parentElement) return;

		item.placeholder.parentElement.replaceChild(item.element, item.placeholder);
		item.placeholder = null;
		item.isVisible = true;
	};

	const processVisibility = () => {
		if (!enabled.value || items.size < minItems) return;

		const scrollTop = window.scrollY;
		const viewportHeight = window.innerHeight;
		const topThreshold = scrollTop - buffer;
		const bottomThreshold = scrollTop + viewportHeight + buffer;

		for (const item of items.values()) {
			const element = item.isVisible ? item.element : item.placeholder;
			if (!element?.parentElement) continue;

			const rect = element.getBoundingClientRect();
			const elementTop = rect.top + scrollTop;
			const elementBottom = elementTop + rect.height;

			const shouldBeVisible = elementBottom > topThreshold && elementTop < bottomThreshold;

			if (shouldBeVisible && !item.isVisible) {
				showItem(item);
			} else if (!shouldBeVisible && item.isVisible) {
				hideItem(item);
			}
		}
	};

	const updateVisibility = throttle(100, processVisibility);
	const updateVisibilityImmediate = processVisibility;

	const registerItem = (element: HTMLElement) => {
		const id = element.dataset.noteId;
		if (!id || items.has(id)) return;

		items.set(id, {
			id,
			element,
			placeholder: null,
			isVisible: true,
			height: 0,
			top: 0,
		});

		resizeObserver?.observe(element);
	};

	const unregisterItem = (id: string) => {
		const item = items.get(id);
		if (!item) return;

		resizeObserver?.unobserve(item.element);
		item.placeholder?.parentElement && item.placeholder.replaceWith(item.element);
		items.delete(id);
	};

	const handleScroll = () => {
		updateVisibility();
	};

	const init = () => {
		if (!enabled.value || !containerRef.value) return;

		resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const id = (entry.target as HTMLElement).dataset.noteId;
				if (id) {
					const item = items.get(id);
					if (item && item.isVisible) {
						const newHeight = entry.contentRect.height;
						if (newHeight > 0) item.height = newHeight;
					}
				}
			}
		});

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', updateVisibility, { passive: true });

		containerRef.value.querySelectorAll<HTMLElement>('[data-note-id]').forEach(registerItem);
		updateVisibility();
	};

	const cleanup = () => {
		resizeObserver?.disconnect();
		window.removeEventListener('scroll', handleScroll);
		window.removeEventListener('resize', updateVisibility);

		items.forEach(item => {
			if (!item.isVisible && item.placeholder) {
				showItem(item);
			}
		});
		items.clear();
	};

	onMounted(() => enabled.value && containerRef.value && init());
	onUnmounted(cleanup);

	watch(enabled, (val) => val && containerRef.value ? init() : cleanup());
	watch(containerRef, (newC, oldC) => {
		oldC && cleanup();
		newC && enabled.value && init();
	});

	return {
		registerItem,
		unregisterItem,
		updateVisibility,
		getStats: () => {
			let visible = 0;
			items.forEach(i => i.isVisible && visible++);
			return { total: items.size, visible, hidden: items.size - visible };
		},
	};
}
