<template>
<div class="mk-app" :class="{ wallpaper, isMobile }">
	<XHeaderMenu v-if="showMenuOnTop"/>

	<div class="columns" :class="{ fullView, withGlobalHeader: showMenuOnTop }">
		<template v-if="!isMobile">
			<div class="sidebar" v-if="!showMenuOnTop">
				<XSidebar/>
			</div>
			<div class="widgets left" ref="widgetsLeft" v-else>
				<XWidgets @mounted="attachSticky('widgetsLeft')" :place="'left'"/>
			</div>
		</template>

		<main class="main _panel" @contextmenu.stop="onContextmenu" :style="{ background: pageInfo?.bg }">
			<header class="header">
				<XHeader @kn-drawernav="showDrawerNav" :info="pageInfo"/>
			</header>
			<div class="content" :class="{ '_fitSide_': isMobile && !fullView, '_fitSide_friendly_legacy_': !isMobile && !fullView }">
				<router-view v-slot="{ Component }">
					<transition :name="$store.state.animation ? 'page' : ''" mode="out-in" @enter="onTransition">
						<keep-alive :include="['timeline']">
							<component :is="Component" :ref="changePage"/>
						</keep-alive>
					</transition>
				</router-view>
			</div>
		</main>

		<div v-if="isDesktop" class="widgets right" ref="widgetsRight">
			<XWidgets @mounted="attachSticky('widgetsRight')" :place="null"/>
		</div>
	</div>

	<div class="floatbtn" v-if="!isDesktop">
		<button v-if="$route.name === 'index' || $route.name === 'notifications' || $route.name === 'user'" class="post _buttonPrimary" @click="post()" v-click-anime><i class="fas fa-pencil-alt"/></button>
		<button v-if="$route.name === 'messaging'" class="post _buttonPrimary" @click="createMessagingRoom()" v-click-anime><i class="fas fa-plus"/></button>
		<button v-if="$route.name === 'drive'" class="post _buttonPrimary" @click="driveMenu()" v-click-anime><i class="fas fa-plus"/></button>
		<button v-if="$route.name === 'clips'" class="post _buttonPrimary" @click="createClip()" v-click-anime><i class="fas fa-plus"/></button>
		<button v-if="$route.name === 'pages'" class="post _buttonPrimary" @click="createPage()" v-click-anime><i class="fas fa-plus"/></button>
		<button v-if="$route.name === 'ads'" class="post _buttonPrimary" @click="createAd()" v-click-anime><i class="fas fa-plus"/></button>
  </div>

	<div class="buttons" v-if="isMobile">
		<!-- <button class="button nav _button" @click="showDrawerNav" ref="navButton"><i class="fas fa-bars"></i><span v-if="navIndicated" class="indicator"><i class="fas fa-circle"></i></span></button> -->
		<button class="button home _button" @click="$route.name === 'index' ? top() : $router.replace('/')" :class="{ active: $route.name === 'index' }"><i class="fas fa-home"></i></button>
		<button class="button search _button" @click="search"><i class="fas fa-search"/></button>
		<button class="button notifications _button" @click="$route.name === 'notifications' ? top() : $router.replace('/my/notifications')" :class="{ active: $route.name === 'notifications' }"><i class="fas fa-bell"></i><span v-if="$i.hasUnreadNotification" class="indicator"><i class="fas fa-circle"></i></span></button>
		<button class="button tab _button" @click="$route.name === 'messaging' ? top() : $router.replace('/my/messaging')" :class="{ active: $route.name === 'messaging' }"><i class="fas fa-comments"></i><span v-if="$i.hasUnreadMessagingMessage" class="indicator"><i class="fas fa-circle"></i></span></button>
		<button class="button widget _button" @click="widgetsShowing = true"><i class="fas fa-layer-group"></i></button>
		<!-- <button class="button post _button" @click="post"><i class="fas fa-pencil-alt"></i></button> -->
	</div>

	<XDrawerSidebar ref="drawerNav" class="sidebar" v-if="isMobile"/>

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

	<iframe v-if="$store.state.aiChanMode" class="ivnzpscs" ref="live2d" src="https://misskey-dev.github.io/mascot-web/?scale=2&y=1.4"></iframe>

	<XCommon/>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, markRaw } from 'vue';
