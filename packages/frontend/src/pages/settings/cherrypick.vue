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
					<template #label>{{ i18n.ts._cherrypick.useEnterToSend }}</template>
					<template #caption>{{ i18n.ts._cherrypick.useEnterToSendDescription }}</template>
				</MkSwitch>
				<MkSwitch v-model="postFormVisibilityHotkey">
					<template #label>{{ i18n.ts._cherrypick.postFormVisibilityHotkey }}</template>
					<template #caption>{{ i18n.ts._cherrypick.postFormVisibilityHotkeyDescription }}</template>
				</MkSwitch>
				<MkSwitch v-model="showRenoteConfirmPopup">
					<template #label>{{ i18n.ts._cherrypick.showRenoteConfirmPopup }}</template>
					<template #caption>{{ i18n.ts._cherrypick.showRenoteConfirmPopupDescription }}</template>
				</MkSwitch>
				<MkSwitch v-model="expandOnNoteClick">
					<template #label>{{ i18n.ts._cherrypick.expandOnNoteClick }}</template>
					<template #caption>{{ i18n.ts._cherrypick.expandOnNoteClickDescription }}</template>
				</MkSwitch>
			</div>

			<div>
				<MkRadios v-model="displayHeaderNavBarWhenScroll">
					<template #label>{{ i18n.ts._cherrypick.displayHeaderNavBarWhenScroll }}</template>
					<option value="all">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.all }}</option>
					<option value="hideHeaderOnly">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideHeaderOnly }}</option>
					<option value="hideHeaderFloatBtn">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideHeaderFloatBtn }}</option>
					<option value="hideFloatBtnOnly">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideFloatBtnOnly }}</option>
					<option value="hideFloatBtnNavBar">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideFloatBtnNavBar }}</option>
					<option value="hide">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hide }}</option>
				</MkRadios>
			</div>
		</div>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts._cherrypick.patch }}</template>
		<div class="_gaps_m">
			<div>{{ i18n.ts._cherrypick.patchDescription }}</div>

			<MkSwitch v-model="reactableRemoteReactionEnabled">{{ i18n.ts._cherrypick.reactableRemoteReaction }}</MkSwitch>
			<MkSwitch v-model="showFollowingMessageInsteadOfButtonEnabled">{{ i18n.ts._cherrypick.showFollowingMessageInsteadOfButton }}</MkSwitch>
			<MkSwitch v-model="mobileHeaderChange">{{ i18n.ts._cherrypick.mobileHeaderChange }}</MkSwitch>
			<MkSwitch v-model="renameTheButtonInPostFormToNya">
				{{ i18n.ts._cherrypick.renameTheButtonInPostFormToNya }}
				<template #caption>{{ i18n.ts._cherrypick.renameTheButtonInPostFormToNyaDescription }}</template>
			</MkSwitch>
		</div>
	</FormSection>

	<FormSection>
		<template #label>Friendly UI</template>
		<div class="_gaps_m">
			<MkSwitch v-model="friendlyEnableNotifications">{{ i18n.ts.friendlyEnableNotifications }}</MkSwitch>
			<MkSwitch v-model="friendlyEnableWidgets">{{ i18n.ts.friendlyEnableWidgets }}</MkSwitch>
			<MkSwitch v-model="enableLongPressOpenAccountMenu">{{ i18n.ts._cherrypick.enableLongPressOpenAccountMenu }}</MkSwitch>
			<MkSwitch v-model="friendlyShowAvatarDecorationsInNavBtn">{{ i18n.ts._cherrypick.friendlyShowAvatarDecorationsInNavBtn }}</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkRadios from '@/components/MkRadios.vue';
import FormSection from '@/components/form/section.vue';
import { defaultStore } from '@/store.js';
import * as os from '@/os.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

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
const expandOnNoteClick = computed(defaultStore.makeGetterSetter('expandOnNoteClick'));
const displayHeaderNavBarWhenScroll = computed(defaultStore.makeGetterSetter('displayHeaderNavBarWhenScroll'));
const reactableRemoteReactionEnabled = computed(defaultStore.makeGetterSetter('reactableRemoteReactionEnabled'));
const showFollowingMessageInsteadOfButtonEnabled = computed(defaultStore.makeGetterSetter('showFollowingMessageInsteadOfButtonEnabled'));
const mobileHeaderChange = computed(defaultStore.makeGetterSetter('mobileHeaderChange'));
const renameTheButtonInPostFormToNya = computed(defaultStore.makeGetterSetter('renameTheButtonInPostFormToNya'));
const friendlyEnableNotifications = computed(defaultStore.makeGetterSetter('friendlyEnableNotifications'));
const friendlyEnableWidgets = computed(defaultStore.makeGetterSetter('friendlyEnableWidgets'));
const enableLongPressOpenAccountMenu = computed(defaultStore.makeGetterSetter('enableLongPressOpenAccountMenu'));
const friendlyShowAvatarDecorationsInNavBtn = computed(defaultStore.makeGetterSetter('friendlyShowAvatarDecorationsInNavBtn'));

watch([
	renameTheButtonInPostFormToNya,
], async () => {
	await defaultStore.set('renameTheButtonInPostFormToNyaManualSet', true);
});

watch([
	expandOnNoteClick,
	reactableRemoteReactionEnabled,
	mobileHeaderChange,
	renameTheButtonInPostFormToNya,
	friendlyEnableNotifications,
	friendlyEnableWidgets,
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
