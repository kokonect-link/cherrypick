<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer ref="container" class="_pageScrollable">
	<template #header>
		<NotificationPageHeader v-if="notification" v-model:tab="tab" :actions="actions" :tabs="tabs" :displayMyAvatar="displayMyAvatar" :title="i18n.ts.notifications" :icon="'ti ti-bell'"/>
		<CPPageHeader v-else-if="isMobile && prefer.s.mobileHeaderChange && !popup" v-model:tab="tab" :actions="actions" :tabs="tabs" :displayMyAvatar="displayMyAvatar" :disableFollowButton="(user && (user.isBlocked || user.isBlocking)) == true"/>
		<MkPageHeader v-else-if="!popup" v-model:tab="tab" :actions="actions" :tabs="tabs" :displayMyAvatar="displayMyAvatar" :disableFollowButton="(user && (user.isBlocked || user.isBlocking)) == true"/>
	</template>
	<slot></slot>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import * as Misskey from 'cherrypick-js';
import type { PageHeaderItem } from '@/types/page-header.js';
import type { Tab } from './MkPageHeader.tabs.vue';
import { prefer } from '@/preferences.js';
import { deviceKind } from '@/utility/device-kind.js';
import { globalEvents } from '@/events.js';
import { i18n } from '@/i18n.js';
import NotificationPageHeader from '@/components/global/NotificationPageHeader.vue';

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const showEl = ref(false);
const showEl2 = ref(false);
const lastScrollPosition = ref(0);

const props = withDefaults(defineProps<{
	tabs?: Tab[];
	actions?: PageHeaderItem[] | null;
	thin?: boolean;
	hideTitle?: boolean;
	displayMyAvatar?: boolean;
	user?: Misskey.entities.UserDetailed | null;
	popup?: boolean;
	notification?: boolean;
}>(), {
	tabs: () => ([] as Tab[]),
});

const tab = defineModel<string>('tab');

const container = useTemplateRef('container');

onMounted(() => {
	container.value.rootEl.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
	container.value.rootEl.removeEventListener('scroll', onScroll);
});

function onScroll() {
	const currentScrollPosition = container.value.rootEl.scrollTop;
	if (currentScrollPosition < 0) {
		return;
	}

	// Stop executing this function if the difference between
	// current scroll position and last scroll position is less than some offset
	if (Math.abs(currentScrollPosition - lastScrollPosition.value) < 60) {
		return;
	}

	showEl.value = currentScrollPosition < lastScrollPosition.value;
	lastScrollPosition.value = currentScrollPosition;
	showEl.value = !showEl.value;
	globalEvents.emit('showEl', showEl.value);

	if (isMobile.value) {
		if (showEl2.value) {
			showEl2.value = showEl.value;
		} else {
			setTimeout(() => {
				showEl2.value = showEl.value;
			}, 50);
		}

		nextTick(() => {
			globalEvents.emit('showEl2', showEl2.value);
		});
	}
}
</script>

<style lang="scss" module>

</style>
