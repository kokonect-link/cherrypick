<template>
<div class="cmuxhskf" :class="{ isMobile }" v-size="{ min: [800] }" v-hotkey.global="keymap">
	<XTutorial v-if="$store.reactiveState.tutorial.value != -1" class="tutorial _block"/>
	<XPostForm v-if="$store.reactiveState.showFixedPostForm.value" class="post-form _block" fixed/>

	<div v-if="isFriendlyUILegacy" :class="{ 'tabs-friendly-legacy': isFriendlyUILegacy, 'tabs-friendly-legacy-mobile': isFriendlyUILegacy && isMobile }">
		<div class="left">
			<button class="_button tab" @click="() => { src = 'home'; saveSrc(); queueReset(); top(); }" :class="{ active: src === 'home' }" v-tooltip="$ts._timelines.home"><i class="fas fa-home"></i></button>
			<button class="_button tab" @click="() => { src = 'local'; saveSrc(); queueReset(); top(); }" :class="{ active: src === 'local' }" v-tooltip="$ts._timelines.local" v-if="isLocalTimelineAvailable"><i class="fas fa-comments"></i></button>
			<button class="_button tab" @click="() => { src = 'social'; saveSrc(); queueReset(); top(); }" :class="{ active: src === 'social' }" v-tooltip="$ts._timelines.social" v-if="isLocalTimelineAvailable"><i class="fas fa-share-alt"></i></button>
			<button class="_button tab" @click="() => { src = 'global'; saveSrc(); queueReset(); top(); }" :class="{ active: src === 'global' }" v-tooltip="$ts._timelines.global" v-if="isGlobalTimelineAvailable"><i class="fas fa-globe"></i></button>
			<span class="divider"></span>
			<button class="_button tab" @click="() => { src = 'mentions'; saveSrc(); queueReset(); top(); }" :class="{ active: src === 'mentions' }" v-tooltip="$ts.mentions"><i class="fas fa-at"></i><i v-if="$i.hasUnreadMentions" class="fas fa-circle i"></i></button>
			<button class="_button tab" @click="() => { src = 'directs'; saveSrc(); queueReset(); top(); }" :class="{ active: src === 'directs' }" v-tooltip="$ts.directNotes"><i class="fas fa-envelope"></i><i v-if="$i.hasUnreadSpecifiedNotes" class="fas fa-circle i"></i></button>
		</div>
		<div class="right">
			<button class="_button tab" @click="chooseChannel" :class="{ active: src === 'channel' }" v-tooltip="$ts.channel"><i class="fas fa-satellite-dish"></i><i v-if="$i.hasUnreadChannel" class="fas fa-circle i"></i></button>
			<button class="_button tab" @click="chooseAntenna" :class="{ active: src === 'antenna' }" v-tooltip="$ts.antennas"><i class="fas fa-satellite"></i><i v-if="$i.hasUnreadAntenna" class="fas fa-circle i"></i></button>
			<button class="_button tab" @click="chooseList" :class="{ active: src === 'list' }" v-tooltip="$ts.lists"><i class="fas fa-list-ul"></i></button>
		</div>
	</div>

	<div v-if="isFriendlyUI && $store.state.newNoteNotiBehavior !== 'default'"></div>
	<div :class="{ 'new-friendly-legacy': isFriendlyUILegacy && isDesktop, 'new': !isFriendlyUILegacy }" v-else-if="queue > 0 && ((isFriendlyUI && (isDesktop || (!isDesktop && $store.state.newNoteNotiBehavior === 'default'))) || (isFriendlyUILegacy && isDesktop) || !(isFriendlyUILegacy || isFriendlyUI))"><button class="_buttonPrimary" @click="top()"><i class="fas fa-arrow-up"></i>{{ $ts.newNoteRecived }}</button></div>
	<div class="tl _block">
		<XTimeline ref="tl" class="tl"
			:key="src"
			:src="src"
			:sound="true"
			@before="before()"
			@after="after()"
			@queue="queueUpdated"
		/>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, computed } from 'vue';
import Progress from '@client/scripts/loading';
import XTimeline from '@client/components/timeline.vue';
import XPostForm from '@client/components/post-form.vue';
import { scroll } from '@client/scripts/scroll';
import * as os from '@client/os';
import * as symbols from '@client/symbols';
import { eventBus } from '@client/friendly/eventBus';
import { timelineMenuItems, timelineMenuMap } from '@client/friendly/timeline';

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 600;

