<template>
<div :class="[$style.root, { [$style.narrow]: isMobile }]">
	<XSidebar v-if="!isMobile" :class="$style.sidebar"/>

	<MkStickyContainer :class="[$style.contents, { [$style.narrow]: isMobile }]">
		<template #header><XStatusBars :class="$style.statusbars"/></template>
		<main style="min-width: 0;" @contextmenu.stop="onContextmenu">
			<div :class="$style.content" style="container-type: inline-size;">
				<RouterView/>
			</div>
			<div v-if="!(mainRouter.currentRoute.value.name === 'messaging-room' || mainRouter.currentRoute.value.name === 'messaging-room-group')" :class="$style.spacer"></div>
		</main>
	</MkStickyContainer>

	<div v-if="isDesktop && mainRouter.currentRoute.value.name !== 'my-notifications'" :class="$style.notificationWidgets">
		<XNotifications/>
	</div>

	<div v-if="isDesktop" :class="$style.widgets">
		<XWidgets/>
	</div>

	<button v-if="isMobile && !(mainRouter.currentRoute.value.name === 'messaging-room' || mainRouter.currentRoute.value.name === 'messaging-room-group')" :class="[$style.floatNavButton, {[$style.reduceAnimation]: !defaultStore.state.animation, [$style.showEl]: showEl }]" class="nav _button" @click="drawerMenuShowing = true" @touchstart="longTouchfloatNavStart" @touchend="longTouchfloatNavEnd"><CPAvatar :class="$style.floatNavButtonAvatar" :user="$i"/></button>

	<button v-if="isMobile && !(mainRouter.currentRoute.value.name === 'messaging-room' || mainRouter.currentRoute.value.name === 'messaging-room-group')" :class="[$style.floatPostButton, {[$style.reduceAnimation]: !defaultStore.state.animation, [$style.showEl]: showEl }]" class="post _button" @click="os.post()"><span :class="[$style.floatPostButtonBg, {[$style.reduceBlurEffect]: !defaultStore.state.useBlurEffect}]"></span><i class="ti ti-pencil"></i></button>

	<button v-if="!isDesktop && !isMobile" :class="[$style.widgetButton, {[$style.showEl]: showEl }]" class="_button" @click="widgetsShowing = true"><i class="ti ti-apps"></i></button>

	<div v-if="isMobile" :class="$style.nav">
		<!-- <button :class="$style.navButton" class="_button" @click="drawerMenuShowing = true"><i :class="$style.navButtonIcon" class="ti ti-menu-2"></i><span v-if="menuIndicated" :class="$style.navButtonIndicator"><i class="_indicatorCircle"></i></span></button> -->
		<button :class="[$style.navButton, { [$style.active]: mainRouter.currentRoute.value.name === 'index' }]" class="_button" @click="mainRouter.currentRoute.value.name === 'index' ? top() : mainRouter.replace('/')" @touchstart="openAccountMenu" @touchend="closeAccountMenu"><i :class="$style.navButtonIcon" class="ti ti-home"></i><span v-if="queue > 0" :class="$style.navButtonIndicatorHome"><i class="_indicatorCircle"></i></span></button>
		<button :class="[$style.navButton, { [$style.active]: mainRouter.currentRoute.value.name === 'explore' }]" class="_button" @click="mainRouter.currentRoute.value.name === 'explore' ? top() : mainRouter.replace('/explore')"><i :class="$style.navButtonIcon" class="ti ti-hash"></i></button>
		<button :class="[$style.navButton, { [$style.active]: mainRouter.currentRoute.value.name === 'my-notifications' }]" class="_button" @click="mainRouter.currentRoute.value.name === 'my-notifications' ? top() : mainRouter.replace('/my/notifications')"><i :class="$style.navButtonIcon" class="ti ti-bell"></i><span v-if="$i?.hasUnreadNotification" :class="$style.navButtonIndicator"><i class="_indicatorCircle"></i></span></button>
		<button :class="[$style.navButton, { [$style.active]: mainRouter.currentRoute.value.name === 'messaging' || mainRouter.currentRoute.value.name === 'messaging-room' || mainRouter.currentRoute.value.name === 'messaging-room-group' }]" class="_button" @click="mainRouter.currentRoute.value.name === 'messaging' ? top() : mainRouter.replace('/my/messaging')"><i :class="$style.navButtonIcon" class="ti ti-messages"></i><span v-if="$i?.hasUnreadMessagingMessage" :class="$style.navButtonIndicator"><i class="_indicatorCircle"></i></span></button>
		<button :class="$style.navButton" class="_button" @click="widgetsShowing = true"><i :class="$style.navButtonIcon" class="ti ti-apps"></i></button>
		<!-- <button :class="$style.postButton" class="_button" @click="os.post()"><i :class="$style.navButtonIcon" class="ti ti-pencil"></i></button> -->
	</div>

	<Transition
		:enterActiveClass="defaultStore.state.animation ? $style.transition_menuDrawerBg_enterActive : ''"
		:leaveActiveClass="defaultStore.state.animation ? $style.transition_menuDrawerBg_leaveActive : ''"
		:enterFromClass="defaultStore.state.animation ? $style.transition_menuDrawerBg_enterFrom : ''"
		:leaveToClass="defaultStore.state.animation ? $style.transition_menuDrawerBg_leaveTo : ''"
	>
		<div
			v-if="drawerMenuShowing"
			:class="$style.menuDrawerBg"
			class="_modalBg"
			@click="drawerMenuShowing = false"
			@touchstart.passive="drawerMenuShowing = false"
		></div>
	</Transition>

	<Transition
		:enterActiveClass="defaultStore.state.animation ? $style.transition_menuDrawer_enterActive : ''"
		:leaveActiveClass="defaultStore.state.animation ? $style.transition_menuDrawer_leaveActive : ''"
		:enterFromClass="defaultStore.state.animation ? $style.transition_menuDrawer_enterFrom : ''"
		:leaveToClass="defaultStore.state.animation ? $style.transition_menuDrawer_leaveTo : ''"
	>
		<div v-if="drawerMenuShowing" :class="$style.menuDrawer">
			<XDrawerMenu/>
		</div>
	</Transition>

	<Transition
		:enterActiveClass="defaultStore.state.animation ? $style.transition_widgetsDrawerBg_enterActive : ''"
		:leaveActiveClass="defaultStore.state.animation ? $style.transition_widgetsDrawerBg_leaveActive : ''"
		:enterFromClass="defaultStore.state.animation ? $style.transition_widgetsDrawerBg_enterFrom : ''"
		:leaveToClass="defaultStore.state.animation ? $style.transition_widgetsDrawerBg_leaveTo : ''"
	>
		<div
			v-if="widgetsShowing"
			:class="$style.widgetsDrawerBg"
			class="_modalBg"
			@click="widgetsShowing = false"
			@touchstart.passive="widgetsShowing = false"
		></div>
	</Transition>

	<Transition
		:enterActiveClass="defaultStore.state.animation ? $style.transition_widgetsDrawer_enterActive : ''"
		:leaveActiveClass="defaultStore.state.animation ? $style.transition_widgetsDrawer_leaveActive : ''"
		:enterFromClass="defaultStore.state.animation ? $style.transition_widgetsDrawer_enterFrom : ''"
		:leaveToClass="defaultStore.state.animation ? $style.transition_widgetsDrawer_leaveTo : ''"
	>
		<div v-if="widgetsShowing" :class="$style.widgetsDrawer">
			<button class="_button" :class="$style.widgetsCloseButton" @click="widgetsShowing = false"><i class="ti ti-x"></i></button>
			<XWidgets/>
		</div>
	</Transition>

	<XCommon/>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, provide, onMounted, onBeforeUnmount, computed, ref, watch, ComputedRef, inject, Ref } from 'vue';
