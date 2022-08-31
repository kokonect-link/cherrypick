<template>
<div class="mk-app" :class="{ wallpaper }">
	<XSidebar v-if="!isMobile" ref="nav" class="sidebar"/>
	<XSidebarMobile v-if="isMobile" ref="nav" class="sidebar"/>

	<div class="contents" ref="contents" @contextmenu.stop="onContextmenu" :style="{ background: pageInfo?.bg }">
		<main ref="main">
			<div class="content">
				<MkStickyContainer>
					<template #header><MkHeaderCP v-if="pageInfo && !pageInfo.hideHeader" :info="pageInfo" @back="back()"/></template>
					<router-view v-slot="{ Component }">
						<transition :name="$store.state.animation ? 'page' : ''" mode="out-in" @enter="onTransition">
							<keep-alive :include="['timeline']">
								<component :is="Component" :ref="changePage"/>
							</keep-alive>
						</transition>
					</router-view>
				</MkStickyContainer>
			</div>
			<div class="spacer"></div>
		</main>
	</div>

	<XSide v-if="isDesktop" class="side" ref="side"/>

	<div v-if="isDesktop" class="widgets" ref="widgets">
		<XWidgets @mounted="attachSticky"/>
	</div>

	<div class="buttons" :class="{ navHidden }">
		<!-- <button class="button nav _button" @click="showNav" ref="navButton"><i class="fas fa-bars"></i><span v-if="navIndicated" class="indicator"><i class="fas fa-circle"></i></span></button> -->
		<button class="button home _button" @click="$route.name === 'index' ? top() : $router.replace('/')" :class="{ active: $route.name === 'index' }"><i class="fas fa-home"></i><span v-if="queue > 0" class="indicator-home"><i class="fas fa-circle"></i></span></button>
		<button class="button explore _button" @click="$route.name === 'explore' ? top() : $router.replace('/explore')" :class="{ active: $route.name === 'explore' }"><i class="fas fa-hashtag"/></button>
		<button class="button notifications _button" @click="$route.name === 'notifications' ? top() : $router.replace('/my/notifications')" :class="{ active: $route.name === 'notifications' }"><i class="fas fa-bell"></i><span v-if="$i.hasUnreadNotification" class="indicator"><i class="fas fa-circle"></i></span></button>
		<button class="button tab _button" @click="$route.name === 'messaging' ? top() : $router.replace('/my/messaging')" :class="{ active: $route.name === 'messaging' }"><i class="fas fa-comments"></i><span v-if="$i.hasUnreadMessagingMessage" class="indicator"><i class="fas fa-circle"></i></span></button>
		<button class="button widget _button" @click="widgetsShowing = true"><i class="fas fa-layer-group"></i></button>
		<!-- <button class="button post _button" @click="post"><i class="fas fa-pencil-alt"></i></button> -->
	</div>

	<button v-if="fabButton && !isMobile" class="fab _buttonPrimary" :class="{ navHidden }" @click="onFabClicked" v-click-anime><i :key="fabIcon" :class="fabIcon"/></button>

	<button class="widgetButton _button" :class="{ navHidden }" @click="widgetsShowing = true"><i class="fas fa-layer-group"></i></button>

	<transition name="tray-back">
		<div class="tray-back _modalBg"
			v-if="widgetsShowing"
			@click="widgetsShowing = false"
			@touchstart.passive="widgetsShowing = false"
		></div>
	</transition>

	<transition name="tray">
		<XWidgets v-if="widgetsShowing" class="tray"/>
	</transition>

	<XCommon/>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { instanceName } from '@client/config';
import { StickySidebar } from '@client/scripts/sticky-sidebar';
import XSidebar from './sidebar.vue';
import XSidebarMobile from './sidebar-mobile.vue';
import XCommon from '../_common_/common.vue';
import XSide from './friendly.side.vue';
import * as os from '@client/os';
import { menuDef } from '@client/menu';
import * as symbols from '@client/symbols';
import { eventBus } from '@client/friendly/eventBus';

const DESKTOP_THRESHOLD = 1100;
const WIDE_TABLET_THRESHOLD = 850;
const MOBILE_THRESHOLD = 600;

localStorage.setItem('ui', 'friendly');

