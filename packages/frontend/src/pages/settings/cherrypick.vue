<!--
SPDX-FileCopyrightText: syuilo and noridev and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection first>
		<template #label>{{ i18n.ts._cherrypick.function }}</template>
		<div class="_gaps_m">
			<div>{{ i18n.ts._cherrypick.functionDescription }}</div>

			<MkSwitch v-model="nicknameEnabled">
				{{ i18n.ts._cherrypick.nickname }}
				<template #caption>{{ i18n.ts._cherrypick.nicknameDescription }}</template>
			</MkSwitch>

			<div class="_gaps_s">
				<MkSwitch v-model="useEnterToSend">
					<template #label>{{ i18n.ts.useEnterToSend }}</template>
					<template #caption>{{ i18n.ts.useEnterToSendDescription }}</template>
				</MkSwitch>
				<MkSwitch v-model="postFormVisibilityHotkey">
					<template #label>{{ i18n.ts.postFormVisibilityHotkey }}</template>
					<template #caption>{{ i18n.ts.postFormVisibilityHotkeyDescription }}</template>
				</MkSwitch>
				<MkSwitch v-model="showRenoteConfirmPopup">
					<template #label>{{ i18n.ts.showRenoteConfirmPopup }}</template>
				</MkSwitch>
			</div>

      <div>
        <MkRadios v-model="displayHeaderNavBarWhenScroll">
          <template #label>{{ i18n.ts.displayHeaderNavBarWhenScroll }}</template>
          <option value="all">{{ i18n.ts._displayHeaderNavBarWhenScroll.all }}</option>
          <option value="hideHeaderOnly">{{ i18n.ts._displayHeaderNavBarWhenScroll.hideHeaderOnly }}</option>
          <option value="hideHeaderFloatBtn">{{ i18n.ts._displayHeaderNavBarWhenScroll.hideHeaderFloatBtn }}</option>
          <option value="hideFloatBtnOnly">{{ i18n.ts._displayHeaderNavBarWhenScroll.hideFloatBtnOnly }}</option>
          <option value="hideFloatBtnNavBar">{{ i18n.ts._displayHeaderNavBarWhenScroll.hideFloatBtnNavBar }}</option>
          <option value="hide">{{ i18n.ts._displayHeaderNavBarWhenScroll.hide }}</option>
        </MkRadios>
      </div>
		</div>
	</FormSection>
	<FormSection>
		<template #label>{{ i18n.ts._cherrypick.patch }}</template>
		<div class="_gaps_m">
			<div>{{ i18n.ts._cherrypick.patchDescription }}</div>

			<MkSwitch v-model="infoButtonForNoteActionsEnabled">
				{{ i18n.ts._cherrypick.infoButtonForNoteActions }}
				<template #caption>{{ i18n.ts._cherrypick.infoButtonForNoteActionsDescription }}</template>
			</MkSwitch>
			<MkSwitch v-model="reactableRemoteReactionEnabled">{{ i18n.ts._cherrypick.reactableRemoteReaction }}</MkSwitch>
			<MkSwitch v-model="showFollowingMessageInsteadOfButtonEnabled">{{ i18n.ts._cherrypick.showFollowingMessageInsteadOfButton }}</MkSwitch>
			<MkSwitch v-model="mobileTimelineHeaderChange">{{ i18n.ts._cherrypick.mobileTimelineHeaderChange }}</MkSwitch>
      <MkSwitch v-model="renameTheButtonInPostFormToNya">
        {{ i18n.ts._cherrypick.renameTheButtonInPostFormToNya }}
        <template #caption>{{ i18n.ts._cherrypick.renameTheButtonInPostFormToNyaDescription }}</template>
      </MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkRadios from '@/components/MkRadios.vue';
import FormSection from '@/components/form/section.vue';
import { defaultStore } from '@/store';
import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

const nicknameEnabled = computed(defaultStore.makeGetterSetter('nicknameEnabled'));
const useEnterToSend = computed(defaultStore.makeGetterSetter('useEnterToSend'));
const postFormVisibilityHotkey = computed(defaultStore.makeGetterSetter('postFormVisibilityHotkey'));
const showRenoteConfirmPopup = computed(defaultStore.makeGetterSetter('showRenoteConfirmPopup'));
const infoButtonForNoteActionsEnabled = computed(defaultStore.makeGetterSetter('infoButtonForNoteActionsEnabled'));
const reactableRemoteReactionEnabled = computed(defaultStore.makeGetterSetter('reactableRemoteReactionEnabled'));
const showFollowingMessageInsteadOfButtonEnabled = computed(defaultStore.makeGetterSetter('showFollowingMessageInsteadOfButtonEnabled'));
const mobileTimelineHeaderChange = computed(defaultStore.makeGetterSetter('mobileTimelineHeaderChange'));
const displayHeaderNavBarWhenScroll = computed(defaultStore.makeGetterSetter('displayHeaderNavBarWhenScroll'));
const renameTheButtonInPostFormToNya = computed(defaultStore.makeGetterSetter('renameTheButtonInPostFormToNya'));

watch([
	infoButtonForNoteActionsEnabled,
	reactableRemoteReactionEnabled,
], async () => {
	await reloadAsk();
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: 'CherryPick',
	icon: 'ti ti-bulb-filled',
});
</script>