import XCommon from './_common_/common.vue';
import { instanceName } from '@/config';
import XDrawerMenu from '@/ui/friendly/navbar-for-mobile.vue';
import * as os from '@/os';
import { defaultStore } from '@/store';
// import { navbarItemDef } from '@/navbar';
import { i18n } from '@/i18n';
import { $i, openAccountMenu as openAccountMenu_ } from '@/account';
import { mainRouter } from '@/router';
import { PageMetadata, provideMetadataReceiver } from '@/scripts/page-metadata';
import { deviceKind } from '@/scripts/device-kind';
import { miLocalStorage } from '@/local-storage';
import { eventBus } from '@/scripts/cherrypick/eventBus';
import { CURRENT_STICKY_BOTTOM } from '@/const';
import CPAvatar from '@/components/global/CPAvatar-Friendly.vue';
const XWidgets = defineAsyncComponent(() => import('./universal.widgets.vue'));
const XNotifications = defineAsyncComponent(() => import('@/pages/notifications.vue'));
const XSidebar = defineAsyncComponent(() => import('@/ui/friendly/navbar.vue'));
const XStatusBars = defineAsyncComponent(() => import('@/ui/_common_/statusbars.vue'));

miLocalStorage.setItem('ui', 'friendly');

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isDesktop = ref(window.innerWidth >= DESKTOP_THRESHOLD);
const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

let showEl = $ref(false);
let lastScrollPosition = $ref(0);

let queue = $ref(0);

let longTouchNavHome = $ref(false);
let longTouchfloatNav = $ref(false);

