<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-model:tab="src" style="position: relative; z-index: 1001" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :displayMyAvatar="true"/>
	</template>
	<MkSpacer :contentMax="800">
		<div ref="rootEl" v-hotkey.global="keymap">
			<XTutorial v-if="$i && defaultStore.reactiveState.timelineTutorial.value != -1" class="_panel" style="margin-bottom: var(--margin);"/>
			<MkPostForm v-if="defaultStore.reactiveState.showFixedPostForm.value" :class="$style.postForm" class="post-form _panel" fixed style="margin-bottom: var(--margin);"/>

			<transition
				:enterActiveClass="defaultStore.state.animation ? $style.transition_new_enterActive : ''"
				:leaveActiveClass="defaultStore.state.animation ? $style.transition_new_leaveActive : ''"
				:enterFromClass="defaultStore.state.animation ? $style.transition_new_enterFrom : ''"
				:leaveToClass="defaultStore.state.animation ? $style.transition_new_leaveTo : ''"
			>
				<div v-if="queue > 0 && defaultStore.state.newNoteRecivedNotificationBehavior === 'default'" :class="[$style.new, { [$style.showEl]: showEl && isMobile, [$style.reduceAnimation]: !defaultStore.state.animation }]"><button class="_buttonPrimary" :class="$style.newButton" @click="top()"><i class="ti ti-arrow-up"></i>{{ i18n.ts.newNoteRecived }}</button></div>
			</transition>
			<transition
				:enterActiveClass="defaultStore.state.animation ? $style.transition_new_enterActive : ''"
				:leaveActiveClass="defaultStore.state.animation ? $style.transition_new_leaveActive : ''"
				:enterFromClass="defaultStore.state.animation ? $style.transition_new_enterFrom : ''"
				:leaveToClass="defaultStore.state.animation ? $style.transition_new_leaveTo : ''"
			>
				<div v-if="queue > 0 && defaultStore.state.newNoteRecivedNotificationBehavior === 'count'" :class="[$style.new, { [$style.showEl]: showEl && isMobile, [$style.reduceAnimation]: !defaultStore.state.animation }]"><button class="_buttonPrimary" :class="$style.newButton" @click="top()"><i class="ti ti-arrow-up"></i><I18n :src="i18n.ts.newNoteRecivedCount" textTag="span"><template #n>{{ queue }}</template></I18n></button></div>
			</transition>
			<div :class="$style.tl">
				<MkTimeline
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
import { defineAsyncComponent, computed, watch, ref, provide, onMounted } from 'vue';
import type { Tab } from '@/components/global/MkPageHeader.tabs.vue';
import MkTimeline from '@/components/MkTimeline.vue';
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

let showEl = $ref(false);
const isFriendly = ref(miLocalStorage.getItem('ui') === 'friendly');

if (!isFriendly.value) provide('shouldOmitHeaderTitle', true);

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const XTutorial = defineAsyncComponent(() => import('./timeline.tutorial.vue'));

const isLocalTimelineAvailable = ($i == null && instance.policies.ltlAvailable) || ($i != null && $i.policies.ltlAvailable);
const isGlobalTimelineAvailable = ($i == null && instance.policies.gtlAvailable) || ($i != null && $i.policies.gtlAvailable);
const keymap = {
	't': focus,
};

const tlComponent = $shallowRef<InstanceType<typeof MkTimeline>>();
const rootEl = $shallowRef<HTMLElement>();

let queue = $ref(0);
let srcWhenNotSignin = $ref(isLocalTimelineAvailable ? 'local' : 'global');
const src = $computed({ get: () => ($i ? defaultStore.reactiveState.tl.value.src : srcWhenNotSignin), set: (x) => saveSrc(x) });

watch ($$(src), () => queue = 0);

onMounted(() => {
	eventBus.on('showEl', (showEl_receive) => {
		showEl = showEl_receive;
	});
});

function queueUpdated(q: number): void {
	queue = q;
	eventBus.emit('queueUpdated', q);
}

function top(): void {
	if (rootEl) scroll(rootEl, { top: 0 });
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
	const channels = await os.api('channels/my-favorites', {
		limit: 100,
	});
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
}, ...(isLocalTimelineAvailable ? [{
	key: 'local',
	title: i18n.ts._timelines.local,
	icon: 'ti ti-planet',
	iconOnly: true,
}, {
	key: 'social',
	title: i18n.ts._timelines.social,
	icon: 'ti ti-rocket',
	iconOnly: true,
}] : []), ...(isGlobalTimelineAvailable ? [{
	key: 'global',
	title: i18n.ts._timelines.global,
	icon: 'ti ti-whirl',
	iconOnly: true,
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
}] as Tab[]);

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
] as Tab[]);

definePageMetadata(computed(() => ({
	title: i18n.ts.timeline,
	icon: src === 'local' ? 'ti ti-planet' : src === 'social' ? 'ti ti-rocket' : src === 'global' ? 'ti ti-whirl' : 'ti ti-home',
})));
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
	top: calc(var(--stickyTop, 0px) + 8px);
	z-index: 1000;
	width: 100%;
	margin: calc(-0.675em - 8px) 0;
	transition: opacity 0.5s, transform 0.5s;

	&:first-child {
		margin-top: calc(-0.675em - 8px - var(--margin));
	}

	&.showEl {
		transform: translateY(calc(var(--stickyTop, 0px) - 181px))
	}

	&.reduceAnimation {
		transition: opacity 0s, transform 0s;
	}
}

.newButton {
	display: block;
	margin: var(--margin) auto 0 auto;
	padding: 8px 16px;
	border-radius: 32px;

	> i {
		margin-right: 5px;
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
