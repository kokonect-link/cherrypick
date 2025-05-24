<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="rootEl" :class="[$style.root, { [$style.reduceAnimation]: !prefer.s.animation, [$style.showEl]: (showEl && ['hideFloatBtnNavBar', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) }]">
	<button v-if="store.s.showMenuButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="drawerMenuShowing = true">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-menu-2"></i><span v-if="menuIndicated" :class="$style.itemIndicator" class="_blink"><i class="_indicatorCircle"></i></span>
		</div>
	</button>

	<button v-if="store.s.showHomeButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/')">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-home"></i>
		</div>
	</button>

	<button v-if="store.s.showExploreButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/explore')">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-hash"></i>
		</div>
	</button>

	<button v-if="store.s.showSearchButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/search')">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-search"></i>
		</div>
	</button>

	<button v-if="store.s.showNotificationButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/my/notifications')">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-bell"></i>
			<span v-if="$i?.hasUnreadNotification" :class="$style.itemIndicator" class="_blink">
				<span v-if="prefer.s.showUnreadNotificationsCount" class="_indicateCounter" :class="$style.itemIndicateValueIcon">{{ $i.unreadNotificationsCount > 99 ? '99+' : $i.unreadNotificationsCount }}</span>
				<i v-else class="_indicatorCircle"></i>
			</span>
		</div>
	</button>

	<button v-if="store.s.showChatButtonInNavbar && $i != null && $i.policies.chatAvailability !== 'unavailable'" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/chat')">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-messages"></i>
			<span v-if="$i?.hasUnreadChatMessages" :class="$style.itemIndicator" class="_blink">
				<i class="_indicatorCircle"></i>
			</span>
		</div>
	</button>

	<button v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="widgetsShowing = true">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-apps"></i>
		</div>
	</button>

	<button v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="[$style.item, $style.post]" class="_button" @click="os.post()">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-pencil"></i>
		</div>
	</button>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import { $i } from '@/i.js';
import * as os from '@/os.js';
import { mainRouter } from '@/router.js';
import { navbarItemDef } from '@/navbar.js';
import { prefer } from '@/preferences.js';
import { store } from '@/store.js';
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';

const { showEl } = scrollToVisibility();

const drawerMenuShowing = defineModel<boolean>('drawerMenuShowing');
const widgetsShowing = defineModel<boolean>('widgetsShowing');

const rootEl = useTemplateRef('rootEl');

const menuIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (def === 'notifications') continue; // 通知は下にボタンとして表示されてるから
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});

const rootElHeight = ref(0);

watch(rootEl, () => {
	if (rootEl.value) {
		rootElHeight.value = rootEl.value.offsetHeight;
		window.document.body.style.setProperty('--MI-minBottomSpacing', 'var(--MI-minBottomSpacingMobile)');
	} else {
		rootElHeight.value = 0;
		window.document.body.style.setProperty('--MI-minBottomSpacing', '0px');
	}
}, {
	immediate: true,
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	z-index: 1;
	padding-bottom: env(safe-area-inset-bottom, 0px);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
	width: 100%;
	box-sizing: border-box;
	background: var(--MI_THEME-navBg);
	color: var(--MI_THEME-navFg);
	box-shadow: 0px 0px 6px 6px #0000000f;
	transition: opacity 0.5s, transform 0.5s;

	&.reduceAnimation {
		transition: opacity 0s, transform 0s;
	}

	&.showEl {
		transform: translateY(84.55px);
	}
}

.item {
	padding: 12px 0;

	&:first-child {
		padding-left: 12px;
	}

	&:last-child {
		padding-right: 12px;
	}

	&.post {
		.itemInner {
			background: linear-gradient(90deg, var(--MI_THEME-buttonGradateA), var(--MI_THEME-buttonGradateB));
			color: var(--MI_THEME-fgOnAccent);

			&:hover {
				background: linear-gradient(90deg, hsl(from var(--MI_THEME-accent) h s calc(l + 5)), hsl(from var(--MI_THEME-accent) h s calc(l + 5)));
			}

			&:active {
				background: linear-gradient(90deg, hsl(from var(--MI_THEME-accent) h s calc(l + 5)), hsl(from var(--MI_THEME-accent) h s calc(l + 5)));
			}
		}
	}
}

.itemInner {
	position: relative;
	padding: 0;
	aspect-ratio: 1;
	width: 100%;
	max-width: 42px;
	margin: auto;
	align-content: center;
	border-radius: 100%;

	&:hover {
		background: var(--MI_THEME-panelHighlight);
	}

	&:active {
		background: var(--MI_THEME-panelHighlight);
	}
}

.itemIcon {
	font-size: 14px;
}

.itemIndicator {
	position: absolute;
	bottom: -4px;
	left: 0;
	right: 0;
	color: var(--MI_THEME-indicator);
	font-size: 10px;
	pointer-events: none;

	&:has(.itemIndicateValueIcon) {
		animation: none;
		font-size: 8px;
	}
}
</style>
