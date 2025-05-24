<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader ref="pageComponent" v-model:tab="src" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :swipable="true" :displayMyAvatar="true">
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<MkInfo v-if="isBasicTimeline(src) && !store.r.timelineTutorials.value[src]" style="margin-bottom: var(--MI-margin);" closable @close="closeTutorial()">
			{{ i18n.ts._timelineDescription[src] }}
		</MkInfo>
		<MkInfo v-if="schedulePostList > 0" style="margin-bottom: var(--MI-margin);">
			<button type="button" :class="$style.checkSchedulePostList" @click="os.listScheduleNotePost">
				{{ i18n.tsx.thereIsSchedulePost({ n: schedulePostList }) }}
			</button>
		</MkInfo>
		<MkPostForm v-if="prefer.r.showFixedPostForm.value" :class="$style.postForm" class="_panel" fixed style="margin-bottom: var(--MI-margin);"/>

		<transition
			:enterActiveClass="prefer.s.animation ? $style.transition_new_enterActive : ''"
			:leaveActiveClass="prefer.s.animation ? $style.transition_new_leaveActive : ''"
			:enterFromClass="prefer.s.animation ? $style.transition_new_enterFrom : ''"
			:leaveToClass="prefer.s.animation ? $style.transition_new_leaveTo : ''"
		>
			<div
				v-if="queue > 0 && ['default', 'count'].includes(prefer.s.newNoteReceivedNotificationBehavior)"
				:class="[$style.new, { [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) && isMobile && !isFriendly().value, [$style.showElTab]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) && isMobile && isFriendly().value, [$style.reduceAnimation]: !prefer.s.animation }]"
			>
				<button class="_buttonPrimary" :class="$style.newButton" @click="top()">
					<i class="ti ti-arrow-up"></i>
					<I18n :src="prefer.s.newNoteReceivedNotificationBehavior === 'count' ? i18n.ts.newNoteRecivedCount : prefer.s.newNoteReceivedNotificationBehavior === 'default' ? i18n.ts.newNoteRecived : null" textTag="span">
						<template v-if="prefer.s.newNoteReceivedNotificationBehavior === 'count'" #n>{{ queue > 19 ? queue + '+' : queue }}</template>
					</I18n>
				</button>
			</div>
		</transition>

		<div v-if="!isAvailableBasicTimeline(src) && !src.startsWith('list:')" :class="[$style.disabled, $style.tl]">
			<p :class="$style.disabledTitle">
				<i class="ti ti-circle-minus"></i>
				{{ i18n.ts._disabledTimeline.title }}
			</p>
			<p :class="$style.disabledDescription">{{ i18n.ts._disabledTimeline.description }}</p>
		</div>

		<MkTimeline
			v-else
			ref="tlComponent"
			:key="src + withRenotes + withReplies + onlyFiles + withSensitive"
			:class="$style.tl"
			:src="src.split(':')[0]"
			:list="src.split(':')[1]"
			:withRenotes="withRenotes"
			:withReplies="withReplies"
			:withSensitive="withSensitive"
			:onlyFiles="onlyFiles"
			:sound="true"
			@queue="queueUpdated"
		/>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, watch, provide, useTemplateRef, ref, onMounted, onActivated } from 'vue';
import type { Tab } from '@/components/global/MkPageHeader.tabs.vue';
import type { MenuItem } from '@/types/menu.js';
import type { BasicTimelineType } from '@/timelines.js';
import MkTimeline from '@/components/MkTimeline.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkPostForm from '@/components/MkPostForm.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { store } from '@/store.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import { definePage } from '@/page.js';
import { antennasCache, userListsCache, favoritedChannelsCache } from '@/cache.js';
import { deviceKind } from '@/utility/device-kind.js';
import { deepMerge } from '@/utility/merge.js';
import { miLocalStorage } from '@/local-storage.js';
import { availableBasicTimelines, hasWithReplies, isAvailableBasicTimeline, isBasicTimeline, basicTimelineIconClass } from '@/timelines.js';
import { prefer } from '@/preferences.js';
import { globalEvents } from '@/events.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import { isFriendly } from '@/utility/is-friendly.js';
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';

