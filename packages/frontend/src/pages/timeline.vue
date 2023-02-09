<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-model:tab="src" style="position: relative; z-index: 1001" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :display-my-avatar="true"/>
		<transition
			:enter-active-class="$store.state.animation ? $style.transition_new_enterActive : ''"
			:leave-active-class="$store.state.animation ? $style.transition_new_leaveActive : ''"
			:enter-from-class="$store.state.animation ? $style.transition_new_enterFrom : ''"
			:leave-to-class="$store.state.animation ? $style.transition_new_leaveTo : ''"
		>
			<div v-if="queue > 0 && $store.state.newNoteRecivedNotificationBehavior === 'default'" :class="[$style.new, {[$style.reduceAnimation]: !$store.state.animation, [$style.showEl]: showEl && isFriendly && isMobile }]"><button class="_buttonPrimary" @click="top()"><i class="ti ti-arrow-up"></i>{{ i18n.ts.newNoteRecived }}</button></div>
		</transition>
		<transition
			:enter-active-class="$store.state.animation ? $style.transition_new_enterActive : ''"
			:leave-active-class="$store.state.animation ? $style.transition_new_leaveActive : ''"
			:enter-from-class="$store.state.animation ? $style.transition_new_enterFrom : ''"
			:leave-to-class="$store.state.animation ? $style.transition_new_leaveTo : ''"
		>
			<div v-if="queue > 0 && $store.state.newNoteRecivedNotificationBehavior === 'count'" :class="[$style.new, {[$style.reduceAnimation]: !$store.state.animation, [$style.showEl]: showEl && isFriendly && isMobile }]"><button class="_buttonPrimary" @click="top()"><i class="ti ti-arrow-up"></i><I18n :src="i18n.ts.newNoteRecivedCount" text-tag="span"><template #n>{{ queue }}</template></I18n></button></div>
		</transition>
	</template>
	<MkSpacer :content-max="800">
		<div ref="rootEl" v-hotkey.global="keymap">
			<XTutorial v-if="$i && $store.reactiveState.tutorial.value != -1" class="_panel" style="margin-bottom: var(--margin);"/>
			<MkPostForm v-if="$store.reactiveState.showFixedPostForm.value" :class="$style.postForm" class="post-form _panel" fixed style="margin-bottom: var(--margin);"/>
			<div :class="$style.tl">
				<XTimeline
					ref="tlComponent"
					:key="src"
					:src="src"
					:sound="true"
					@queue="queueUpdated"
				/>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed, watch, ref, onMounted, onBeforeUnmount } from 'vue';
import XTimeline from '@/components/MkTimeline.vue';
import MkPostForm from '@/components/MkPostForm.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { $i } from '@/account';
import { definePageMetadata } from '@/scripts/page-metadata';
import { eventBus } from '@/scripts/cherrypick/eventBus';
import { miLocalStorage } from '@/local-storage';
import { deviceKind } from '@/scripts/device-kind';

const isFriendly = ref(miLocalStorage.getItem('ui') === 'friendly');

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

let showEl = $ref(false);
let lastScrollPosition = $ref(0);

const XTutorial = defineAsyncComponent(() => import('./timeline.tutorial.vue'));

const isLocalTimelineAvailable = ($i == null && instance.policies.ltlAvailable) || ($i != null && $i.policies.ltlAvailable);
const isGlobalTimelineAvailable = ($i == null && instance.policies.gtlAvailable) || ($i != null && $i.policies.gtlAvailable);
const keymap = {
	't': focus,
};

const tlComponent = $shallowRef<InstanceType<typeof XTimeline>>();
const rootEl = $shallowRef<HTMLElement>();

let queue = $ref(0);
let srcWhenNotSignin = $ref(isLocalTimelineAvailable ? 'local' : 'global');
const src = $computed({ get: () => ($i ? defaultStore.reactiveState.tl.value.src : srcWhenNotSignin), set: (x) => saveSrc(x) });

