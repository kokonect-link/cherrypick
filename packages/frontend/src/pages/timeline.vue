<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header>
		<CPPageHeader v-if="isMobile && defaultStore.state.mobileHeaderChange" v-model:tab="src" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :displayMyAvatar="true"/>
		<MkPageHeader v-else v-model:tab="src" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :displayMyAvatar="true"/>
	</template>
	<MkSpacer :contentMax="800">
		<div ref="rootEl" v-hotkey.global="keymap">
			<MkInfo v-if="['home', 'local', 'social', 'global'].includes(src) && !defaultStore.reactiveState.timelineTutorials.value[src]" style="margin-bottom: var(--margin);" closable @close="closeTutorial()">
				{{ i18n.ts._timelineDescription[src] }}
			</MkInfo>
			<MkPostForm v-if="defaultStore.reactiveState.showFixedPostForm.value" :class="$style.postForm" class="post-form _panel" fixed style="margin-bottom: var(--margin);" :autofocus="false"/>

			<transition
				:enterActiveClass="defaultStore.state.animation ? $style.transition_new_enterActive : ''"
				:leaveActiveClass="defaultStore.state.animation ? $style.transition_new_leaveActive : ''"
				:enterFromClass="defaultStore.state.animation ? $style.transition_new_enterFrom : ''"
				:leaveToClass="defaultStore.state.animation ? $style.transition_new_leaveTo : ''"
			>
				<div
					v-if="queue > 0 && defaultStore.state.newNoteReceivedNotificationBehavior === 'default'"
					:class="[$style.new, { [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && !isFriendly, [$style.showElTab]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && isFriendly, [$style.reduceAnimation]: !defaultStore.state.animation }]"
				>
					<button class="_buttonPrimary" :class="$style.newButton" @click="top()">
						<i class="ti ti-arrow-up"></i>
						{{ i18n.ts.newNoteRecived }}
					</button>
				</div>
			</transition>
			<transition
				:enterActiveClass="defaultStore.state.animation ? $style.transition_new_enterActive : ''"
				:leaveActiveClass="defaultStore.state.animation ? $style.transition_new_leaveActive : ''"
				:enterFromClass="defaultStore.state.animation ? $style.transition_new_enterFrom : ''"
				:leaveToClass="defaultStore.state.animation ? $style.transition_new_leaveTo : ''"
			>
				<div
					v-if="queue > 0 && defaultStore.state.newNoteReceivedNotificationBehavior === 'count'"
					:class="[$style.new, { [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && !isFriendly, [$style.showElTab]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && isMobile && isFriendly, [$style.reduceAnimation]: !defaultStore.state.animation }]"
				>
					<button class="_buttonPrimary" :class="$style.newButton" @click="top()">
						<i class="ti ti-arrow-up"></i>
						<I18n :src="i18n.ts.newNoteRecivedCount" textTag="span">
							<template #n>{{ queue > 19 ? queue + '+' : queue }}</template>
						</I18n>
					</button>
				</div>
			</transition>
			<div :class="$style.tl">
				<MkTimeline
					ref="tlComponent"
					:key="src + withRenotes + withReplies + onlyFiles + onlyCats"
					:src="src.split(':')[0]"
					:list="src.split(':')[1]"
					:withRenotes="withRenotes"
					:withReplies="withReplies"
					:onlyFiles="onlyFiles"
					:onlyCats="onlyCats"
					:sound="true"
					@queue="queueUpdated"
				/>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, ref, provide, onMounted } from 'vue';
import type { Tab } from '@/components/global/MkPageHeader.tabs.vue';
import MkTimeline from '@/components/MkTimeline.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkPostForm from '@/components/MkPostForm.vue';
import { scroll } from '@/scripts/scroll.js';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { $i } from '@/account.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { miLocalStorage } from '@/local-storage.js';
import { antennasCache, userListsCache } from '@/cache.js';
import { globalEvents } from '@/events.js';
import { deviceKind } from '@/scripts/device-kind.js';
import { unisonReload } from '@/scripts/unison-reload.js';

let showEl = $ref(false);
const isFriendly = ref(miLocalStorage.getItem('ui') === 'friendly');

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

if (!isFriendly.value) provide('shouldOmitHeaderTitle', true);

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
const withRenotes = $ref(true);
const withReplies = $ref($i ? defaultStore.state.tlWithReplies : false);
const onlyFiles = $ref(false);
const onlyCats = $ref(false);
const friendlyEnableNotifications = $ref(defaultStore.state.friendlyEnableNotifications);
const friendlyEnableWidgets = $ref(defaultStore.state.friendlyEnableWidgets);

watch($$(src), () => {
	queue = 0;
	queueUpdated(queue);
});

watch($$(withReplies), (x) => {
	if ($i) defaultStore.set('tlWithReplies', x);
});

watch($$(friendlyEnableNotifications), (x) => {
	defaultStore.set('friendlyEnableNotifications', x);
	reloadAsk();
});

watch($$(friendlyEnableWidgets), (x) => {
	defaultStore.set('friendlyEnableWidgets', x);
	reloadAsk();
});

onMounted(() => {
	globalEvents.on('showEl', (showEl_receive) => {
		showEl = showEl_receive;
	});
});

