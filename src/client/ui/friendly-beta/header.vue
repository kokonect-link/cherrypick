<template>
<div class="fdidabkb" :class="{ center }" :style="`--height:${height};`" :key="key">
	<template v-if="info">
		<div class="titleContainer" @click="onHeaderClick">
			<template v-if="info.tabs">
				<div class="title" v-for="tab in info.tabs" :key="tab.id" :class="{ _button: tab.onClick, selected: tab.selected }" @click.stop="tab.onClick" v-tooltip="tab.tooltip">
					<i v-if="tab.icon" class="fa-fw" :class="tab.icon" :key="tab.icon"/>
					<span v-if="tab.title" class="text">{{ tab.title }}</span>
					<i class="fas fa-circle indicator" v-if="tab.indicate"/>
				</div>
			</template>
			<template v-else>
				<div class="title">
					<!-- <i v-if="info.icon" class="icon" :class="info.icon"></i> -->
					<MkAvatar v-if="info.avatar && !($route.name === 'note' || 'renotes')" class="avatar" :user="info.avatar" :disable-preview="true" :show-indicator="true"/>
					<MkUserName v-if="info.userName" :user="info.userName" :nowrap="false" class="text"/>
					<span v-else-if="info.title" class="text">{{ info.title }}</span>
				</div>
			</template>
		</div>

		<div class="buttons_L" v-if="isMobile">
			<button class="_button button_L" v-if="!(withBack && canBack) || ($route.name === 'notifications' || $route.name === 'messaging')" @click="showDrawerNav" v-click-anime>
				<i class="fas fa-bars"/>
				<span v-if="$i.hasPendingReceivedFollowRequest || $i.hasUnreadAnnouncement || $i.hasUnreadMentions || $i.hasUnreadSpecifiedNotes" class="indicator">
					<i class="fas fa-circle"></i>
				</span>
			</button>
		</div>
		<div class="buttons_R">
			<button v-if="queue > 0 && $route.name === 'index' && !isDesktop" class="new _buttonPrimary button_R" @click="top" v-click-anime><i class="fas fa-arrow-up"></i></button>
			<template v-if="info.actions && showActions">
				<button v-for="action in info.actions" class="_button button_R" @click.stop="action.handler" v-tooltip="action.text" v-click-anime><i :class="action.icon"></i></button>
			</template>
			<button v-if="showMenu" class="_button button_R" @click.stop="menu" v-click-anime><i class="fas fa-ellipsis-h"></i></button>
		</div>
	</template>
	<transition :name="$store.state.animation ? 'header' : ''" mode="out-in" appear>
		<button class="_button back" v-if="withBack && canBack && isMobile && !($route.name === 'notifications' || $route.name === 'messaging')" @click.stop="back()" v-click-anime><i class="fas fa-chevron-left"></i></button>
		<button class="_button back" v-else-if="withBack && canBack && !isMobile" @click.stop="back()" v-click-anime><i class="fas fa-chevron-left"></i></button>
	</transition>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { modalMenu } from '@client/os';
import { url } from '@client/config';
import { eventBus } from "@client/friendly/eventBus";

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 600;

export default defineComponent({
	props: {
		info: {
			required: true
		},
		withBack: {
			type: Boolean,
			required: false,
			default: true,
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
		};
	},

	computed: {
		showMenu() {
			if (this.info.actions != null && !this.showActions) return true;
			if (this.info.menu != null) return true;
			if (this.info.share != null) return true;
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
		back() {
			if (this.canBack) this.$router.back();
		},

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

		menu(ev) {
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
			modalMenu(menu, ev.currentTarget || ev.target);
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

	&.center {
		text-align: center;

		> .titleContainer {
			margin: 0 auto;
		}
	}

	> .back {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		height: var(--height);
		width: var(--height);
	}

	> .buttons_L {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;

		> .button_L {
			height: var(--height);
			width: var(--height);

			> .indicator {
			position: absolute;
			bottom: 13px;
			right: 45px;
			color: var(--navIndicator);
			font-size: 7px;
			animation: blink 1s infinite;
			}
		}

		> .avatar {
			width: $avatar-size;
			height: $avatar-size;
			vertical-align: middle;
		}

		> .avatar_back {
			margin-left: 50px;
			width: $avatar-size;
			height: $avatar-size;
			vertical-align: middle;
		}

		> .patron {
			margin-left: 0.5em;
			color: var(--patron);
		}
	}

	> .buttons_R {
		position: absolute;
		z-index: 1;
		top: 0;
		right: 0;

		> .button_R {
			height: var(--height);
			width: var(--height);
		}

		> .new {
			position: absolute;
			top: 55px;
			right: 14px;
			width: $avatar-size;
			height: $avatar-size;
			border-radius: 100px;
			line-height: 0;
			background: var(--nect);
			margin-top: 10px;

			&:hover {
				background: var(--navHoverFg);
			}
		}
	}

	> .titleContainer {
		overflow: auto;
		white-space: nowrap;
		width: calc(100% - (var(--height) * 2));

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

			> .icon + .text {
				margin-left: 8px;
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