export default defineComponent({
	name: 'timeline',

	components: {
		XTimeline,
		XTutorial: defineAsyncComponent(() => import('./timeline.tutorial.vue')),
		XPostForm,
	},

	data() {
		return {
			src: 'home',
			queue: 0,
			[symbols.PAGE_INFO]: computed(() => ({
				title: this.$ts.timeline,
				icon: this.src === 'local' ? 'fas fa-comments' : this.src === 'social' ? 'fas fa-share-alt' : this.src === 'global' ? 'fas fa-globe' : 'fas fa-home',
				bg: 'var(--bg)',
				actions: [{
					icon: 'fas fa-list-ul',
					text: this.$ts.lists,
					handler: this.chooseList
				}, {
					icon: 'fas fa-satellite',
					text: this.$ts.antennas,
					handler: this.chooseAntenna
				}, {
					icon: 'fas fa-satellite-dish',
					text: this.$ts.channel,
					handler: this.chooseChannel
				}, {
					icon: 'fas fa-calendar-alt',
					text: this.$ts.jumpToSpecifiedDate,
					handler: this.timetravel
				}],
				tabs: [{
					active: this.src === 'home',
					title: this.$ts._timelines.home,
					icon: 'fas fa-home',
					iconOnly: true,
					onClick: () => { this.src = 'home'; this.saveSrc(); },
				}, {
					active: this.src === 'local',
					title: this.$ts._timelines.local,
					icon: 'fas fa-comments',
					iconOnly: true,
					onClick: () => { this.src = 'local'; this.saveSrc(); },
				}, {
					active: this.src === 'social',
					title: this.$ts._timelines.social,
					icon: 'fas fa-share-alt',
					iconOnly: true,
					onClick: () => { this.src = 'social'; this.saveSrc(); },
				}, {
					active: this.src === 'global',
					title: this.$ts._timelines.global,
					icon: 'fas fa-globe',
					iconOnly: true,
					onClick: () => { this.src = 'global'; this.saveSrc(); },
				}],
			})),
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
			isMobile: window.innerWidth <= MOBILE_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD
		};
	},

	computed: {
		keymap(): any {
			return {
				't': this.focus
			};
		},

		isLocalTimelineAvailable(): boolean {
			return !this.$instance.disableLocalTimeline || this.$i.isModerator || this.$i.isAdmin;
		},

		isGlobalTimelineAvailable(): boolean {
			return !this.$instance.disableGlobalTimeline || this.$i.isModerator || this.$i.isAdmin;
		},
	},

	watch: {
		src() {
			this.showNav = false;
		},
	},

	created() {
		this.src = this.$store.state.tl.src;
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		queueUpdated(q) {
			this.queue = q;
			eventBus.emit('kn-timeline-new', q);
		},

		queueReset() {
			this.queue = 0;
			eventBus.emit('kn-timeline-new-queue-reset', 0);
		},

		top() {
			scroll(this.$el, { top: 0 });
		},

		async chooseList(ev) {
			const lists = await os.api('users/lists/list');
			const items = lists.map(list => ({
				type: 'link',
				text: list.name,
				to: `/timeline/list/${list.id}`
			}));
			await os.popupMenu(items, ev.currentTarget || ev.target);
		},

		async chooseAntenna(ev) {
			const antennas = await os.api('antennas/list');
			const items = antennas.map(antenna => ({
				type: 'link',
				text: antenna.name,
				indicate: antenna.hasUnreadNote,
				to: `/timeline/antenna/${antenna.id}`
			}));
			await os.popupMenu(items, ev.currentTarget || ev.target);
		},

		async chooseChannel(ev) {
			const channels = await os.api('channels/followed');
			const items = channels.map(channel => ({
				type: 'link',
				text: channel.name,
				indicate: channel.hasUnreadNote,
				to: `/channels/${channel.id}`
			}));
			await os.popupMenu(items, ev.currentTarget || ev.target);
		},

		saveSrc() {
			this.$store.set('tl', {
				src: this.src,
			});
		},

		async timetravel() {
			const { canceled, result: date } = await os.dialog({
				title: this.$ts.date,
				input: {
					type: 'date'
				}
			});
			if (canceled) return;

			this.$refs.tl.timetravel(new Date(date));
		},

		focus() {
			(this.$refs.tl as any).focus();
		}
	}
});
</script>

<style lang="scss" scoped>
.cmuxhskf {
	padding: var(--margin);

	> .new,
		.new-friendly-legacy {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
			// box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);

			> i {
				margin-right: 5px;
			}
		}
	}

	> .new-friendly-legacy {
		--stickyTop: 100px;
	}

	&.isMobile {
		> .tabs-friendly-legacy {
			> .left, > .right {
				> .tab {
					padding: 0 10px;
				}
			}
		}
	}

	> .tabs-friendly-legacy,
		.tabs-friendly-legacy-mobile {
		display: flex;
		box-sizing: border-box;
		padding: 0 8px;
		white-space: nowrap;
		overflow: auto;
		border-bottom: solid 0.5px var(--divider);

		// 影の都合上
		position: relative;

		> .right {
			margin-left: auto;
		}

		> .left, > .right {
			> .tab {
				position: relative;
				height: 50px;
				padding: 0 12px;

				&:hover {
					color: var(--fgHighlighted);
				}

				&.active {
					color: var(--fgHighlighted);

					&:after {
						content: "";
						display: block;
						position: absolute;
						bottom: 0;
						left: 0;
						right: 0;
						margin: 0 auto;
						width: 100%;
						height: 2px;
						background: var(--accent);
					}
				}

				> .i {
					position: absolute;
					top: 12px;
					right: 5px;
					color: var(--indicator);
					font-size: 7px;
					animation: blink 1s infinite;
				}
			}

			> .divider {
				display: inline-block;
				width: 1px;
				height: 28px;
				vertical-align: middle;
				margin: 0 8px;
				background: var(--divider);
			}
		}
	}

	> .post-form {
		border-radius: var(--radius);
	}

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}

	&.min-width_800px {
		max-width: 800px;
		margin: 0 auto;
	}

	> .tabs-friendly-legacy,
		.tabs-friendly-legacy-mobile {
		position: sticky;
		--stickyTop: 110px;
		z-index: 1000;
		background: var(--header);
		-webkit-backdrop-filter: blur(32px);
		backdrop-filter: blur(32px);
		top: calc(-50px + var(--stickyTop, 0px));
		// Rounded Design
		border-radius: var(--radius);
		box-shadow: var(--panelShadow);
	}

	> .tabs-friendly-legacy-mobile {
		margin: 8px;
	}
}
</style>
