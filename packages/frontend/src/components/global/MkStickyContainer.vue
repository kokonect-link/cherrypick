<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="rootEl">
	<div ref="headerEl" :class="[$style.root, {[$style.reduceAnimation]: !defaultStore.state.animation, [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && isAllowHideHeader && (mainRouter.currentRoute.value.name !== 'index' || !isFriendly), [$style.showElTl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && isAllowHideHeader && mainRouter.currentRoute.value.name === 'index' && isFriendly }]">
		<slot name="header"></slot>
	</div>
	<div
		ref="bodyEl"
		:data-sticky-container-header-height="headerHeight"
		:data-sticky-container-footer-height="footerHeight"
	>
		<slot></slot>
	</div>
	<div ref="footerEl">
		<slot name="footer"></slot>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, provide, inject, Ref, ref, watch, shallowRef } from 'vue';

import { CURRENT_STICKY_BOTTOM, CURRENT_STICKY_TOP } from '@/const.js';
import { deviceKind } from '@/scripts/device-kind.js';
import { mainRouter } from '@/router/main.js';
import { defaultStore } from '@/store.js';
import { globalEvents } from '@/events.js';
import { miLocalStorage } from '@/local-storage.js';

const isFriendly = ref(miLocalStorage.getItem('ui') === 'friendly');
const isAllowHideHeader = ref(['index', 'explore', 'my-notifications', 'my-favorites'].includes(<string>mainRouter.currentRoute.value.name));
const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const showEl = ref(false);

const rootEl = shallowRef<HTMLElement>();
const headerEl = shallowRef<HTMLElement>();
const footerEl = shallowRef<HTMLElement>();
const bodyEl = shallowRef<HTMLElement>();

const headerHeight = ref<string | undefined>();
const childStickyTop = ref(0);
const parentStickyTop = inject<Ref<number>>(CURRENT_STICKY_TOP, ref(0));
provide(CURRENT_STICKY_TOP, childStickyTop);

const footerHeight = ref<string | undefined>();
const childStickyBottom = ref(0);
const parentStickyBottom = inject<Ref<number>>(CURRENT_STICKY_BOTTOM, ref(0));
provide(CURRENT_STICKY_BOTTOM, childStickyBottom);

const calc = () => {
	// コンポーネントが表示されてないけどKeepAliveで残ってる場合などは null になる
	if (headerEl.value != null) {
		childStickyTop.value = parentStickyTop.value + headerEl.value.offsetHeight;
		headerHeight.value = headerEl.value.offsetHeight.toString();
	}

	// コンポーネントが表示されてないけどKeepAliveで残ってる場合などは null になる
	if (footerEl.value != null) {
		childStickyBottom.value = parentStickyBottom.value + footerEl.value.offsetHeight;
		footerHeight.value = footerEl.value.offsetHeight.toString();
	}
};

const observer = new ResizeObserver(() => {
	window.setTimeout(() => {
		calc();
	}, 100);
});

onMounted(() => {
	calc();

	watch([parentStickyTop, parentStickyBottom], calc);

	watch(childStickyTop, () => {
		if (bodyEl.value == null) return;
		bodyEl.value.style.setProperty('--stickyTop', `${childStickyTop.value}px`);
	}, {
		immediate: true,
	});

	watch(childStickyBottom, () => {
		if (bodyEl.value == null) return;
		bodyEl.value.style.setProperty('--stickyBottom', `${childStickyBottom.value}px`);
	}, {
		immediate: true,
	});

	if (headerEl.value != null) {
		headerEl.value.style.position = 'sticky';
		headerEl.value.style.top = 'var(--stickyTop, 0)';
		headerEl.value.style.zIndex = '1000';
		observer.observe(headerEl.value);
	}

	if (footerEl.value != null) {
		footerEl.value.style.position = 'sticky';
		footerEl.value.style.bottom = 'var(--stickyBottom, 0)';
		footerEl.value.style.zIndex = '1000';
		observer.observe(footerEl.value);
	}

	globalEvents.on('showEl', (showEl_receive) => {
		showEl.value = showEl_receive;
	});
});

onUnmounted(() => {
	observer.disconnect();
});

defineExpose({
	rootEl: rootEl,
});
</script>

<style lang="scss" module>
.root {
	transition: opacity 0.5s, transform 0.5s;

	&.reduceAnimation {
		transition: opacity 0s, transform 0s;
	}

	&.showEl {
		transform: translateY(-50.55px);
	}

	&.showElTl {
		transform: translateY(-90.55px);
	}
}
</style>