let pageMetadata = $ref<null | ComputedRef<PageMetadata>>();
const widgetsShowing = $ref(false);
const navFooter = $shallowRef<HTMLElement>();

provide('router', mainRouter);
provideMetadataReceiver((info) => {
	pageMetadata = info;
	if (pageMetadata.value) {
		document.title = `${pageMetadata.value.title} | ${instanceName}`;
	}
});

/*
const menuIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (def === 'notifications') continue; // 通知は下にボタンとして表示されてるから
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});
 */

const drawerMenuShowing = ref(false);

mainRouter.on('change', () => {
	drawerMenuShowing.value = false;
});

if (window.innerWidth > 1024) {
	const tempUI = miLocalStorage.getItem('ui_temp');
	if (tempUI) {
		miLocalStorage.setItem('ui', tempUI);
		miLocalStorage.removeItem('ui_temp');
		location.reload();
	}
}

defaultStore.loaded.then(() => {
	if (defaultStore.state.widgets.length === 0) {
		defaultStore.set('widgets', [{
			name: 'calendar',
			id: 'a', place: 'right', data: {},
		}, {
			name: 'trends',
			id: 'c', place: 'right', data: {},
		}]);
	}
});

onMounted(() => {
	if (!isDesktop.value) {
		window.addEventListener('resize', () => {
			if (window.innerWidth >= DESKTOP_THRESHOLD) isDesktop.value = true;
		}, { passive: true });
	}

	window.addEventListener('scroll', onScroll);

	eventBus.on('queueUpdated', (q) => queueUpdated(q));
});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', onScroll);
});

function onScroll() {
	const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
	if (currentScrollPosition < 0) {
		return;
	}
	// Stop executing this function if the difference between
	// current scroll position and last scroll position is less than some offset
	if (Math.abs(currentScrollPosition - lastScrollPosition) < 60) {
		return;
	}
	showEl = currentScrollPosition < lastScrollPosition;
	lastScrollPosition = currentScrollPosition;
	showEl = !showEl;
	eventBus.emit('showEl', showEl);
}

const onContextmenu = (ev) => {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === 'A') return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (['INPUT', 'TEXTAREA', 'IMG', 'VIDEO', 'CANVAS'].includes(ev.target.tagName) || ev.target.attributes['contenteditable']) return;
	if (window.getSelection()?.toString() !== '') return;
	const path = mainRouter.getCurrentPath();
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

function top() {
	// TODO
}

function queueUpdated(q: number): void {
	queue = q;
}

function openAccountMenu(ev: MouseEvent) {
	longTouchNavHome = true;
	setTimeout(() => {
		if (longTouchNavHome === true) {
			openAccountMenu_({
				withExtraOperationFriendly: true,
			}, ev);
		}
	}, 500);
}

function closeAccountMenu() {
	longTouchNavHome = false;
}

function longTouchfloatNavStart() {
	longTouchfloatNav = true;
	setTimeout(() => {
		if (longTouchfloatNav === true) {
			location.reload();
		}
	}, 1000);
}

function longTouchfloatNavEnd() {
	longTouchfloatNav = false;
}

let navFooterHeight = $ref(0);
provide<Ref<number>>(CURRENT_STICKY_BOTTOM, $$(navFooterHeight));

watch($$(navFooter), () => {
	if (navFooter) {
		navFooterHeight = navFooter.offsetHeight;
		document.body.style.setProperty('--stickyBottom', `${navFooterHeight}px`);
	} else {
		navFooterHeight = 0;
		document.body.style.setProperty('--stickyBottom', '0px');
	}
}, {
	immediate: true,
});
</script>

<style lang="scss" module>
$ui-font-size: 1em; // TODO: どこかに集約したい
$widgets-hide-threshold: 1090px;
$float-button-size: 65px;