watch ($$(src), () => queue = 0);

function queueUpdated(q: number): void {
	queue = q;
	eventBus.emit('queueUpdated', q);
}

function top(): void {
	scroll(rootEl, { top: 0 });
}

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
}

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await os.api('users/lists/list');
	const items = lists.map(list => ({
		type: 'link' as const,
		text: list.name,
		to: `/timeline/list/${list.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
	const antennas = await os.api('antennas/list');
	const items = antennas.map(antenna => ({
		type: 'link' as const,
		text: antenna.name,
		indicate: antenna.hasUnreadNote,
		to: `/timeline/antenna/${antenna.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseChannel(ev: MouseEvent): Promise<void> {
	const channels = await os.api('channels/followed');
	const items = channels.map(channel => ({
		type: 'link' as const,
		text: channel.name,
		indicate: channel.hasUnreadNote,
		to: `/channels/${channel.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: 'home' | 'local' | 'social' | 'global'): void {
	defaultStore.set('tl', {
		...defaultStore.state.tl,
		src: newSrc,
	});
	srcWhenNotSignin = newSrc;
}

async function timetravel(): Promise<void> {
	const { canceled, result: date } = await os.inputDate({
		title: i18n.ts.date,
	});
	if (canceled) return;

	tlComponent.timetravel(date);
}

function focus(): void {
	tlComponent.focus();
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'home',
	title: i18n.ts._timelines.home,
	icon: 'ti ti-home',
	iconOnly: true,
	onClick: top,
}, ...(isLocalTimelineAvailable ? [{
	key: 'local',
	title: i18n.ts._timelines.local,
	icon: 'ti ti-planet',
	iconOnly: true,
	onClick: top,
}, {
	key: 'social',
	title: i18n.ts._timelines.social,
	icon: 'ti ti-rocket',
	iconOnly: true,
	onClick: top,
}] : []), ...(isGlobalTimelineAvailable ? [{
	key: 'global',
	title: i18n.ts._timelines.global,
	icon: 'ti ti-whirl',
	iconOnly: true,
	onClick: top,
}] : []), {
	icon: 'ti ti-list',
	title: i18n.ts.lists,
	iconOnly: true,
	onClick: chooseList,
}, {
	icon: 'ti ti-antenna',
	title: i18n.ts.antennas,
	iconOnly: true,
	onClick: chooseAntenna,
}, {
	icon: 'ti ti-device-tv',
	title: i18n.ts.channel,
	iconOnly: true,
	onClick: chooseChannel,
}]);

const headerTabsWhenNotLogin = $computed(() => [
	...(isLocalTimelineAvailable ? [{
		key: 'local',
		title: i18n.ts._timelines.local,
		icon: 'ti ti-planet',
		iconOnly: true,
	}] : []),
	...(isGlobalTimelineAvailable ? [{
		key: 'global',
		title: i18n.ts._timelines.global,
		icon: 'ti ti-whirl',
		iconOnly: true,
	}] : []),
]);

definePageMetadata(computed(() => ({
	title: i18n.ts.timeline,
	icon: src === 'local' ? 'ti ti-planet' : src === 'social' ? 'ti ti-rocket' : src === 'global' ? 'ti ti-whirl' : 'ti ti-home',
})));

onMounted(() => {
	window.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', onScroll);
});
</script>

<style lang="scss" module>
.transition_new_enterActive,
.transition_new_leaveActive {
	transition: opacity 0.5s, transform 0.2s;
	transform: translateY(-64px);
}
.transition_new_enterFrom,
.transition_new_leaveTo {
}

.new {
	position: sticky;
	top: 64px;
	z-index: 1000;
	width: 100%;
	transition: opacity 0.5s, transform 0.5s;

	&.reduceAnimation {
		transition: opacity 0s, transform 0s;
	}

	&.showEl {
		transform: translateY(-50px);
	}

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

.postForm {
	border-radius: var(--radius);
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}
</style>
