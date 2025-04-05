<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="rootEl" :class="[$style.root, reversed ? '_pageScrollableReversed' : '_pageScrollable']">
	<MkStickyContainer>
		<template #header>
			<NotificationPageHeader v-if="notification" v-model:tab="tab" :actions="actions" :tabs="tabs" :displayMyAvatar="displayMyAvatar" :title="i18n.ts.notifications" :icon="'ti ti-bell'"/>
			<CPPageHeader v-else-if="isMobile && prefer.s.mobileHeaderChange && !popup" v-model:tab="tab" :actions="actions" :tabs="tabs" :displayMyAvatar="displayMyAvatar" :disableFollowButton="(user && (user.isBlocked || user.isBlocking)) == true"/>
			<MkPageHeader v-else-if="!popup" v-model:tab="tab" :actions="actions" :tabs="tabs" :displayMyAvatar="displayMyAvatar" :disableFollowButton="(user && (user.isBlocked || user.isBlocking)) == true"/>
		</template>
		<div :class="$style.body">
			<slot></slot>
		</div>
		<template #footer><slot name="footer"></slot></template>
	</MkStickyContainer>
</div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';
import * as Misskey from 'cherrypick-js';
import { scrollInContainer } from '@@/js/scroll.js';
import type { PageHeaderItem } from '@/types/page-header.js';
import type { Tab } from './MkPageHeader.tabs.vue';
import { prefer } from '@/preferences.js';
import { deviceKind } from '@/utility/device-kind.js';
import { i18n } from '@/i18n.js';
import { detectScrolling } from '@/utility/detect-scrolling.js';
import NotificationPageHeader from '@/components/global/NotificationPageHeader.vue';

const MOBILE_THRESHOLD = 500;

const isMobile = ref(['smartphone', 'tablet'].includes(String(deviceKind)) || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const props = withDefaults(defineProps<{
	tabs?: Tab[];
	actions?: PageHeaderItem[] | null;
	thin?: boolean;
	hideTitle?: boolean;
	displayMyAvatar?: boolean;
	reversed?: boolean;
	user?: Misskey.entities.UserDetailed | null;
	popup?: boolean;
	notification?: boolean;
}>(), {
	tabs: () => ([] as Tab[]),
});

const tab = defineModel<string>('tab');
const rootEl = useTemplateRef('rootEl');

detectScrolling(rootEl);

defineExpose({
	scrollToTop: () => {
		if (rootEl.value) scrollInContainer(rootEl.value, { top: 0, behavior: 'smooth' });
	},
});
</script>

<style lang="scss" module>
.root {

}

.body {
	min-height: calc(100cqh - (var(--MI-stickyTop, 0px) + var(--MI-stickyBottom, 0px)));
}
</style>