.transition_menuDrawerBg_enterActive,
.transition_menuDrawerBg_leaveActive {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_menuDrawerBg_enterFrom,
.transition_menuDrawerBg_leaveTo {
	opacity: 0;
}

.transition_menuDrawer_enterActive,
.transition_menuDrawer_leaveActive {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_menuDrawer_enterFrom,
.transition_menuDrawer_leaveTo {
	opacity: 0;
	transform: translateX(-240px);
}

.transition_widgetsDrawerBg_enterActive,
.transition_widgetsDrawerBg_leaveActive {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_widgetsDrawerBg_enterFrom,
.transition_widgetsDrawerBg_leaveTo {
	opacity: 0;
}

.transition_widgetsDrawer_enterActive,
.transition_widgetsDrawer_leaveActive {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_widgetsDrawer_enterFrom,
.transition_widgetsDrawer_leaveTo {
	opacity: 0;
	transform: translateX(240px);
}

.root {
	height: 100dvh;
	overflow: clip;
	box-sizing: border-box;
	display: flex;

	&.narrow {
		overflow: initial;
	}
}

.sidebar {
	border-right: solid 0.5px var(--divider);
}

.contents {
	flex: 1;
	height: 100%;
	min-width: 0;
	overflow: auto;
	overflow-y: scroll;
	background: var(--bg);

	&.narrow {
		overflow: initial;
	}
}

.widgets {
	width: 350px;
	height: 100%;
	box-sizing: border-box;
	overflow: auto;
	padding: var(--margin) var(--margin) calc(var(--margin) + env(safe-area-inset-bottom, 0px));
	border-left: solid 0.5px var(--divider);
	background: var(--bg);

	@media (max-width: $widgets-hide-threshold) {
		display: none;
	}
}

.notificationWidgets {
	composes: widgets;
	padding: initial;
}

.floatNavButton {
	display: block;
	position: fixed;
	z-index: 1000;
	bottom: calc(65px + env(safe-area-inset-bottom));
	left: 15px;
	width: $float-button-size;
	height: $float-button-size;
	box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
	// background: var(--panel);
	// opacity: 0.7;
	border-radius: 28px;
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	transition: opacity 0.5s, transform 0.5s;

	&.reduceAnimation {
		transition: opacity 0s, transform 0s;
	}

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
	display: block;
	position: fixed;
	z-index: 1000;
	bottom: calc(65px + env(safe-area-inset-bottom));
	right: 15px;
	width: $float-button-size;
	height: $float-button-size;
	box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
	font-size: 18px;
	// background: var(--accent);
	// opacity: 0.7;
	border-radius: 28px;
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	transition: opacity 0.5s, transform 0.5s;

	&.reduceAnimation {
		transition: opacity 0s, transform 0s;
	}

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
	background: var(--accent);
	opacity: .7;
	border-radius: 28px;

	&.reduceBlurEffect {
		opacity: 1;
	}
}

.widgetButton {
	display: block;
	position: fixed;
	z-index: 1000;
	bottom: 32px;
	right: 32px;
	width: 64px;
	height: 64px;
	border-radius: 100%;
	box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
	font-size: 22px;
	background: var(--panel);
}

.widgetsDrawerBg {
	z-index: 1001;
}

.widgetsDrawer {
	position: fixed;
	top: 0;
	right: 0;
	z-index: 1001;
	height: 100dvh;
	padding: var(--margin) var(--margin) calc(var(--margin) + env(safe-area-inset-bottom, 0px)) !important;
	box-sizing: border-box;
	overflow: auto;
	overscroll-behavior: contain;
	background: var(--bg);
}

.widgetsCloseButton {
	padding: 8px;
	display: block;
	margin: 0 auto;
}

@media (min-width: 370px) {
	.widgetsCloseButton {
		display: none;
	}
}

.nav {
	position: fixed;
	z-index: 1000;
	bottom: 0;
	// left: 0;
	// padding: 16px 16px calc(env(safe-area-inset-bottom, 0px) + 16px) 16px;
	display: flex;
	width: 100%;
	box-sizing: border-box;
	-webkit-backdrop-filter: var(--blur, blur(32px));
	backdrop-filter: var(--blur, blur(32px));
	background-color: var(--panel);
	border-top: solid 0.5px var(--divider);
	padding: 0 10px;
}

.navButton {
	position: relative;
	flex: 1;
	// padding: 0;
	margin: auto;
	height: 50px;
	// border-radius: 8px;
	background: var(--panel);
	color: var(--fg);
	padding: 15px 0 calc(env(safe-area-inset-bottom) + 30px);

	&:not(:last-child) {
		// margin-right: 12px;
	}

	@media (max-width: 300px) {
		height: 60px;

		&:not(:last-child) {
			margin-right: 8px;
		}
	}

	&:hover {
		// background: var(--X2);
	}

	&:active {
		color: var(--accent);
	}

	&.active {
		color: var(--accent);
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

.navButtonIcon {
	font-size: 18px;
	vertical-align: middle;
}

.navButtonIndicator {
	position: absolute;
	top: 7px;
	right: 20px;
	color: var(--indicator);
	font-size: 8px;
	animation: blink 1s infinite;
}

.navButtonIndicatorHome {
	composes: navButtonIndicator;
	animation: none;
}

.menuDrawerBg {
	z-index: 1001;
}

.menuDrawer {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1001;
	height: 100dvh;
	width: 240px;
	box-sizing: border-box;
	contain: strict;
	overflow: auto;
	overscroll-behavior: contain;
	background: var(--navBg);
}

.statusbars {
	position: sticky;
	top: 0;
	left: 0;
}

.spacer {
	height: calc(var(--minBottomSpacing));
}
</style>