const { showEl } = scrollToVisibility();

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isDesktop = ref(window.innerWidth >= DESKTOP_THRESHOLD);
const isMobile = ref(['smartphone', 'tablet'].includes(String(deviceKind)) || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const schedulePostList = $i ? (await misskeyApi('notes/schedule/list')).length : 0;

if (!isFriendly().value) provide('shouldOmitHeaderTitle', true);

const tlComponent = useTemplateRef('tlComponent');
const pageComponent = useTemplateRef('pageComponent');

type TimelinePageSrc = BasicTimelineType | `list:${string}`;

const queue = ref(0);
const srcWhenNotSignin = ref<'local' | 'global'>(isAvailableBasicTimeline('local') ? 'local' : 'global');
const src = computed<TimelinePageSrc>({
	get: () => ($i ? store.r.tl.value.src : srcWhenNotSignin.value),
	set: (x) => saveSrc(x),
});
const withRenotes = computed<boolean>({
	get: () => store.r.tl.value.filter.withRenotes,
	set: (x) => saveTlFilter('withRenotes', x),
});

// computed内での無限ループを防ぐためのフラグ
const localSocialTLFilterSwitchStore = ref<'withReplies' | 'onlyFiles' | false>(
	store.r.tl.value.filter.withReplies ? 'withReplies' :
	store.r.tl.value.filter.onlyFiles ? 'onlyFiles' :
	false,
);

const withReplies = computed<boolean>({
	get: () => {
		if (!$i) return false;
		if (['local', 'social'].includes(src.value) && localSocialTLFilterSwitchStore.value === 'onlyFiles') {
			return false;
		} else {
			return store.r.tl.value.filter.withReplies;
		}
	},
	set: (x) => saveTlFilter('withReplies', x),
});
const onlyFiles = computed<boolean>({
	get: () => {
		if (['local', 'social'].includes(src.value) && localSocialTLFilterSwitchStore.value === 'withReplies') {
			return false;
		} else {
			return store.r.tl.value.filter.onlyFiles;
		}
	},
	set: (x) => saveTlFilter('onlyFiles', x),
});
const onlyCats = computed({
	get: () => store.r.tl.value.filter.onlyCats,
	set: (x: boolean) => saveTlFilter('onlyCats', x),
});

watch([withReplies, onlyFiles], ([withRepliesTo, onlyFilesTo]) => {
	if (withRepliesTo) {
		localSocialTLFilterSwitchStore.value = 'withReplies';
	} else if (onlyFilesTo) {
		localSocialTLFilterSwitchStore.value = 'onlyFiles';
	} else {
		localSocialTLFilterSwitchStore.value = false;
	}
});

const withSensitive = computed<boolean>({
	get: () => store.r.tl.value.filter.withSensitive,
	set: (x) => saveTlFilter('withSensitive', x),
});

const enableWidgetsArea = ref(prefer.s.enableWidgetsArea);
const friendlyUiEnableNotificationsArea = ref(prefer.s.friendlyUiEnableNotificationsArea);

const enableHomeTimeline = ref(prefer.s.enableHomeTimeline);
const enableLocalTimeline = ref(prefer.s.enableLocalTimeline);
const enableSocialTimeline = ref(prefer.s.enableSocialTimeline);
const enableGlobalTimeline = ref(prefer.s.enableGlobalTimeline);
const enableBubbleTimeline = ref(prefer.s.enableBubbleTimeline);
const enableListTimeline = ref(prefer.s.enableListTimeline);
const enableAntennaTimeline = ref(prefer.s.enableAntennaTimeline);
const enableChannelTimeline = ref(prefer.s.enableChannelTimeline);

const forceCollapseAllRenotes = ref(prefer.s.forceCollapseAllRenotes);
const collapseRenotes = ref(prefer.s.collapseRenotes);
const collapseReplies = ref(prefer.s.collapseReplies);
const collapseLongNoteContent = ref(prefer.s.collapseLongNoteContent);
const collapseDefault = ref(prefer.s.collapseDefault);
const alwaysShowCw = ref(prefer.s.alwaysShowCw);
const showReplyTargetNote = ref(prefer.s.showReplyTargetNote);

watch(src, () => {
	queue.value = 0;
	queueUpdated(queue.value);
});

watch(enableWidgetsArea, (x) => {
	prefer.commit('enableWidgetsArea', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(friendlyUiEnableNotificationsArea, (x) => {
	prefer.commit('friendlyUiEnableNotificationsArea', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableHomeTimeline, (x) => {
	prefer.commit('enableHomeTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableLocalTimeline, (x) => {
	prefer.commit('enableLocalTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableSocialTimeline, (x) => {
	prefer.commit('enableSocialTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableGlobalTimeline, (x) => {
	prefer.commit('enableGlobalTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableBubbleTimeline, (x) => {
	prefer.commit('enableBubbleTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableListTimeline, (x) => {
	prefer.commit('enableListTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableAntennaTimeline, (x) => {
	prefer.commit('enableAntennaTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(enableChannelTimeline, (x) => {
	prefer.commit('enableChannelTimeline', x);
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch(forceCollapseAllRenotes, (x) => {
	prefer.commit('forceCollapseAllRenotes', x);
	reloadTimeline();
});

watch(collapseRenotes, (x) => {
	prefer.commit('collapseRenotes', x);
	reloadTimeline();
});

watch(collapseReplies, (x) => {
	prefer.commit('collapseReplies', x);
	reloadTimeline();
});

watch(collapseLongNoteContent, (x) => {
	prefer.commit('collapseLongNoteContent', x);
	reloadTimeline();
	reloadNotification();
});

watch(collapseDefault, (x) => {
	prefer.commit('collapseDefault', x);
	reloadTimeline();
	reloadNotification();
});

watch(alwaysShowCw, (x) => {
	prefer.commit('alwaysShowCw', x);
	reloadTimeline();
	reloadNotification();
});

watch(showReplyTargetNote, (x) => {
	prefer.commit('showReplyTargetNote', x);
	reloadTimeline();
	reloadNotification();
});

function queueUpdated(q: number): void {
	queue.value = q;
	globalEvents.emit('queueUpdated', q);
}

function top(): void {
	if (pageComponent.value) pageComponent.value.scrollToTop();
}

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await userListsCache.fetch();
	const items: MenuItem[] = [
		...lists.map(list => ({
			type: 'link' as const,
			text: list.name,
			to: `/timeline/list/${list.id}`,
		})),
		(lists.length === 0 ? undefined : { type: 'divider' }),
		{
			type: 'link' as const,
			icon: 'ti ti-plus',
			text: i18n.ts.createNew,
			to: '/my/lists',
		},
	];
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
	const antennas = await antennasCache.fetch();
	const items: MenuItem[] = [
		...antennas.map(antenna => ({
			type: 'link' as const,
			text: antenna.name,
			indicate: antenna.hasUnreadNote,
			to: `/timeline/antenna/${antenna.id}`,
		})),
		(antennas.length === 0 ? undefined : { type: 'divider' }),
		{
			type: 'link' as const,
			icon: 'ti ti-plus',
			text: i18n.ts.createNew,
			to: '/my/antennas',
		},
	];
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseChannel(ev: MouseEvent): Promise<void> {
	const channels = await favoritedChannelsCache.fetch();
	const items: MenuItem[] = [
		...channels.map(channel => {
			const lastReadedAt = miLocalStorage.getItemAsJson(`channelLastReadedAt:${channel.id}`) ?? null;
			const hasUnreadNote = (lastReadedAt && channel.lastNotedAt) ? Date.parse(channel.lastNotedAt) > lastReadedAt : !!(!lastReadedAt && channel.lastNotedAt);

			return {
				type: 'link' as const,
				text: channel.name,
				indicate: hasUnreadNote,
				to: `/channels/${channel.id}`,
			};
		}),
		(channels.length === 0 ? undefined : { type: 'divider' }),
		{
			type: 'link',
			icon: 'ti ti-plus',
			text: i18n.ts.createNew,
			to: '/channels',
		},
	];
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: TimelinePageSrc): void {
	const out = deepMerge({ src: newSrc }, store.s.tl);

	if (prefer.s.enableListTimeline && newSrc.startsWith('userList:')) {
		const id = newSrc.substring('userList:'.length);
		out.userList = prefer.r.pinnedUserLists.value.find(l => l.id === id) ?? null;
	}

	store.set('tl', out);
	if (['local', 'global'].includes(newSrc)) {
		srcWhenNotSignin.value = newSrc as 'local' | 'global';
	}
}

function saveTlFilter(key: keyof typeof store.s.tl.filter, newValue: boolean) {
	if (key !== 'withReplies' || $i) {
		const out = deepMerge({ filter: { [key]: newValue } }, store.s.tl);
		store.set('tl', out);
	}
}

async function timetravel(): Promise<void> {
	const { canceled, result: date } = await os.inputDate({
		title: i18n.ts.date,
	});
	if (canceled) return;

	tlComponent.value.timetravel(date);
}

function focus(): void {
	tlComponent.value.focus();
}

function closeTutorial(): void {
	if (!isBasicTimeline(src.value)) return;
	const before = store.s.timelineTutorials;
	before[src.value] = true;
	store.set('timelineTutorials', before);
}

function switchTlIfNeeded() {
	if (isBasicTimeline(src.value) && !isAvailableBasicTimeline(src.value)) {
		src.value = availableBasicTimelines()[0];
	}
}

function reloadTimeline() {
	globalEvents.emit('reloadTimeline');
}

function reloadNotification() {
	globalEvents.emit('reloadNotification');
}

onMounted(() => {
	switchTlIfNeeded();
});
onActivated(() => {
	switchTlIfNeeded();
});

const headerActions = computed(() => {
	const tmp = [
		{
			icon: 'ti ti-dots',
			text: i18n.ts.options,
			handler: (ev) => {
				const menuItems: MenuItem[] = [];

				if (isFriendly().value) {
					menuItems.push({
						type: 'parent',
						icon: 'ti ti-settings',
						text: 'Friendly UI',
						children: async () => {
							const friendlyUiChildMenu = [] as MenuItem[];

							if (isDesktop.value) {
								friendlyUiChildMenu.push({
									type: 'switch',
									text: i18n.ts._cherrypick.friendlyUiEnableNotificationsArea,
									ref: friendlyUiEnableNotificationsArea,
								});
							}

							return friendlyUiChildMenu;
						},
					});
				}

				menuItems.push({
					type: 'switch',
					text: i18n.ts._cherrypick.enableWidgetsArea,
					ref: enableWidgetsArea,
				});

				menuItems.push({ type: 'divider' });

				menuItems.push({
					type: 'parent',
					icon: 'ti ti-align-left',
					text: i18n.ts.timeline,
					children: async () => {
						const displayOfTimelineChildMenu = [] as MenuItem[];

						displayOfTimelineChildMenu.push({
							type: 'switch',
							text: i18n.ts._timelines.home,
							icon: 'ti ti-home',
							ref: enableHomeTimeline,
						}, {
							type: 'switch',
							text: i18n.ts._timelines.local,
							icon: 'ti ti-planet',
							ref: enableLocalTimeline,
						}, {
							type: 'switch',
							text: i18n.ts._timelines.social,
							icon: 'ti ti-universe',
							ref: enableSocialTimeline,
						}, {
							type: 'switch',
							text: i18n.ts._timelines.global,
							icon: 'ti ti-world',
							ref: enableGlobalTimeline,
						}, {
							type: 'switch',
							text: i18n.ts._timelines.bubble,
							icon: 'ti ti-droplet',
							ref: enableBubbleTimeline,
						}, { type: 'divider' }, {
							type: 'switch',
							text: i18n.ts.lists,
							icon: 'ti ti-list',
							ref: enableListTimeline,
						}, {
							type: 'switch',
							text: i18n.ts.antennas,
							icon: 'ti ti-antenna',
							ref: enableAntennaTimeline,
						}, {
							type: 'switch',
							text: i18n.ts.channel,
							icon: 'ti ti-device-tv',
							ref: enableChannelTimeline,
						});

						return displayOfTimelineChildMenu;
					},
				});

				menuItems.push({
					type: 'parent',
					icon: 'ti ti-note',
					text: i18n.ts.displayOfNote,
					children: async () => {
						const displayOfNoteChildMenu = [] as MenuItem[];

						displayOfNoteChildMenu.push({
							type: 'switch',
							text: i18n.ts.showRenotes,
							ref: withRenotes,
						});

						if (isBasicTimeline(src.value) && hasWithReplies(src.value)) {
							displayOfNoteChildMenu.push({
								type: 'switch',
								text: i18n.ts.showRepliesToOthersInTimeline,
								ref: withReplies,
								disabled: onlyFiles,
							});
						}

						displayOfNoteChildMenu.push({
							type: 'switch',
							text: i18n.ts.withSensitive,
							ref: withSensitive,
						}, {
							type: 'switch',
							text: i18n.ts.fileAttachedOnly,
							ref: onlyFiles,
							disabled: isBasicTimeline(src.value) && hasWithReplies(src.value) ? withReplies : false,
						}, {
							type: 'switch',
							text: i18n.ts.showCatOnly,
							ref: onlyCats,
						}, { type: 'divider' }, {
							type: 'switch',
							text: i18n.ts.forceCollapseAllRenotes,
							ref: forceCollapseAllRenotes,
						}, {
							type: 'switch',
							text: i18n.ts.collapseRenotes,
							disabled: forceCollapseAllRenotes.value,
							ref: collapseRenotes,
						}, {
							type: 'switch',
							text: i18n.ts.collapseReplies,
							ref: collapseReplies,
						}, {
							type: 'switch',
							text: i18n.ts.collapseLongNoteContent,
							ref: collapseLongNoteContent,
						}, {
							type: 'switch',
							text: i18n.ts.collapseDefault,
							ref: collapseDefault,
						}, {
							type: 'switch',
							text: i18n.ts.alwaysShowCw,
							ref: alwaysShowCw,
						}, {
							type: 'switch',
							text: i18n.ts.showReplyTargetNote,
							ref: showReplyTargetNote,
						});

						return displayOfNoteChildMenu;
					},
				});

				os.popupMenu(menuItems, ev.currentTarget ?? ev.target);
			},
		},
	];
	if (deviceKind === 'desktop') {
		tmp.unshift({
			icon: 'ti ti-refresh',
			text: i18n.ts.reload,
			handler: (ev: Event) => {
				tlComponent.value?.reloadTimeline();
			},
		});
	}
	return tmp;
});

const headerTabs = computed(() => [...(prefer.r.pinnedUserLists.value.map(l => ({
	key: 'list:' + l.id,
	title: l.name,
	icon: 'ti ti-star',
	iconOnly: true,
}))), ...availableBasicTimelines().map(tl => ({
	key: tl,
	title: i18n.ts._timelines[tl],
	icon: basicTimelineIconClass(tl),
	iconOnly: true,
})), ...(prefer.s.enableListTimeline ? [{
	icon: 'ti ti-list',
	title: i18n.ts.lists,
	iconOnly: true,
	onClick: chooseList,
}] : []), ...(prefer.s.enableAntennaTimeline ? [{
	icon: 'ti ti-antenna',
	title: i18n.ts.antennas,
	iconOnly: true,
	onClick: chooseAntenna,
}] : []), ...(prefer.s.enableChannelTimeline ? [{
	icon: 'ti ti-device-tv',
	title: i18n.ts.channel,
	iconOnly: true,
	onClick: chooseChannel,
}] : [])] as Tab[]);

const headerTabsWhenNotLogin = computed(() => [...availableBasicTimelines().map(tl => ({
	key: tl,
	title: i18n.ts._timelines[tl],
	icon: basicTimelineIconClass(tl),
	iconOnly: true,
}))] as Tab[]);

definePage(() => ({
	title: i18n.ts.timeline,
	icon: isBasicTimeline(src.value) ? basicTimelineIconClass(src.value) : 'ti ti-home',
}));
</script>

<style lang="scss" module>
.transition_new_enterActive,
.transition_new_leaveActive {
	transform: translateY(-64px);
}

.new {
	position: sticky;
	top: calc(var(--MI-stickyTop, 0px) + 8px);
	z-index: 1000;
	width: 100%;
	margin: calc(-0.675em - 8px) 0;
	transition: opacity 0.5s, transform 0.5s;

	&:first-child {
		margin-top: calc(-0.675em - 8px - var(--MI-margin));
	}

	&.showEl {
		transform: translateY(calc(var(--MI-stickyTop, 0px) - 101px))
	}

  &.showElTab {
    transform: translateY(calc(var(--MI-stickyTop, 0px) - 181px))
  }

	&.reduceAnimation {
		transition: opacity 0s, transform 0s;
	}
}

.newButton {
	display: block;
	margin: var(--MI-margin) auto 0 auto;
	padding: 8px 16px;
	border-radius: 32px;

	> i {
		margin-right: 5px;
	}
}

.postForm {
	border-radius: var(--MI-radius);
}

.tl {
	background: var(--MI_THEME-bg);
	border-radius: var(--MI-radius);
	overflow: clip;
}

.checkSchedulePostList {
	background: none;
	border: none;
	color: inherit;

	&:hover {
		text-decoration: underline;
	}
}
</style>
