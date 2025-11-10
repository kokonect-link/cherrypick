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
	maxPlaceholders?: number;
}

interface VirtualItem {
	id: string;
	element: HTMLElement;
	placeholder: HTMLElement | null;
	spacer: HTMLElement | null;
	isVisible: boolean;
	height: number;
	top: number;
}

export function useTimelineVirtualScroller(
	containerRef: Ref<HTMLElement | null>,
	options: VirtualScrollerOptions,
) {
	const { enabled, buffer = 1000, minItems = 100, maxPlaceholders = 20 } = options;
	const items = new Map<string, VirtualItem>();
	let resizeObserver: ResizeObserver | null = null;
	let styleElement: HTMLStyleElement | null = null;

	const injectStyles = () => {
		if (styleElement) return;
		styleElement = window.document.createElement('style');
		styleElement.textContent = `
			.timeline-item-placeholder {
				pointer-events: none !important;
				user-select: none;
				-webkit-filter: blur(4px);
				filter: blur(4px);
				opacity: 0.6;
			}

			.timeline-item-placeholder img,
			.timeline-item-placeholder video,
			.timeline-item-placeholder canvas {
				-webkit-filter: grayscale(100%);
				filter: grayscale(100%);
			}

			.timeline-item-fade-in {
				-webkit-filter: blur(4px) !important;
				filter: blur(4px) !important;
				opacity: 0.6 !important;
			}

			.timeline-item-fade-in img,
			.timeline-item-fade-in video,
			.timeline-item-fade-in canvas {
				-webkit-filter: grayscale(100%) !important;
				filter: grayscale(100%) !important;
			}

			[data-note-id]:not(.timeline-item-placeholder) {
				-webkit-transition: -webkit-filter 0.3s ease, opacity 0.3s ease;
				transition: filter 0.3s ease, opacity 0.3s ease;
			}

			[data-note-id]:not(.timeline-item-placeholder) img,
			[data-note-id]:not(.timeline-item-placeholder) video,
			[data-note-id]:not(.timeline-item-placeholder) canvas {
				-webkit-transition: -webkit-filter 0.3s ease;
				transition: filter 0.3s ease;
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

	const createSpacer = (item: VirtualItem): HTMLElement => {
		const spacer = window.document.createElement('div');
		spacer.dataset.noteId = item.id;
		spacer.dataset.spacer = 'true';
		spacer.style.cssText = `height: ${item.height}px; min-height: ${item.height}px;`;
		return spacer;
	};

	const hideItem = (item: VirtualItem) => {
		if (!item.isVisible || !item.element.parentElement) return;
		item.height = item.element.offsetHeight || 150;
		item.placeholder = createPlaceholder(item);
		item.element.parentElement.replaceChild(item.placeholder, item.element);
		item.isVisible = false;
	};

	const showItem = (item: VirtualItem, animate = true) => {
		const current = item.spacer ?? item.placeholder;
		if (item.isVisible || !current?.parentElement) return;

		if (animate) {
			item.element.classList.add('timeline-item-fade-in');
			const timeoutId = window.setTimeout(() => {
				item.element.classList.remove('timeline-item-fade-in');
			}, 300);

			const handleFastScroll = () => {
				window.clearTimeout(timeoutId);
				item.element.classList.remove('timeline-item-fade-in');
			};

			window.addEventListener('wheel', handleFastScroll, { once: true, passive: true });
			window.addEventListener('touchmove', handleFastScroll, { once: true, passive: true });
		} else {
			item.element.classList.remove('timeline-item-fade-in');
		}

		current.parentElement.replaceChild(item.element, current);
		item.placeholder = null;
		item.spacer = null;
		item.isVisible = true;
	};

	const hideToSpacer = (item: VirtualItem) => {
		if (!item.isVisible || !item.element.parentElement) return;
		item.height = item.element.offsetHeight || 150;
		item.spacer = createSpacer(item);
		item.element.parentElement.replaceChild(item.spacer, item.element);
		item.isVisible = false;
	};

	const processVisibility = (animate: boolean) => {
		if (!enabled.value || items.size < minItems) return;

		const scrollTop = window.scrollY;
		const viewportHeight = window.innerHeight;
		const topThreshold = scrollTop - buffer;
		const bottomThreshold = scrollTop + viewportHeight + buffer;
		const placeholderBuffer = maxPlaceholders * 200;

		let topPCount = 0;
		let bottomPCount = 0;

		const itemsArray = Array.from(items.values());
		for (const item of itemsArray) {
			const element = item.isVisible ? item.element : (item.placeholder ?? item.spacer);
			if (element?.parentElement) {
				const rect = element.getBoundingClientRect();
				item.top = rect.top + scrollTop;
			}
		}
		itemsArray.sort((a, b) => a.top - b.top);

		for (const item of itemsArray) {
			const element = item.isVisible ? item.element : (item.placeholder ?? item.spacer);
			if (!element?.parentElement) continue;

			const bottom = item.top + (item.height || 150);
			const inViewport = bottom > topThreshold && item.top < bottomThreshold;
			const inPlaceholderZone = bottom > (topThreshold - placeholderBuffer) &&
			                          item.top < (bottomThreshold + placeholderBuffer);

			if (inViewport) {
				if (!item.isVisible) showItem(item, animate);
			} else if (inPlaceholderZone) {
				const isTop = item.top < topThreshold;
				const count = isTop ? topPCount : bottomPCount;

				if (count < maxPlaceholders) {
					if (item.isVisible) {
						hideItem(item);
					} else if (item.spacer?.parentElement) {
						item.placeholder = createPlaceholder(item);
						item.spacer.parentElement.replaceChild(item.placeholder, item.spacer);
						item.spacer = null;
					}
					if (isTop) topPCount++;
					else bottomPCount++;
				} else {
					if (item.placeholder?.parentElement) {
						item.spacer = createSpacer(item);
						item.placeholder.parentElement.replaceChild(item.spacer, item.placeholder);
						item.placeholder = null;
					} else if (item.isVisible) {
						hideToSpacer(item);
					}
				}
			} else {
				if (item.isVisible) {
					hideToSpacer(item);
				} else if (item.placeholder?.parentElement) {
					item.spacer = createSpacer(item);
					item.placeholder.parentElement.replaceChild(item.spacer, item.placeholder);
					item.placeholder = null;
				}
			}
		}
	};

	const updateVisibility = throttle(100, () => processVisibility(true));
	const updateVisibilityImmediate = () => processVisibility(false);

	const registerItem = (element: HTMLElement) => {
		const id = element.dataset.noteId;
		if (!id || items.has(id)) return;

		items.set(id, {
			id,
			element,
			placeholder: null,
			spacer: null,
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
		const current = item.placeholder ?? item.spacer;
		current?.parentElement && current.replaceWith(item.element);
		items.delete(id);
	};

	let lastScrollTime = 0;
	let scrollVelocity = 0;
	let lastScrollY = window.scrollY;
	let scrollEndTimer: number | null = null;

	const handleScroll = () => {
		const now = Date.now();
		const currentScrollY = window.scrollY;
		const deltaY = Math.abs(currentScrollY - lastScrollY);
		const deltaTime = now - lastScrollTime;

		if (deltaTime > 0) scrollVelocity = deltaY / deltaTime;
		if (scrollVelocity > 1) updateVisibilityImmediate();
		else updateVisibility();

		lastScrollTime = now;
		lastScrollY = currentScrollY;

		if (scrollEndTimer !== null) {
			window.clearTimeout(scrollEndTimer);
		}

		scrollEndTimer = window.setTimeout(() => {
			updateVisibilityImmediate();
			scrollEndTimer = null;
		}, 150);
	};

	const init = () => {
		if (!enabled.value || !containerRef.value) return;

		injectStyles();

		resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const id = (entry.target as HTMLElement).dataset.noteId;
				if (id) {
					const item = items.get(id);
					if (item) item.height = entry.contentRect.height;
				}
			}
		});

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', updateVisibility, { passive: true });

		containerRef.value.querySelectorAll<HTMLElement>('[data-note-id]').forEach(registerItem);
		updateVisibility();
	};

	const cleanup = () => {
		if (scrollEndTimer !== null) {
			window.clearTimeout(scrollEndTimer);
			scrollEndTimer = null;
		}

		resizeObserver?.disconnect();
		window.removeEventListener('scroll', handleScroll);
		window.removeEventListener('resize', updateVisibility);

		items.forEach(item => {
			if (!item.isVisible && (item.placeholder || item.spacer)) {
				showItem(item, false);
			}
		});
		items.clear();

		styleElement?.remove();
		styleElement = null;
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
