/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { onMounted, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';
import { throttle } from 'throttle-debounce';

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
}

export function useTimelineVirtualScroller(
	containerRef: Ref<HTMLElement | null>,
	options: VirtualScrollerOptions,
) {
	const { enabled, buffer = 1000, minItems = 100 } = options;
	const items = new Map<string, VirtualItem>();
	let observer: IntersectionObserver | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let styleElement: HTMLStyleElement | null = null;

	const injectStyles = () => {
		if (styleElement) return;
		styleElement = window.document.createElement('style');
		styleElement.textContent = `
			.timeline-item-placeholder {
				pointer-events: none !important;
				user-select: none;
				filter: blur(4px);
				-webkit-filter: blur(4px);
				opacity: 0.6;
			}

			.timeline-item-placeholder img,
			.timeline-item-placeholder video,
			.timeline-item-placeholder canvas {
				filter: grayscale(100%);
				-webkit-filter: grayscale(100%);
			}

			.timeline-item-placeholder a,
			.timeline-item-placeholder button,
			.timeline-item-placeholder input,
			.timeline-item-placeholder textarea {
				pointer-events: none !important;
			}

			.timeline-item-fade-in {
				filter: blur(4px) !important;
				-webkit-filter: blur(4px) !important;
				opacity: 0.6 !important;
			}

			.timeline-item-fade-in img,
			.timeline-item-fade-in video,
			.timeline-item-fade-in canvas {
				filter: grayscale(100%) !important;
				-webkit-filter: grayscale(100%) !important;
			}

			[data-note-id]:not(.timeline-item-placeholder) {
				transition: filter 0.3s ease, opacity 0.3s ease;
				-webkit-transition: -webkit-filter 0.3s ease, opacity 0.3s ease;
			}

			[data-note-id]:not(.timeline-item-placeholder) img,
			[data-note-id]:not(.timeline-item-placeholder) video,
			[data-note-id]:not(.timeline-item-placeholder) canvas {
				transition: filter 0.3s ease;
				-webkit-transition: -webkit-filter 0.3s ease;
			}
		`;
		window.document.head.appendChild(styleElement);
	};

	const createPlaceholder = (item: VirtualItem): HTMLElement => {
		const placeholder = item.element.cloneNode(true) as HTMLElement;
		placeholder.classList.add('timeline-item-placeholder');
		placeholder.dataset.noteId = item.id;
		placeholder.style.cssText = `height: ${item.height}px; min-height: ${item.height}px; max-height: ${item.height}px; overflow: hidden;`;
		return placeholder;
	};

	const hideItem = (item: VirtualItem) => {
		if (!item.isVisible || !item.element.parentElement) return;
		item.height = item.element.offsetHeight || 150;
		item.placeholder = createPlaceholder(item);
		item.element.parentElement.replaceChild(item.placeholder, item.element);
		item.isVisible = false;
	};

	const showItem = (item: VirtualItem) => {
		if (item.isVisible || !item.placeholder?.parentElement) return;
		item.element.classList.add('timeline-item-fade-in');
		item.placeholder.parentElement.replaceChild(item.element, item.placeholder);
		item.placeholder = null;
		item.isVisible = true;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				item.element.classList.remove('timeline-item-fade-in');
			});
		});
	};

	const updateVisibility = throttle(150, () => {
		if (!enabled.value || items.size < minItems) return;
		const scrollTop = window.scrollY;
		const viewportHeight = window.innerHeight;
		const topThreshold = scrollTop - buffer;
		const bottomThreshold = scrollTop + viewportHeight + buffer;

		for (const item of items.values()) {
			const element = item.isVisible ? item.element : item.placeholder;
			if (!element) continue;

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
	});

	const registerItem = (element: HTMLElement) => {
		const id = element.dataset.noteId;
		if (!id || items.has(id)) return;

		const item: VirtualItem = {
			id,
			element,
			placeholder: null,
			isVisible: true,
			height: 0,
		};

		items.set(id, item);
		resizeObserver?.observe(element);
		observer?.observe(element);
	};

	const unregisterItem = (id: string) => {
		const item = items.get(id);
		if (!item) return;

		observer?.unobserve(item.element);
		resizeObserver?.unobserve(item.element);

		if (item.placeholder?.parentElement) {
			item.placeholder.replaceWith(item.element);
		}

		items.delete(id);
	};

	const init = () => {
		if (!enabled.value || !containerRef.value) return;

		injectStyles();

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).dataset.noteId;
					if (id && entry.isIntersecting) {
						const item = items.get(id);
						if (item) showItem(item);
					}
				}
				updateVisibility();
			},
			{ rootMargin: `${buffer}px 0px`, threshold: 0 },
		);

		resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const id = (entry.target as HTMLElement).dataset.noteId;
				const item = id ? items.get(id) : null;
				if (item) item.height = entry.contentRect.height;
			}
		});

		window.addEventListener('scroll', updateVisibility, { passive: true });
		window.addEventListener('resize', updateVisibility, { passive: true });

		containerRef.value.querySelectorAll<HTMLElement>('[data-note-id]').forEach(registerItem);
		updateVisibility();
	};

	const cleanup = () => {
		observer?.disconnect();
		resizeObserver?.disconnect();
		window.removeEventListener('scroll', updateVisibility);
		window.removeEventListener('resize', updateVisibility);

		for (const item of items.values()) {
			if (!item.isVisible && item.placeholder) showItem(item);
		}

		items.clear();

		if (styleElement?.parentElement) {
			styleElement.parentElement.removeChild(styleElement);
			styleElement = null;
		}
	};

	onMounted(() => {
		if (enabled.value && containerRef.value) init();
	});

	onUnmounted(cleanup);

	watch(enabled, (newValue) => {
		if (newValue && containerRef.value) init();
		else cleanup();
	});

	watch(containerRef, (newContainer, oldContainer) => {
		if (oldContainer) cleanup();
		if (newContainer && enabled.value) init();
	});

	return {
		registerItem,
		unregisterItem,
		updateVisibility,
		getStats: () => ({
			total: items.size,
			visible: Array.from(items.values()).filter(i => i.isVisible).length,
			hidden: Array.from(items.values()).filter(i => !i.isVisible).length,
		}),
	};
}
