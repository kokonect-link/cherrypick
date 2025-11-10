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
	isVisible: boolean;
	height: number;
}

export function useTimelineVirtualScroller(
	containerRef: Ref<HTMLElement | null>,
	options: VirtualScrollerOptions,
) {
	const { enabled, buffer = 1000, minItems = 100, maxPlaceholders = 20 } = options;
	const items = new Map<string, VirtualItem>();
	let observer: IntersectionObserver | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let styleElement: HTMLStyleElement | null = null;
	let topSpacerHeight = 0;
	let bottomSpacerHeight = 0;

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

		const removeAnimation = () => {
			item.element.classList.remove('timeline-item-fade-in');
		};

		const timeoutId = window.setTimeout(removeAnimation, 300);

		const handleFastScroll = () => {
			window.clearTimeout(timeoutId);
			removeAnimation();
			window.removeEventListener('wheel', handleFastScroll);
			window.removeEventListener('touchmove', handleFastScroll);
		};

		window.addEventListener('wheel', handleFastScroll, { once: true, passive: true });
		window.addEventListener('touchmove', handleFastScroll, { once: true, passive: true });
	};

	const updateSpacers = () => {
		if (!containerRef.value) return;

		containerRef.value.style.paddingTop = `${topSpacerHeight}px`;
		containerRef.value.style.paddingBottom = `${bottomSpacerHeight}px`;
	};

	const updateVisibility = throttle(100, () => {
		if (!enabled.value || items.size < minItems) return;
		const scrollTop = window.scrollY;
		const viewportHeight = window.innerHeight;
		const topThreshold = scrollTop - buffer;
		const bottomThreshold = scrollTop + viewportHeight + buffer;
		const placeholderBuffer = maxPlaceholders * 200; // 플레이스홀더 영역 (예상 높이)

		const itemsArray = Array.from(items.values()).sort((a, b) => {
			const aTop = (a.isVisible ? a.element : a.placeholder)?.getBoundingClientRect().top ?? 0;
			const bTop = (b.isVisible ? b.element : b.placeholder)?.getBoundingClientRect().top ?? 0;
			return aTop - bTop;
		});

		let accumulatedTopHeight = 0;
		let accumulatedBottomHeight = 0;
		let topPlaceholderCount = 0;
		let bottomPlaceholderCount = 0;

		for (const item of itemsArray) {
			const element = item.isVisible ? item.element : item.placeholder;
			if (!element || !element.parentElement) continue;

			const rect = element.getBoundingClientRect();
			const elementTop = rect.top + scrollTop;
			const elementBottom = elementTop + rect.height;

			const inViewport = elementBottom > topThreshold && elementTop < bottomThreshold;
			const inPlaceholderZone = elementBottom > (topThreshold - placeholderBuffer) &&
			                          elementTop < (bottomThreshold + placeholderBuffer);

			if (inViewport) {
				if (!item.isVisible) showItem(item);
			} else if (inPlaceholderZone && (topPlaceholderCount < maxPlaceholders || bottomPlaceholderCount < maxPlaceholders)) {
				if (item.isVisible) hideItem(item);

				if (elementTop < topThreshold) topPlaceholderCount++;
				else bottomPlaceholderCount++;
			} else {
				element.remove();

				if (elementTop < topThreshold) {
					accumulatedTopHeight += item.height || 150;
				} else {
					accumulatedBottomHeight += item.height || 150;
				}
			}
		}

		topSpacerHeight = accumulatedTopHeight;
		bottomSpacerHeight = accumulatedBottomHeight;
		updateSpacers();
	});

	const updateVisibilityImmediate = () => {
		if (!enabled.value || items.size < minItems) return;
		const scrollTop = window.scrollY;
		const viewportHeight = window.innerHeight;
		const topThreshold = scrollTop - buffer;
		const bottomThreshold = scrollTop + viewportHeight + buffer;
		const placeholderBuffer = maxPlaceholders * 200;

		const itemsArray = Array.from(items.values()).sort((a, b) => {
			const aTop = (a.isVisible ? a.element : a.placeholder)?.getBoundingClientRect().top ?? 0;
			const bTop = (b.isVisible ? b.element : b.placeholder)?.getBoundingClientRect().top ?? 0;
			return aTop - bTop;
		});

		let accumulatedTopHeight = 0;
		let accumulatedBottomHeight = 0;
		let topPlaceholderCount = 0;
		let bottomPlaceholderCount = 0;

		for (const item of itemsArray) {
			const element = item.isVisible ? item.element : item.placeholder;
			if (!element || !element.parentElement) continue;

			const rect = element.getBoundingClientRect();
			const elementTop = rect.top + scrollTop;
			const elementBottom = elementTop + rect.height;

			const inViewport = elementBottom > topThreshold && elementTop < bottomThreshold;
			const inPlaceholderZone = elementBottom > (topThreshold - placeholderBuffer) &&
			                          elementTop < (bottomThreshold + placeholderBuffer);

			if (inViewport) {
				if (!item.isVisible) {
					item.element.classList.remove('timeline-item-fade-in');
					if (item.placeholder?.parentElement) {
						item.placeholder.parentElement.replaceChild(item.element, item.placeholder);
					}
					item.placeholder = null;
					item.isVisible = true;
				}
			} else if (inPlaceholderZone && (topPlaceholderCount < maxPlaceholders || bottomPlaceholderCount < maxPlaceholders)) {
				if (item.isVisible) hideItem(item);

				if (elementTop < topThreshold) topPlaceholderCount++;
				else bottomPlaceholderCount++;
			} else {
				element.remove();

				if (elementTop < topThreshold) {
					accumulatedTopHeight += item.height || 150;
				} else {
					accumulatedBottomHeight += item.height || 150;
				}
			}
		}

		topSpacerHeight = accumulatedTopHeight;
		bottomSpacerHeight = accumulatedBottomHeight;
		updateSpacers();
	};

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

		observer?.disconnect();
		resizeObserver?.disconnect();
		window.removeEventListener('scroll', handleScroll);
		window.removeEventListener('resize', updateVisibility);

		for (const item of items.values()) {
			if (!item.isVisible && item.placeholder) showItem(item);
		}

		items.clear();

		// padding 리셋
		if (containerRef.value) {
			containerRef.value.style.paddingTop = '';
			containerRef.value.style.paddingBottom = '';
		}
		topSpacerHeight = 0;
		bottomSpacerHeight = 0;

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
