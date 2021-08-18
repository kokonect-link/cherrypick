<template>
<div class="fdidabkb" :class="{ center }" :style="`--height:${height};`" :key="key">
	<transition :name="$store.state.animation ? 'header' : ''" mode="out-in" appear>
		<div class="buttons left" v-if="backButton && canBack">
			<button class="_button button back" @click.stop="$emit('back')" @touchstart="preventDrag" v-tooltip="$ts.goBack"><i class="fas fa-chevron-left"></i></button>
		</div>
	</transition>
	<div class="buttons left" v-if="isMobile">
		<button class="_button button" v-if="!(backButton && canBack) || fabButton" @click="showDrawerNav">
			<i class="fas fa-bars"/>
			<span v-if="$i.hasPendingReceivedFollowRequest || $i.hasUnreadAnnouncement || $i.hasUnreadMentions || $i.hasUnreadSpecifiedNotes" class="indicator"><i class="fas fa-circle"></i></span>
		</button>
	</div>
	<template v-if="info">
		<div class="titleContainer">
			<template v-if="info.tabs">
				<div class="title" v-for="tab in info.tabs" :key="tab.id" :class="{ _button: tab.onClick, selected: tab.selected }" @click.stop="tab.onClick" v-tooltip="tab.tooltip">
					<i v-if="tab.icon" class="fa-fw" :class="tab.icon" :key="tab.icon"/>
					<span v-if="tab.title" class="text">{{ tab.title }}</span>
					<i class="fas fa-circle indicator" v-if="tab.indicate"/>
				</div>
			</template>

			<template v-else>
				<div class="title">
					<i v-if="info.icon" class="icon" :class="info.icon"></i>
					<MkAvatar v-if="info.avatar" class="avatar" :user="info.avatar" :disable-preview="true" :show-indicator="true"/>
					<MkUserName v-if="info.userName" :user="info.userName" :nowrap="false" class="title"/>
					<span v-else-if="info.title" class="text">{{ info.title }}</span>
					<div class="subtitle" v-if="info.subtitle">
						{{ info.subtitle }}
					</div>
				</div>
			</template>
		</div>

		<div class="buttons right">
			<button v-if="queue > 0 && $route.name === 'index' && ($store.state.newNoteNotiBehavior === 'smail' || $store.state.newNoteNotiBehavior === 'header')" :class="{ 'new _button': $store.state.newNoteNotiBehavior === 'header', 'new-hover _buttonPrimary': $store.state.newNoteNotiBehavior === 'smail' }" @click="top" v-click-anime><i class="fas fa-chevron-up"></i></button>
			<template v-if="info.actions && showActions">
				<button v-for="action in info.actions" class="_button button" :class="{ highlighted: action.highlighted }" @click.stop="action.handler" @touchstart="preventDrag" v-tooltip="action.text"><i :class="action.icon"></i></button>
			</template>
			<button v-if="shouldShowMenu" class="_button button" @click.stop="showMenu" @touchstart="preventDrag" v-tooltip="$ts.menu"><i class="fas fa-ellipsis-h"></i></button>
			<button v-if="closeButton" class="_button button" @click.stop="$emit('close')" @touchstart="preventDrag" v-tooltip="$ts.close"><i class="fas fa-times"></i></button>
		</div>
	</template>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { popupMenu } from '@client/os';
import { url } from '@client/config';
import { eventBus } from "@client/friendly/eventBus";

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 600;

