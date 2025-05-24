<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="rootEl">
	<div ref="headerEl" :class="[$style.header, {[$style.reduceAnimation]: !prefer.s.animation, [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) && isMobile && isAllowHideHeader && (mainRouter.currentRoute.value.name !== 'index' || !isFriendly().value), [$style.showElTl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) && isMobile && isAllowHideHeader && mainRouter.currentRoute.value.name === 'index' && isFriendly().value }]">
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
import { DI } from '@/di.js';
import { deviceKind } from '@/utility/device-kind.js';
import { mainRouter } from '@/router.js';
import { prefer } from '@/preferences.js';
import { isFriendly } from '@/utility/is-friendly.js';
import { detectScrolling } from '@/utility/detect-scrolling.js';
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';

const isAllowHideHeader = ref(['index', 'explore', 'my-notifications', 'my-favorites'].includes(<string>mainRouter.currentRoute.value.name));
const MOBILE_THRESHOLD = 500;

const isMobile = ref(['smartphone', 'tablet'].includes(String(deviceKind)) || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const { showEl } = scrollToVisibility();

const rootEl = useTemplateRef('rootEl');
const headerEl = useTemplateRef('headerEl');
const footerEl = useTemplateRef('footerEl');

const headerHeight = ref<string | undefined>();
const childStickyTop = ref(0);
const parentStickyTop = inject(DI.currentStickyTop, ref(0));
provide(DI.currentStickyTop, childStickyTop);

const footerHeight = ref<string | undefined>();
const childStickyBottom = ref(0);
const parentStickyBottom = inject(DI.currentStickyBottom, ref(0));
provide(DI.currentStickyBottom, childStickyBottom);

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

detectScrolling(rootEl);

onMounted(() => {
	calc();

	watch([parentStickyTop, parentStickyBottom], calc);

	if (headerEl.value != null) {
		observer.observe(headerEl.value);
	}

	if (footerEl.value != null) {
		observer.observe(footerEl.value);
	}
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