import { instanceName } from '@client/config';
import { StickySidebar } from '@client/scripts/sticky-sidebar';
import XSidebar from './friendly.sidebar.vue';
import XDrawerSidebar from './sidebar.vue';
import XCommon from '../_common_/common.vue';
import XHeader from './header.vue';
import * as os from '@client/os';
import { menuDef } from '@client/menu';
import * as symbols from '@client/symbols';
import XTimeline from '@client/components/timeline.vue';
import { search } from '@client/scripts/search';
import { eventBus } from '@client/friendly/eventBus';

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 600;

export default defineComponent({
	components: {
		XCommon,
		XSidebar,
		XDrawerSidebar,
		XHeader,
		XTimeline,
		XHeaderMenu: defineAsyncComponent(() => import('../default.header.vue')),
		XWidgets: defineAsyncComponent(() => import('./friendly.widgets.vue'))
	},

	data() {
		return {
			pageInfo: null,
			menuDef: menuDef,
			isMobile: window.innerWidth <= MOBILE_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			widgetsShowing: false,
			fullView: false,
			wallpaper: localStorage.getItem('wallpaper') != null,
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

		showMenuOnTop(): boolean {
			return !this.isMobile && this.$store.state.menuDisplay === 'top';
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
	},

	mounted() {
		window.addEventListener('resize', () => {
			this.isMobile = (window.innerWidth <= MOBILE_THRESHOLD);
			this.isDesktop = (window.innerWidth >= DESKTOP_THRESHOLD);
		}, { passive: true });

		if (this.$store.state.aiChanMode) {
			const iframeRect = this.$refs.live2d.getBoundingClientRect();
			window.addEventListener('mousemove', ev => {
				this.$refs.live2d.contentWindow.postMessage({
					type: 'moveCursor',
					body: {
						x: ev.clientX - iframeRect.left,
						y: ev.clientY - iframeRect.top,
					}
				}, '*');
			}, { passive: true });
			window.addEventListener('touchmove', ev => {
				this.$refs.live2d.contentWindow.postMessage({
					type: 'moveCursor',
					body: {
						x: ev.touches[0].clientX - iframeRect.left,
						y: ev.touches[0].clientY - iframeRect.top,
					}
				}, '*');
			}, { passive: true });
		}
	},

	methods: {
		changePage(page) {
			if (page == null) return;
			if (page[symbols.PAGE_INFO]) {
				this.pageInfo = page[symbols.PAGE_INFO];
				document.title = `${this.pageInfo.title} | ${instanceName}`;
			}
		},

		attachSticky(ref) {
			const sticky = new StickySidebar(this.$refs[ref], this.$store.state.menuDisplay === 'top' ? 0 : 16, this.$store.state.menuDisplay === 'top' ? 60 : 0); // TODO: ヘッダーの高さを60pxと決め打ちしているのを直す
			window.addEventListener('scroll', () => {
				sticky.calc(window.scrollY);
			}, { passive: true });
		},

		post() {
			os.post_form();
		},

		createMessagingRoom() {
			eventBus.emit('kn-createmsgroom');
		},

		driveMenu() {
			eventBus.emit('kn-drivemenu');
		},

		createClip() {
			eventBus.emit('kn-createclip');
		},

		createPage() {
			eventBus.emit('kn-createpage');
		},

		createAd() {
			eventBus.emit('kn-createad');
		},

		search() {
			search();
		},

		top() {
			window.scroll({ top: 0, behavior: 'smooth' });
		},

		showDrawerNav() {
			this.$refs.drawerNav.show();
		},

		onTransition() {
			if (window._scroll) window._scroll();
		},

		onHeaderClick() {
			window.scroll({ top: 0, behavior: 'smooth' });
		},

		onContextmenu(e) {
			const isLink = (el: HTMLElement) => {
				if (el.tagName === 'A') return true;
				if (el.parentElement) {
					return isLink(el.parentElement);
				}
			};
			if (isLink(e.target)) return;
			if (['INPUT', 'TEXTAREA', 'IMG', 'VIDEO'].includes(e.target.tagName) || e.target.attributes['contenteditable']) return;
			if (window.getSelection().toString() !== '') return;
			const path = this.$route.path;
			os.contextMenu([{
				type: 'label',
				text: path,
			}, {
				icon: this.fullView ? 'fas fa-compress' : 'fas fa-expand',
				text: this.fullView ? this.$ts.quitFullView : this.$ts.fullView,
				action: () => {
					this.fullView = !this.fullView;
				}
			}, {
				icon: 'fas fa-window-maximize',
				text: this.$ts.openInWindow,
				action: () => {
					os.pageWindow(path);
				}
			}], e);
		},

		onAiClick(ev) {
			//if (this.live2d) this.live2d.click(ev);
		}
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
	$nav-hide-threshold: 650px;
	$header-height: 50px;
	$ui-font-size: 1em;
	$widgets-hide-threshold: 1200px;
	$nav-icon-only-width: 78px; // TODO: どこかに集約したい

	// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	min-height: calc(var(--vh, 1vh) * 100);
	box-sizing: border-box;

	&.wallpaper {
		background: var(--wallpaperOverlay);
		//backdrop-filter: blur(4px);
	}

	&.isMobile {
		> .columns {
			display: block;
			margin: 0;

			> .main {
				margin: 0;
				padding-bottom: 92px;
				border: none;
				width: 100%;
				border-radius: 0;

				> .header {
					width: 100%;
				}
			}
		}

		> .buttons {
			> .button {
				&:hover {
					background: var(--panel);
				}
			}
		}
	}

	> .columns {
		display: flex;
		justify-content: center;
		max-width: 100%;
		//margin: 32px 0;

		&.fullView {
			margin: 0;
		
			> .sidebar {
				display: none;
			}

			> .widgets {
				display: none;
			}

			> .main {
				margin: 0;
				border-radius: 0;
				box-shadow: none;
				width: 100%;
			}
		}

		> .main {
			min-width: 0;
			width: 750px;
			margin: 0 16px 0 0;
			background: var(--bg);
			box-shadow: 0 0 0 1px var(--divider);
			border-radius: 0;
			--margin: 12px;

			> .header {
				position: sticky;
				z-index: 1000;
				top: var(--globalHeaderHeight, 0px);
				height: $header-height;
				line-height: $header-height;
				-webkit-backdrop-filter: blur(32px);
				backdrop-filter: blur(32px);
				background-color: var(--header);
			}

			> .content {
				background: var(--bg);
				--stickyTop: calc(var(--globalHeaderHeight, 0px) + #{$header-height});
			}

			@media (max-width: 850px) {
				padding-top: $header-height;

				> .header {
					position: fixed;
					width: calc(100% - #{$nav-icon-only-width});
				}
			}
		}

		> .widgets {
			//--panelShadow: none;
			width: 300px;
			margin-top: 16px;

			@media (max-width: $widgets-hide-threshold) {
				display: none;
			}

			&.left {
				margin-right: 16px;
			}
		}

		> .sidebar {
			margin-top: 16px;
		}

		&.withGlobalHeader {
			--globalHeaderHeight: 60px; // TODO: 60pxと決め打ちしているのを直す

			> .main {
				margin-top: 1px;
				border-radius: var(--radius);
				box-shadow: 0 0 0 1px var(--divider);
			}

			> .widgets {
				--stickyTop: var(--globalHeaderHeight);
				margin-top: 1px;
			}
		}

		@media (max-width: 850px) {
			margin: 0;

			> .sidebar {
				border-right: solid 0.5px var(--divider);
			}

			> .main {
				margin: 0;
				border-radius: 0;
				box-shadow: none;
				width: 100%;
			}
		}
	}

	> .floatbtn {
		position: fixed;
		z-index: 1000;
		bottom: 77px;
		box-sizing: border-box;
		padding: 18px 0 calc(constant(safe-area-inset-bottom) + 43px); /* iOS 11.0 */
		padding: 18px 0 calc(env(safe-area-inset-bottom) + 43px); /* iOS 11.2 */

		> .post {
			position: fixed;
			z-index: 1000;
			width: 55px;
			height: 55px;
			border-radius: 100%;
			box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
			font-size: 22px;
			right: 15px;
		}

		@media (min-width: (850px) + 1px) {
			display: none;
		}

		@media (min-width: (600px) + 1px) {
			bottom: 50px;

			> .post {
				right: 30px;
			}
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
		-webkit-backdrop-filter: blur(32px);
		backdrop-filter: blur(32px);
		background-color: var(--header);
		border-top: solid 0.5px var(--divider);

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

			> .indicator {
				position: absolute;
				top: 7px;
				right: 20px;
				color: var(--indicator);
				font-size: 8px;
				animation: blink 1s infinite;
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

	> .ivnzpscs {
		position: fixed;
		bottom: 0;
		right: 0;
		width: 300px;
		height: 600px;
		border: none;
		pointer-events: none;
	}
}
</style>
