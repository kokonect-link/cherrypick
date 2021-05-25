<template>
<div class="cmuxhskf _root" :class="{ isMobile }" v-hotkey.global="keymap">
	<XTutorial v-if="$store.reactiveState.tutorial.value != -1" class="tutorial _block"/>
	<XPostForm v-if="$store.reactiveState.showFixedPostForm.value" class="post-form _block" fixed/>
	<div class="_block" :class="{ 'tabs-friendly': isFriendlyUI, 'tabs': !isFriendlyUI, 'tabs-friendly-mobile': isFriendlyUI && isMobile }">
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
	<div :class="{ 'new-friendly': isFriendlyUI && isDesktop, 'new': !isFriendlyUI }" v-if="queue > 0"><button class="_buttonPrimary" @click="top()"><i class="fas fa-arrow-up"></i>{{ $ts.newNoteRecived }}</button></div>
	<XTimeline ref="tl"
		class="_gap"
		:key="src === 'list' ? `list:${list.id}` : src === 'antenna' ? `antenna:${antenna.id}` : src === 'channel' ? `channel:${channel.id}` : src"
		:src="src"
		:list="list ? list.id : null"
		:antenna="antenna ? antenna.id : null"
		:channel="channel ? channel.id : null"
		:sound="true"
		@before="before()"
		@after="after()"
		@queue="queueUpdated"
	/>
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
import {eventBus} from "@client/friendly/eventBus";

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
			list: null,
			antenna: null,
			channel: null,
			menuOpened: false,
			queue: 0,
			[symbols.PAGE_INFO]: computed(() => ({
				title: this.$ts.timeline,
				icon: this.src === 'local' ? 'fas fa-comments' : this.src === 'social' ? 'fas fa-share-alt' : this.src === 'global' ? 'fas fa-globe' : 'fas fa-home',
				actions: [{
					icon: 'fas fa-calendar-alt',
					text: this.$ts.jumpToSpecifiedDate,
					handler: this.timetravel
				}]
			})),
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isMobile: window.innerWidth <= MOBILE_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
		};
	},

	mounted() {
		window.addEventListener('resize', () => {
			this.isMobile = (window.innerWidth <= MOBILE_THRESHOLD);
			this.isDesktop = (window.innerWidth >= DESKTOP_THRESHOLD);
		}, { passive: true });
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
		list(x) {
			this.showNav = false;
			if (x != null) this.antenna = null;
			if (x != null) this.channel = null;
		},
		antenna(x) {
			this.showNav = false;
			if (x != null) this.list = null;
			if (x != null) this.channel = null;
		},
		channel(x) {
			this.showNav = false;
			if (x != null) this.antenna = null;
			if (x != null) this.list = null;
		},
	},

	created() {
		this.src = this.$store.state.tl.src;
		if (this.src === 'list') {
			this.list = this.$store.state.tl.arg;
		} else if (this.src === 'antenna') {
			this.antenna = this.$store.state.tl.arg;
		} else if (this.src === 'channel') {
			this.channel = this.$store.state.tl.arg;
		}
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
			eventBus.emit('kn-header-new', q);
		},

		queueReset() {
			this.queue = 0;
		},

		top() {
			// scroll(this.$el, 0);
			window.scroll({ top: 0, behavior: 'smooth' });
		},

		async chooseList(ev) {
			const lists = await os.api('users/lists/list');
			const items = lists.map(list => ({
				text: list.name,
				action: () => {
					this.list = list;
					this.src = 'list';
					this.saveSrc();
					this.queueReset();
					this.top();
				}
			}));
			os.modalMenu(items, ev.currentTarget || ev.target);
		},

		async chooseAntenna(ev) {
			const antennas = await os.api('antennas/list');
			const items = antennas.map(antenna => ({
				text: antenna.name,
				indicate: antenna.hasUnreadNote,
				action: () => {
					this.antenna = antenna;
					this.src = 'antenna';
					this.saveSrc();
					this.queueReset();
					this.top();
				}
			}));
			os.modalMenu(items, ev.currentTarget || ev.target);
		},

		async chooseChannel(ev) {
			const channels = await os.api('channels/followed');
			const items = channels.map(channel => ({
				text: channel.name,
				indicate: channel.hasUnreadNote,
				action: () => {
					// NOTE: チャンネルタイムラインをこのコンポーネントで表示するようにすると投稿フォームはどうするかなどの問題が生じるのでとりあえずページ遷移で
					//this.channel = channel;
					//this.src = 'channel';
					//this.saveSrc();
					this.$router.push(`/channels/${channel.id}`);
					this.queueReset();
					this.top();
				}
			}));
			os.modalMenu(items, ev.currentTarget || ev.target);
		},

		saveSrc() {
			this.$store.set('tl', {
				src: this.src,
				arg:
					this.src === 'list' ? this.list :
					this.src === 'antenna' ? this.antenna :
					this.channel
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
	> .new,
		.new-friendly {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;

			> i {
				margin-right: 5px;
			}
		}
	}

	> .new-friendly {
		--stickyTop: 100px;
	}

	&.isMobile {
		> .tabs-friendly {
			> .left, > .right {
				> .tab {
					padding: 0 10px;
				}
			}
		}
	}

	> .tabs,
		.tabs-friendly,
		.tabs-friendly-mobile {
		display: flex;
		box-sizing: border-box;
		padding: 0 8px;
		white-space: nowrap;
		overflow: auto;

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
						width: calc(100% - 16px);
						height: 4px;
						background: var(--accent);
						border-radius: 8px 8px 0 0;
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

	> .tabs-friendly,
		.tabs-friendly-mobile {
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

	> .tabs-friendly-mobile {
		margin: 8px;
	}
}
</style>
