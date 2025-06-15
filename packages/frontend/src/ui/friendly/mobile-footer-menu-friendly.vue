<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="rootEl" :class="[$style.root, { [$style.reduceBlurEffect]: !prefer.s.useBlurEffect, [$style.reduceAnimation]: !prefer.s.animation, [$style.showEl]: (showEl && ['hideFloatBtnNavBar', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)), [$style.scrollToTransparent]: showEl }]">
	<button v-if="store.s.showHomeButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/')" @touchstart="openAccountMenu" @touchend="closeAccountMenu">
		<div :class="[$style.itemInner, { [$style.active]: mainRouter.currentRoute.value.name === 'index' }]">
			<i :class="$style.itemIcon" class="ti ti-home"></i>
			<span v-if="queue > 0" :class="$style.itemIndicatorHome">
				<i class="_indicatorCircle"></i>
			</span>
		</div>
	</button>

	<button v-if="store.s.showExploreButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/explore')">
		<div :class="[$style.itemInner, { [$style.active]: mainRouter.currentRoute.value.name === 'explore' }]">
			<i :class="$style.itemIcon" class="ti ti-hash"></i>
		</div>
	</button>

	<button v-if="store.s.showSearchButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/search')">
		<div :class="[$style.itemInner, { [$style.active]: mainRouter.currentRoute.value.name === 'search' }]">
			<i :class="$style.itemIcon" class="ti ti-search"></i>
		</div>
	</button>

	<button v-if="store.s.showNotificationButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/my/notifications')">
		<div :class="[$style.itemInner, { [$style.active]: mainRouter.currentRoute.value.name === 'my-notifications' }]">
			<i :class="$style.itemIcon" class="ti ti-bell"></i>
			<span v-if="$i?.hasUnreadNotification" :class="$style.itemIndicator" class="_blink">
				<span v-if="prefer.s.showUnreadNotificationsCount" class="_indicateCounter" :class="$style.itemIndicateValueIcon">{{ $i.unreadNotificationsCount > 99 ? '99+' : $i.unreadNotificationsCount }}</span>
				<i v-else class="_indicatorCircle"></i>
			</span>
		</div>
	</button>

	<button v-if="store.s.showChatButtonInNavbar && $i != null && $i.policies.chatAvailability !== 'unavailable'" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="mainRouter.push('/chat')">
		<div :class="[$style.itemInner, { [$style.active]: ['chat', 'chat-room'].includes(<string>mainRouter.currentRoute.value.name) }]">
			<i :class="$style.itemIcon" class="ti ti-messages"></i>
			<span v-if="$i?.hasUnreadChatMessages" :class="$style.itemIndicator" class="_blink">
				<i class="_indicatorCircle"></i>
			</span>
		</div>
	</button>

	<button v-if="store.s.showWidgetButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.item" class="_button" @click="widgetsShowing = true">
		<div :class="$style.itemInner">
			<i :class="$style.itemIcon" class="ti ti-apps"></i>
		</div>
	</button>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import { $i } from '@/i.js';
import { mainRouter } from '@/router.js';
import { prefer } from '@/preferences.js';
import { store } from '@/store.js';
import { globalEvents } from '@/events.js';
import { openAccountMenu as openAccountMenu_ } from '@/accounts.js';
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';

const { showEl } = scrollToVisibility();
const queue = ref(0);
const longTouchNavHome = ref(false);

const widgetsShowing = defineModel<boolean>('widgetsShowing');

const rootEl = useTemplateRef('rootEl');

const rootElHeight = ref(0);

function openAccountMenu(ev: TouchEvent) {
	if (prefer.s.enableLongPressOpenAccountMenu) {
		longTouchNavHome.value = true;
		window.setTimeout(() => {
			if (longTouchNavHome.value === true) {
				openAccountMenu_({
					withExtraOperationFriendly: true,
				}, ev);
			}
		}, 500);
	}
}

function closeAccountMenu() {
	longTouchNavHome.value = false;
}

function queueUpdated(q: number): void {
	queue.value = q;
}

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

onMounted(() => {
	globalEvents.on('queueUpdated', (q) => queueUpdated(q));
});

onUnmounted(() => {
	globalEvents.off('queueUpdated', (q) => queueUpdated(q));
});
</script>

<style lang="scss" module>
.root {
	position: fixed;
	z-index: 1;
	bottom: 0;
	padding: 0 10px env(safe-area-inset-bottom, 0px);
	display: flex;
	width: 100%;
	box-sizing: border-box;
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
	border-top: solid 0.5px var(--MI_THEME-divider);
	color: var(--MI_THEME-navFg);
	transition: opacity 0.5s, transform 0.5s, background-color 0.5s;

	&.reduceBlurEffect {
		background-color: color(from var(--MI_THEME-bg) srgb r g b / 1);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}

	&.reduceAnimation {
		transition: opacity 0s, transform 0s, background-color 0s;
	}

	&.showEl {
		transform: translateY(50.55px);
	}

	&.scrollToTransparent {
		background-color: transparent;
	}
}

.item {
	flex: 1;
	margin: auto;
	height: 50px;

	@media (max-width: 300px) {
		height: 60px;

		&:not(:last-child) {
			margin-right: 8px;
		}
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
	color: var(--MI_THEME-fg);
	padding: 15px 0;

	&:active {
		color: var(--MI_THEME-accent);
	}

	&.active {
		color: var(--MI_THEME-accent);
	}

	&:first-child {
		margin-left: 0;
	}

	&:last-child {
		margin-right: 0;
	}

	> * {
		font-size: 18px;
	}

	&:disabled {
		cursor: default;

		> * {
			opacity: 0.5;
		}
	}
}

.itemIcon {
	font-size: 18px;
	vertical-align: middle;
}

.itemIndicator {
	position: absolute;
	top: 7px;
	right: 20px;
	color: var(--MI_THEME-indicator);
	font-size: 8px;
	animation: global-blink 1s infinite;
	pointer-events: none;

	&:has(.itemIndicateValueIcon) {
		animation: none;
		font-size: 6px;
	}
}

.itemIndicatorHome {
	composes: itemIndicator;
	animation: none;
}
</style>
