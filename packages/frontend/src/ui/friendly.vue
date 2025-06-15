<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { '_forceShrinkSpacer': deviceKind === 'smartphone' }]">
	<XTitlebar v-if="prefer.r.showTitlebar.value" style="flex-shrink: 0;"/>

	<div :class="$style.nonTitlebarArea">
		<XSidebar v-if="!isMobile" :class="$style.sidebar" :showWidgetButton="!isDesktop" @widgetButtonClick="widgetsShowing = true"/>

		<div :class="[$style.contents, !isMobile && prefer.r.showTitlebar.value ? $style.withSidebarAndTitlebar : null]" @contextmenu.stop="onContextmenu">
			<XPreferenceRestore v-if="shouldSuggestRestoreBackup"/>
			<XAnnouncements v-if="$i"/>
			<XStatusBars :class="$style.statusbars"/>
			<StackingRouterView v-if="prefer.s['experimental.stackingRouterView']" :class="$style.content"/>
			<RouterView v-else :class="$style.content"/>
			<XMobileFooterMenu v-if="isMobile" ref="navFooter" v-model:drawerMenuShowing="drawerMenuShowing" v-model:widgetsShowing="widgetsShowing"/>
		</div>

		<div v-if="isDesktop && prefer.s.friendlyUiEnableNotificationsArea && mainRouter.currentRoute.value.name !== 'my-notifications'" :class="$style.notificationWidgets">
			<XNotifications disableRefreshButton notification/>
		</div>

		<div v-if="isDesktop && !pageMetadata?.needWideArea && prefer.s.enableWidgetsArea" :class="$style.widgets">
			<XWidgets/>
		</div>

		<XCommon v-model:drawerMenuShowing="drawerMenuShowing" v-model:widgetsShowing="widgetsShowing"/>

		<button
			v-if="isMobile && enableNavButton.includes(<string>mainRouter.currentRoute.value.name)"
			v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []"
			:class="[$style.floatNavButton, { [$style.reduceBlurEffect]: !prefer.s.useBlurEffect, [$style.reduceAnimation]: !prefer.s.animation, [$style.showEl]: (showEl && ['hideHeaderFloatBtn', 'hideFloatBtnOnly', 'hideFloatBtnNavBar', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) }]"
			class="_button"
			@click="drawerMenuShowing = true"
		>
			<CPAvatar :class="$style.floatNavButtonAvatar" :user="$i"/>
		</button>

		<button
			v-if="isMobile && enablePostButton.includes(<string>mainRouter.currentRoute.value.name)"
			v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []"
			:class="[$style.floatPostButton, { [$style.reduceBlurEffect]: !prefer.s.useBlurEffect, [$style.reduceAnimation]: !prefer.s.animation, [$style.showEl]: (showEl && ['hideHeaderFloatBtn', 'hideFloatBtnOnly', 'hideFloatBtnNavBar', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) }]"
			:style="{ background: PostBg }"
			class="_button"
			@click="createChat"
		>
			<span :class="[$style.floatPostButtonBg, { [$style.reduceBlurEffect]: !prefer.s.useBlurEffect }]"></span>
			<i v-if="mainRouter.currentRoute.value.name === 'chat' && !(['chat-room'].includes(<string>mainRouter.currentRoute.value.name))" class="ti ti-plus"></i>
			<i v-else-if="enablePostButton.includes(<string>mainRouter.currentRoute.value.name)" class="ti ti-pencil"></i>
		</button>
	</div>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, provide, onMounted, computed, ref, onUnmounted, watch } from 'vue';