function queueUpdated(q: number): void {
	queue = q;
	globalEvents.emit('queueUpdated', q);
}

function top(): void {
	if (rootEl) scroll(rootEl, { top: 0 });
}

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await userListsCache.fetch();
	const items = lists.map(list => ({
		type: 'link' as const,
		text: list.name,
		to: `/timeline/list/${list.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
	const antennas = await antennasCache.fetch();
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

function saveSrc(newSrc: 'home' | 'local' | 'social' | 'global' | `list:${string}`): void {
	let userList = null;
	if (newSrc.startsWith('userList:')) {
		const id = newSrc.substring('userList:'.length);
		userList = defaultStore.reactiveState.pinnedUserLists.value.find(l => l.id === id);
	}
	defaultStore.set('tl', {
		src: newSrc,
		userList,
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

function closeTutorial(): void {
	if (!['home', 'local', 'social', 'global'].includes(src)) return;
	const before = defaultStore.state.timelineTutorials;
	before[src] = true;
	defaultStore.set('timelineTutorials', before);
}

async function reloadAsk() {
	if (defaultStore.state.requireRefreshBehavior === 'dialog') {
		const { canceled } = await os.confirm({
			type: 'info',
			text: i18n.ts.reloadToApplySetting,
		});
		if (canceled) return;

		unisonReload();
	} else globalEvents.emit('hasRequireRefresh', true);
}

const headerActions = $computed(() => {
	const tmp = [
		{
			icon: 'ti ti-dots',
			text: i18n.ts.options,
			handler: (ev) => {
				os.popupMenu([{
					type: 'switch',
					text: i18n.ts.friendlyEnableNotifications,
					ref: $$(friendlyEnableNotifications),
				}, {
					type: 'switch',
					text: i18n.ts.friendlyEnableWidgets,
					ref: $$(friendlyEnableWidgets),
				}, {
					type: 'switch',
					text: i18n.ts.showRenotes,
					ref: $$(withRenotes),
				}, src === 'local' || src === 'social' ? {
					type: 'switch',
					text: i18n.ts.showRepliesToOthersInTimeline,
					ref: $$(withReplies),
					disabled: $$(onlyFiles),
				} : undefined, {
					type: 'switch',
					text: i18n.ts.fileAttachedOnly,
					ref: $$(onlyFiles),
					disabled: src === 'local' || src === 'social' ? $$(withReplies) : false,
				}, {
					type: 'switch',
					text: i18n.ts.showCatOnly,
					ref: $$(onlyCats),
				}], ev.currentTarget ?? ev.target);
			},
		},
	];
	if (deviceKind === 'desktop') {
		tmp.unshift({
			icon: 'ti ti-refresh',
			text: i18n.ts.reload,
			handler: (ev: Event) => {
				tlComponent.reloadTimeline();
			},
		});
	}
	return tmp;
});

const headerTabs = $computed(() => [...(defaultStore.reactiveState.pinnedUserLists.value.map(l => ({
	key: 'list:' + l.id,
	title: l.name,
	icon: 'ti ti-star',
	iconOnly: true,
}))), ...(defaultStore.state.enableHomeTimeline ? [{
	key: 'home',
	title: i18n.ts._timelines.home,
	icon: 'ti ti-home',
	iconOnly: true,
}] : []), ...(isLocalTimelineAvailable && defaultStore.state.enableLocalTimeline ? [{
	key: 'local',
	title: i18n.ts._timelines.local,
	icon: 'ti ti-planet',
	iconOnly: true,
}, ...(defaultStore.state.enableSocialTimeline ? [{
	key: 'social',
	title: i18n.ts._timelines.social,
	icon: 'ti ti-universe',
	iconOnly: true,
}] : [])] : []), ...(isGlobalTimelineAvailable && defaultStore.state.enableGlobalTimeline ? [{
	key: 'global',
	title: i18n.ts._timelines.global,
	icon: 'ti ti-world',
	iconOnly: true,
}] : []), ...(defaultStore.state.enableListTimeline ? [{
	icon: 'ti ti-list',
	title: i18n.ts.lists,
	iconOnly: true,
	onClick: chooseList,
}] : []), ...(defaultStore.state.enableAntennaTimeline ? [{
	icon: 'ti ti-antenna',
	title: i18n.ts.antennas,
	iconOnly: true,
	onClick: chooseAntenna,
}] : []), ...(defaultStore.state.enableChannelTimeline ? [{
	icon: 'ti ti-device-tv',
	title: i18n.ts.channel,
	iconOnly: true,
	onClick: chooseChannel,
}] : [])] as Tab[]);

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
		icon: 'ti ti-world',
		iconOnly: true,
	}] : []),
] as Tab[]);

definePageMetadata(computed(() => ({
	title: i18n.ts.timeline,
	icon: src === 'local' ? 'ti ti-planet' : src === 'social' ? 'ti ti-universe' : src === 'global' ? 'ti ti-world' : 'ti ti-home',
})));
</script>

<style lang="scss" module>
.transition_new_enterActive,
.transition_new_leaveActive {
	transform: translateY(-64px);
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
		transform: translateY(calc(var(--stickyTop, 0px) - 101px))
	}

  &.showElTab {
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
