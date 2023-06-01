<template>
<div ref="rootEl">
	<div ref="headerEl" :class="[$style.root, {[$style.reduceAnimation]: !defaultStore.state.animation, [$style.showEl]: showEl && isMobile && isAllowHideHeader && mainRouter.currentRoute.value.name !== 'index', [$style.showElTl]: showEl && isMobile && isAllowHideHeader && mainRouter.currentRoute.value.name === 'index' }]">
		<slot name="header"></slot>
	</div>
	<div ref="bodyEl" :data-sticky-container-header-height="headerHeight">
		<slot></slot>
	</div>
	<div ref="footerEl">
		<slot name="footer"></slot>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, provide, inject, Ref, ref, watch } from 'vue';
import { $$ } from 'vue/macros';
import { CURRENT_STICKY_BOTTOM, CURRENT_STICKY_TOP } from '@/const';
import { deviceKind } from '@/scripts/device-kind';
import { mainRouter } from '@/router';
import { defaultStore } from '@/store';
import { eventBus } from '@/scripts/cherrypick/eventBus';

const isAllowHideHeader = ref(mainRouter.currentRoute.value.name === 'index' || mainRouter.currentRoute.value.name === 'explore' || mainRouter.currentRoute.value.name === 'my-notifications' || mainRouter.currentRoute.value.name === 'my-favorites');

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

let showEl = $ref(false);

const rootEl = $shallowRef<HTMLElement>();
const headerEl = $shallowRef<HTMLElement>();
const footerEl = $shallowRef<HTMLElement>();
const bodyEl = $shallowRef<HTMLElement>();

let headerHeight = $ref<string | undefined>();
let childStickyTop = $ref(0);
const parentStickyTop = inject<Ref<number>>(CURRENT_STICKY_TOP, ref(0));
provide(CURRENT_STICKY_TOP, $$(childStickyTop));

let footerHeight = $ref<string | undefined>();
let childStickyBottom = $ref(0);
const parentStickyBottom = inject<Ref<number>>(CURRENT_STICKY_BOTTOM, ref(0));
provide(CURRENT_STICKY_BOTTOM, $$(childStickyBottom));

const calc = () => {
	// コンポーネントが表示されてないけどKeepAliveで残ってる場合などは null になる
	if (headerEl != null) {
		childStickyTop = parentStickyTop.value + headerEl.offsetHeight;
		headerHeight = headerEl.offsetHeight.toString();
	}

	// コンポーネントが表示されてないけどKeepAliveで残ってる場合などは null になる
	if (footerEl != null) {
		childStickyBottom = parentStickyBottom.value + footerEl.offsetHeight;
		footerHeight = footerEl.offsetHeight.toString();
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

	watch($$(childStickyTop), () => {
		bodyEl.style.setProperty('--stickyTop', `${childStickyTop}px`);
	}, {
		immediate: true,
	});

	watch($$(childStickyBottom), () => {
		bodyEl.style.setProperty('--stickyBottom', `${childStickyBottom}px`);
	}, {
		immediate: true,
	});

	headerEl.style.position = 'sticky';
	headerEl.style.top = 'var(--stickyTop, 0)';
	headerEl.style.zIndex = '1000';

	footerEl.style.position = 'sticky';
	footerEl.style.bottom = 'var(--stickyBottom, 0)';
	footerEl.style.zIndex = '1000';

	observer.observe(headerEl);
	observer.observe(footerEl);

	eventBus.on('showEl', (showEl_receive) => {
		showEl = showEl_receive;
	});
});

onUnmounted(() => {
	observer.disconnect();
});

defineExpose({
	rootEl: $$(rootEl),
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