import tinycolor from 'tinycolor2';
import { instanceName } from '@@/js/config.js';
import { isLink } from '@@/js/is-link.js';
import XCommon from './_common_/common.vue';
import type { PageMetadata } from '@/page.js';
import XMobileFooterMenu from '@/ui/friendly/mobile-footer-menu-friendly.vue';
import XPreferenceRestore from '@/ui/_common_/PreferenceRestore.vue';
import XTitlebar from '@/ui/_common_/titlebar.vue';
import XSidebar from '@/ui/friendly/navbar.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import { provideMetadataReceiver, provideReactiveMetadata } from '@/page.js';
import { deviceKind } from '@/utility/device-kind.js';
import { miLocalStorage } from '@/local-storage.js';
import { mainRouter } from '@/router.js';
import { prefer } from '@/preferences.js';
import { shouldSuggestRestoreBackup } from '@/preferences/utility.js';
import { DI } from '@/di.js';
import { globalEvents } from '@/events.js';
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';
import CPAvatar from '@/components/global/CPAvatar-Friendly.vue';

const XWidgets = defineAsyncComponent(() => import('./_common_/widgets.vue'));
const XNotifications = defineAsyncComponent(() => import('@/pages/notifications.vue'));
const XStatusBars = defineAsyncComponent(() => import('@/ui/_common_/statusbars.vue'));
const XAnnouncements = defineAsyncComponent(() => import('@/ui/_common_/announcements.vue'));

miLocalStorage.setItem('ui', 'friendly');

const isRoot = computed(() => mainRouter.currentRoute.value.name === 'index');

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isDesktop = ref(window.innerWidth >= DESKTOP_THRESHOLD);
const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const enableNavButton = [
	'index',
	'explore',
	'my-notifications',
	'chat',
];

const enablePostButton = [
	'index',
	'explore',
	'my-notifications',
	'chat',
	'user',
];

const { showEl } = scrollToVisibility();
const queue = ref(0);
const bg = ref<string | undefined>(undefined);
const PostBg = ref<string | undefined>(undefined);

const pageMetadata = ref<null | PageMetadata>(null);
const widgetsShowing = ref(false);

provide(DI.router, mainRouter);
provideMetadataReceiver((metadataGetter) => {
	const info = metadataGetter();
	pageMetadata.value = info;
	if (pageMetadata.value) {
		if (isRoot.value && pageMetadata.value.title === instanceName) {
			window.document.title = pageMetadata.value.title;
		} else {
			window.document.title = `${pageMetadata.value.title} | ${instanceName}`;
		}
	}
});
provideReactiveMetadata(pageMetadata);

const drawerMenuShowing = ref(false);

mainRouter.on('change', () => {
	drawerMenuShowing.value = false;
});

if (window.innerWidth > 1024) {
	const tempUI = miLocalStorage.getItem('ui_temp');
	if (tempUI) {
		miLocalStorage.setItem('ui', tempUI);
		miLocalStorage.removeItem('ui_temp');
		window.location.reload();
	}
}

const calcBg = () => {
	const rawBg = 'var(--MI_THEME-panel)';
	const rawPostBg = 'var(--MI_THEME-accent)';
	const tinyBg = tinycolor(rawBg.startsWith('var(') ? getComputedStyle(window.document.documentElement).getPropertyValue(rawBg.slice(4, -1)) : rawBg);
	const tinyPostBg = tinycolor(rawPostBg.startsWith('var(') ? getComputedStyle(window.document.documentElement).getPropertyValue(rawPostBg.slice(4, -1)) : rawPostBg);
	if (prefer.s.useBlurEffect || showEl.value) {
		tinyBg.setAlpha(0.7);
		tinyPostBg.setAlpha(0.7);
	} else {
		tinyBg.setAlpha(1);
		tinyPostBg.setAlpha(1);
	}
	bg.value = tinyBg.toRgbString();
	PostBg.value = tinyPostBg.toRgbString();
};

watch(showEl, () => {
	calcBg();
});

onMounted(() => {
	if (!isDesktop.value) {
		window.addEventListener('resize', () => {
			if (window.innerWidth >= DESKTOP_THRESHOLD) isDesktop.value = true;
		}, { passive: true });
	}

	globalEvents.on('queueUpdated', (q) => queueUpdated(q));

	calcBg();
	globalEvents.on('themeChanging', calcBg);
});