export default defineComponent({
	props: {
		info: {
			required: true
		},
		menu: {
			required: false
		},
		backButton: {
			type: Boolean,
			required: false,
			default: false,
		},
		closeButton: {
			type: Boolean,
			required: false,
			default: false,
		},
		center: {
			type: Boolean,
			required: false,
			default: true,
		},
		showIndicator: {
			required: false,
			default: false
		}
	},

	data() {
		return {
			isMobile: window.innerWidth <= MOBILE_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			canBack: false,
			showActions: false,
			height: 0,
			key: 0,
			queue: 0,
			routeList: [
				'explore',
				'notifications',
				'messaging'
			],
			fabButton: false
		};
	},

	computed: {
		shouldShowMenu() {
			if (this.info.actions != null && !this.showActions) return true;
			if (this.info.menu != null) return true;
			if (this.info.share != null) return true;
			if (this.menu != null) return true;
			return false;
		}
	},

	watch: {
		info() {
			this.key++;
		},

		$route: {
			handler(to, from) {
				this.canBack = (window.history.length > 0 && !['index'].includes(to.name));
				this.fabButton = this.routeList.includes(this.$route.name);
			},
			immediate: true
		},
	},

	created() {
		eventBus.on('kn-timeline-new', (q) => this.queueUpdated(q));
		eventBus.on('kn-timeline-new-queue-reset', () => this.queueReset());
	},

	mounted() {
		this.height = this.$el.parentElement.offsetHeight + 'px';
		this.showActions = this.$el.parentElement.offsetWidth >= 500;
		new ResizeObserver((entries, observer) => {
			this.height = this.$el.parentElement.offsetHeight + 'px';
			this.showActions = this.$el.parentElement.offsetWidth >= 500;
		}).observe(this.$el);

		window.addEventListener('resize', () => {
			this.isMobile = (window.innerWidth <= MOBILE_THRESHOLD);
			this.isDesktop = (window.innerWidth >= DESKTOP_THRESHOLD);
		}, { passive: true });
	},

	methods: {
		share() {
			navigator.share({
				url: url + this.info.path,
				...this.info.share,
			});
		},

		showDrawerNav() {
			this.$emit('kn-drawernav');
		},

		onHeaderClick() {
			window.scroll({ top: 0, behavior: 'smooth' });
		},

		showMenu(ev) {
			let menu = this.info.menu ? this.info.menu() : [];
			if (!this.showActions && this.info.actions) {
				menu = [...this.info.actions.map(x => ({
					text: x.text,
					icon: x.icon,
					action: x.handler
				})), menu.length > 0 ? null : undefined, ...menu];
			}
			if (this.info.share) {
				if (menu.length > 0) menu.push(null);
				menu.push({
					text: this.$ts.share,
					icon: 'fas fa-share-alt',
					action: this.share
				});
			}
			if (this.menu) {
				if (menu.length > 0) menu.push(null);
				menu = menu.concat(this.menu);
			}
			popupMenu(menu, ev.currentTarget || ev.target);
		},

		preventDrag(ev) {
			ev.stopPropagation();
		},

		queueUpdated(q) {
			this.queue = q;
		},

		queueReset() {
			this.queue = 0;
		},

		top() {
			this.onHeaderClick();
			this.queueReset();
			eventBus.emit('kn-header-new-queue-reset', 0);
		}
	}
});
</script>

<style lang="scss" scoped>
.fdidabkb {
	$ui-font-size: 1em;
	$avatar-size: 32px;
	$avatar-margin: 10px;

	display: flex;

	&.center {
		text-align: center;

		> .titleContainer {
			margin: 0 auto;
		}
	}

	> .buttons {
		&.left, &.right {
			>.button {
				height: var(--height);
				width: var(--height);
			}
		}

		&.left {
			position: absolute;
			z-index: 1;
			top: 0;
			left: 0;

			> .button {
				height: var(--height);
				width: var(--height);

				> .indicator {
					position: absolute;
					bottom: 13px;
					left: 43px;
					color: var(--navIndicator);
					font-size: 7px;
					animation: blink 1s infinite;
				}
			}
		}

		&.right {
			position: absolute;
			z-index: 1;
			top: 0;
			right: 0;
			margin-left: 0;

			> .new {
				width: $avatar-size;
				height: var(--height);
			}

			> .new-hover {
				position: absolute;
				width: $avatar-size;
				height: $avatar-size;
				top: 55px;
				right: 14px;
				border-radius: 100%;
				// border: 2px solid var(--patron);
				line-height: 0;
				background: var(--pick);
				margin-top: 10px;
				// box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);

				&:hover {
					background: var(--pickLighten);
				}
			}
		}

		&:empty {
			width: var(--height);
		}
	}

	> .titleContainer {
		display: flex;
		align-items: center;
		overflow: auto;
		white-space: nowrap;
		text-align: left;

		> .title {
			display: inline-block;
			vertical-align: bottom;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			padding: 0 16px;
			position: relative;
			height: var(--height);

			> .indicator {
				position: absolute;
				top: 13px;
				right: 7px;
				color: var(--indicator);
				font-size: 7px;
				animation: blink 1s infinite;
			}

			> .icon {
				margin-right: 8px;
			}

			> .avatar {
				$size: 32px;
				display: inline-block;
				width: $size;
				height: $size;
				vertical-align: bottom;
				margin: calc((var(--height) - #{$size}) / 2) 8px calc((var(--height) - #{$size}) / 2) 0;
				pointer-events: none;
			}

			> .patron {
				margin-left: 0.5em;
				color: var(--patron);
			}

			> .subtitle {
				opacity: 0.6;
				font-size: 0.8em;
				font-weight: normal;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			&._button {
				&:hover {
					color: var(--fgHighlighted);
				}
			}

			&.selected {
				box-shadow: 0 -2px 0 0 var(--accent) inset;
				color: var(--fgHighlighted);
			}
		}
	}
}
</style>
