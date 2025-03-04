<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="rootEl">
	<div ref="headerEl" :class="[$style.header, {[$style.reduceAnimation]: !defaultStore.state.animation, [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && isAllowHideHeader && (mainRouter.currentRoute.value.name !== 'index' || !isFriendly), [$style.showElTl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && isAllowHideHeader && mainRouter.currentRoute.value.name === 'index' && isFriendly }]">
		<slot name="header"></slot>
	</div>
	<div
		:class="$style.body"
		:data-sticky-container-header-height="headerHeight"
		:data-sticky-container-footer-height="footerHeight"
	>
		<slot></slot>
	</div>
	<div ref="footerEl" :class="$style.footer">
		<slot name="footer"></slot>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, provide, inject, ref, watch, useTemplateRef } from 'vue';
import { CURRENT_STICKY_BOTTOM, CURRENT_STICKY_TOP } from '@@/js/const.js';
import type { Ref } from 'vue';
import { deviceKind } from '@/scripts/device-kind.js';
import { mainRouter } from '@/router/main.js';
import { defaultStore } from '@/store.js';
import { globalEvents } from '@/events.js';
import { miLocalStorage } from '@/local-storage.js';

const isFriendly = ref(miLocalStorage.getItem('ui') === 'friendly');
const isAllowHideHeader = ref(['index', 'explore', 'my-notifications', 'my-favorites'].includes(<string>mainRouter.currentRoute.value.name));
const MOBILE_THRESHOLD = 500;

const isMobile = ref(['smartphone', 'tablet'].includes(<string>deviceKind) || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const showEl = ref(false);

const rootEl = useTemplateRef('rootEl');
const headerEl = useTemplateRef('headerEl');
const footerEl = useTemplateRef('footerEl');

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

	if (headerEl.value != null) {
		observer.observe(headerEl.value);
	}

	if (footerEl.value != null) {
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
	rootEl,
});
</script>

<style lang="scss" module>
.body {
	position: relative;
	z-index: 0;
	--MI-stickyTop: v-bind("childStickyTop + 'px'");
	--MI-stickyBottom: v-bind("childStickyBottom + 'px'");
}

.header {
	position: sticky;
	top: var(--MI-stickyTop, 0);
	z-index: 1;
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

.footer {
	position: sticky;
	bottom: var(--MI-stickyBottom, 0);
	z-index: 1;
}
</style>