export default defineComponent({
	components: {
		XCommon,
		XSidebar,
		XSidebarMobile,
		XWidgets: defineAsyncComponent(() => import('./friendly.widgets.vue')),
		XSide, // NOTE: dynamic importするとAsyncComponentWrapperが間に入るせいでref取得できなくて面倒になる
	},

	provide() {
		return {
			sideViewHook: this.isDesktop ? (url) => {
				this.$refs.side.navigate(url);
			} : null
		};
	},

	data() {
		return {
			pageInfo: null,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			isWideTablet: window.innerWidth >= WIDE_TABLET_THRESHOLD,
			isMobile: window.innerWidth <= MOBILE_THRESHOLD,
			menuDef: menuDef,
			navHidden: false,
			widgetsShowing: false,
			wallpaper: localStorage.getItem('wallpaper') != null,
			queue: 0,
			routeList: [
				'index',
				'explore',
				'notifications',
				'messaging',
				'user',
				'drive',
				'clips',
				'pages',
				'ads',
				'gallery',
				'channels',
				'groups',
				'antennas'
			],
			fabButton: false
		};
	},

	computed: {
		navIndicated(): boolean {
			for (const def in this.menuDef) {
				if (def === 'notifications') continue; // 通知は下にボタンとして表示されてるから
				if (this.menuDef[def].indicated) return true;
			}
			return false;
		},

		fabIcon() {
			return this.pageInfo && this.pageInfo.action ? this.pageInfo.action.icon : 'fas fa-pencil-alt';
		},
	},

	created() {
		document.documentElement.style.overflowY = 'scroll';

		if (this.$store.state.widgets.length === 0) {
			this.$store.set('widgets', [{
				name: 'calendar',
				id: 'a', place: 'right', data: {}
			}, {
				name: 'notifications',
				id: 'b', place: 'right', data: {}
			}, {
				name: 'trends',
				id: 'c', place: 'right', data: {}
			}]);
		}

		eventBus.on('kn-drawernav', () => this.showNav());
		eventBus.on('kn-timeline-new', (q) => this.queueUpdated(q));
		eventBus.on('kn-timeline-new-queue-reset', () => this.queueReset());
	},

	mounted() {
		this.adjustUI();

		const ro = new ResizeObserver((entries, observer) => {
			this.adjustUI();
		});

		ro.observe(this.$refs.contents);

		window.addEventListener('resize', this.adjustUI, { passive: true });

		if (!this.isDesktop) {
			window.addEventListener('resize', () => {
				if (window.innerWidth >= DESKTOP_THRESHOLD) this.isDesktop = true;
			}, { passive: true });
		}
	},

	methods: {
		changePage(page) {
			if (page == null) return;
			if (page[symbols.PAGE_INFO]) {
				this.pageInfo = page[symbols.PAGE_INFO];
				document.title = `${this.pageInfo.title} | ${instanceName}`;
				this.fabButton = this.routeList.includes(this.$route.name);
			}
		},

		adjustUI() {
			const navWidth = this.$refs.nav.$el.offsetWidth;
			this.navHidden = navWidth === 0;
		},

		showNav() {
			this.$refs.nav.show();
		},

		attachSticky(el) {
			const sticky = new StickySidebar(this.$refs.widgets);
			window.addEventListener('scroll', () => {
				sticky.calc(window.scrollY);
			}, { passive: true });
		},

		post() {
			os.post_form();
		},

		top() {
			window.scroll({ top: 0, behavior: 'smooth' });
		},

		back() {
			history.back();
		},

		onTransition() {
			if (window._scroll) window._scroll();
		},

		onContextmenu(e) {
			const isLink = (el: HTMLElement) => {
				if (el.tagName === 'A') return true;
				if (el.parentElement) {
					return isLink(el.parentElement);
				}
			};
			if (isLink(e.target)) return;
			if (['INPUT', 'TEXTAREA', 'IMG', 'VIDEO', 'CANVAS'].includes(e.target.tagName) || e.target.attributes['contenteditable']) return;
			if (window.getSelection().toString() !== '') return;
			const path = this.$route.path;
			os.contextMenu([{
				type: 'label',
				text: path,
			}, {
				icon: 'fas fa-columns',
				text: this.$ts.openInSideView,
				action: () => {
					this.$refs.side.navigate(path);
				}
			}, {
				icon: 'fas fa-window-maximize',
				text: this.$ts.openInWindow,
				action: () => {
					os.pageWindow(path);
				}
			}], e);
		},

		queueUpdated(q) {
			this.queue = q;
		},

		queueReset() {
			this.queue = 0;
		},

		onFabClicked(e) {
			if (this.pageInfo && this.pageInfo.action) {
				this.pageInfo.action.handler(e);
			} else {
				os.post_form();
			}
		},
	}
});
</script>