onUnmounted(() => {
	globalEvents.off('queueUpdated', (q) => queueUpdated(q));
	globalEvents.off('themeChanging', calcBg);
});

const onContextmenu = (ev) => {
	if (isLink(ev.target)) return;
	if (['INPUT', 'TEXTAREA', 'IMG', 'VIDEO', 'CANVAS'].includes(ev.target.tagName) || ev.target.attributes['contenteditable']) return;
	if (window.getSelection()?.toString() !== '') return;
	const path = mainRouter.getCurrentFullPath();
	os.contextMenu([{
		type: 'label',
		text: path,
	}, {
		icon: 'ti ti-window-maximize',
		text: i18n.ts.openInWindow,
		action: () => {
			os.pageWindow(path);
		},
	}], ev);
};

function queueUpdated(q: number): void {
	queue.value = q;
}

function createChat(ev: MouseEvent) {
	if (mainRouter.currentRoute.value.name === 'chat' && !(['chat-room'].includes(<string>mainRouter.currentRoute.value.name))) globalEvents.emit('createChat', ev);
	else if (enablePostButton.includes(<string>mainRouter.currentRoute.value.name)) os.post();
}
</script>

<style lang="scss" module>
$ui-font-size: 1em; // TODO: どこかに集約したい
$widgets-hide-threshold: 1090px;
$float-button-size: 65px;

.root {
	height: 100dvh;
	overflow: clip;
	contain: strict;
	display: flex;
	flex-direction: column;
	background: var(--MI_THEME-navBg);
}

.nonTitlebarArea {
	display: flex;
	flex: 1;
	min-height: 0;
}

.sidebar {
	border-right: solid 0.5px var(--MI_THEME-divider);
}

.contents {
	display: flex;
	flex-direction: column;
	flex: 1;
	height: 100%;
	min-width: 0;

	&.withSidebarAndTitlebar {
		background: var(--MI_THEME-navBg);
		border-radius: 12px 0 0 0;
		overflow: clip;
	}
}

.content {
	flex: 1;
	min-height: 0;
}

.statusbars {
	position: sticky;
	top: 0;
	left: 0;
}

.floatButton {
	display: block;
	position: fixed;
	z-index: 1000;
	bottom: calc(65px + env(safe-area-inset-bottom));
	width: $float-button-size;
	height: $float-button-size;
	box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
	border-radius: 28px;
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
	transition: opacity 0.5s, transform 0.5s, background-color 0.5s;

	&.reduceBlurEffect {
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}

	&.reduceAnimation {
		transition: opacity 0s, transform 0s, background-color 0s;
	}
}

.floatNavButton {
	composes: floatButton;
	left: 15px;

	&.showEl {
		transform: translateX(-250px);
	}
}

.floatNavButtonAvatar {
	width: 100%;
	height: 100%;
	vertical-align: middle;
}

.floatPostButton {
	composes: floatButton;
	right: 15px;
	font-size: 18px;

	&.showEl {
		transform: translateX(250px);
	}

	i {
		position: relative;
		color: white;
	}
}

.floatPostButtonBg {
	position: absolute;
	width: 100%;
	height: 100%;
	right: 0;
	bottom: 0;
	border-radius: 28px;
}

.widgets {
	width: 350px;
	height: 100%;
	box-sizing: border-box;
	overflow: auto;
	padding: var(--MI-margin) var(--MI-margin) calc(var(--MI-margin) + env(safe-area-inset-bottom, 0px));
	border-left: solid 0.5px var(--MI_THEME-divider);
	background: var(--MI_THEME-bg);

	@media (max-width: $widgets-hide-threshold) {
		display: none;
	}
}

.notificationWidgets {
	composes: widgets;
	padding: initial;
}
</style>