<style lang="scss" scoped>
.tray-enter-active,
.tray-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.tray-enter-from,
.tray-leave-active {
	opacity: 0;
	transform: translateX(240px);
}

.tray-back-enter-active,
.tray-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.tray-back-enter-from,
.tray-back-leave-active {
	opacity: 0;
}

.mk-app {
	$ui-font-size: 1em; // TODO: どこかに集約したい
	$widgets-hide-threshold: 1090px;
	$nav-hide-threshold: 600px;

	// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	min-height: calc(var(--vh, 1vh) * 100);
	box-sizing: border-box;
	display: flex;

	&.wallpaper {
		background: var(--wallpaperOverlay);
		//backdrop-filter: var(--blur, blur(4px));
	}

	> .sidebar {
	}

	> .contents {
		width: 100%;
		min-width: 0;
		background: var(--panel);

		> main {
			min-width: 0;

			> .spacer {
				height: 82px;

				@media (min-width: ($widgets-hide-threshold + 1px)) {
					display: none;
				}
			}
		}
	}

	> .side {
		min-width: 370px;
		max-width: 370px;
		border-left: solid 0.5px var(--divider);
	}

	> .widgets {
		padding: 0 var(--margin);
		border-left: solid 0.5px var(--divider);
		background: var(--bg);

		@media (max-width: $widgets-hide-threshold) {
			display: none;
		}
	}

	> .widgetButton {
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

		&.navHidden {
			display: none;
		}

		@media (min-width: ($widgets-hide-threshold + 1px)) {
			display: none;
		}
	}

	> .buttons {
		position: fixed;
		z-index: 1000;
		bottom: 0;
		//padding: 16px;
		display: flex;
		width: 100%;
		box-sizing: border-box;
		-webkit-backdrop-filter: var(--blur, blur(32px));
		backdrop-filter: var(--blur, blur(32px));
		background-color: var(--header);
		border-top: solid 0.5px var(--divider);

		&:not(.navHidden) {
			display: none;
		}

		> .button {
			position: relative;
			flex: 1;
			//padding: 0;
			margin: auto;
			height: 50px;
			//border-radius: 8px;
			background: var(--panel);
			color: var(--fg);
			padding: 15px 0 calc(constant(safe-area-inset-bottom) + 30px); /* iOS 11.0 */
			padding: 15px 0 calc(env(safe-area-inset-bottom) + 30px); /* iOS 11.2 */

			&:not(:last-child) {
				//margin-right: 12px;
			}

			@media (max-width: 300px) {
				height: 60px;

				&:not(:last-child) {
					margin-right: 8px;
				}
			}

			&:hover {
				background: var(--X2);
			}

			&.active {
				color: var(--accent);
			}

			> .indicator,
				.indicator-home {
				position: absolute;
				top: 7px;
				right: 20px;
				color: var(--indicator);
				font-size: 8px;
				animation: blink 1s infinite;
			}

			> .indicator-home {
				top: 8px;
				right: 25px;
				font-size: 6px;
				animation: none;
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
	}

	> .fab {
		display: block;
		position: fixed;
		z-index: 1000;
		right: calc(32px + var(--margin) * 2 + 300px);
		bottom: 32px;
		width: 55px;
		height: 55px;
		border-radius: 100%;
		// box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
		font-size: 22px;
		background: var(--accent);
		color: white;

		@media (max-width: $widgets-hide-threshold) {
			right: 30px;
		}

		@media (max-width: $nav-hide-threshold) {
			bottom: calc(66px + env(safe-area-inset-bottom));
			right: 15px;
		}

		@media (min-width: (850px) + 1px) {
			display: none;
		}

		@media (min-width: (600px) + 1px) {
			bottom: calc(45px + env(safe-area-inset-bottom));
		}
	}

	> .tray-back {
		z-index: 1001;
	}

	> .tray {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 1001;
		// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
		height: calc(var(--vh, 1vh) * 100);
		padding: var(--margin);
		box-sizing: border-box;
		overflow: auto;
		background: var(--bg);
	}
}
</style>

<style lang="scss">
</style>
