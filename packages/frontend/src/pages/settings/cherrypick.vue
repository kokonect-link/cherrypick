<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection first>
		<template #label>{{ i18n.ts._cherrypick.function }}</template>
		<template #description>{{ i18n.ts._cherrypick.functionDescription }}</template>
		<div class="_gaps_m">
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
				<MkSelect v-if="expandOnNoteClick" v-model="expandOnNoteClickBehavior" style="margin-left: 44px;">
					<template #label>{{ i18n.ts._cherrypick.expandOnNoteClickBehavior }}</template>
					<option value="click">{{ i18n.ts._nsfwOpenBehavior.click }}</option>
					<option value="doubleClick">{{ i18n.ts._nsfwOpenBehavior.doubleClick }}</option>
				</MkSelect>
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
		<template #description>{{ i18n.ts._cherrypick.patchDescription }}</template>
		<div class="_gaps_m">
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
		<template #label>UI</template>
		<div class="_gaps_m">
			<MkSwitch v-model="enableWidgetsArea">{{ i18n.ts._cherrypick.enableWidgetsArea }}</MkSwitch>

			<div class="_gaps_s" style="margin: 0 10px;">
				<div style="font-weight: bold; padding: 0.5em 0 0 0; margin: 0 0 8px 0;">Friendly UI</div>

				<MkSwitch v-model="friendlyUiEnableNotificationsArea">
					{{ i18n.ts._cherrypick.friendlyUiEnableNotificationsArea }}
				</MkSwitch>
				<MkSwitch v-model="enableLongPressOpenAccountMenu">
					<template #label>{{ i18n.ts._cherrypick.enableLongPressOpenAccountMenu }}</template>
					<template #caption>{{ i18n.ts._cherrypick.enableLongPressOpenAccountMenuDescription }}</template>
				</MkSwitch>
				<MkSwitch v-model="friendlyUiShowAvatarDecorationsInNavBtn">{{ i18n.ts._cherrypick.friendlyUiShowAvatarDecorationsInNavBtn }}</MkSwitch>
			</div>
		</div>
	</FormSection>

	<FormSection>
		<template #label><i class="ti ti-flask"/> {{ i18n.ts.cherrypickLabs }}</template>
		<template #description>{{ i18n.ts.cherrypickLabsDescription }}</template>
		<div class="_gaps_m">
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkRadios from '@/components/MkRadios.vue';
import FormSection from '@/components/form/section.vue';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { reloadAsk } from '@/scripts/reload-ask.js';

const nicknameEnabled = computed(defaultStore.makeGetterSetter('nicknameEnabled'));
const useEnterToSend = computed(defaultStore.makeGetterSetter('useEnterToSend'));
const postFormVisibilityHotkey = computed(defaultStore.makeGetterSetter('postFormVisibilityHotkey'));
const showRenoteConfirmPopup = computed(defaultStore.makeGetterSetter('showRenoteConfirmPopup'));
const expandOnNoteClick = computed(defaultStore.makeGetterSetter('expandOnNoteClick'));
const expandOnNoteClickBehavior = computed(defaultStore.makeGetterSetter('expandOnNoteClickBehavior'));
const displayHeaderNavBarWhenScroll = computed(defaultStore.makeGetterSetter('displayHeaderNavBarWhenScroll'));
const reactableRemoteReactionEnabled = computed(defaultStore.makeGetterSetter('reactableRemoteReactionEnabled'));
const showFollowingMessageInsteadOfButtonEnabled = computed(defaultStore.makeGetterSetter('showFollowingMessageInsteadOfButtonEnabled'));
const mobileHeaderChange = computed(defaultStore.makeGetterSetter('mobileHeaderChange'));
const renameTheButtonInPostFormToNya = computed(defaultStore.makeGetterSetter('renameTheButtonInPostFormToNya'));
const enableWidgetsArea = computed(defaultStore.makeGetterSetter('enableWidgetsArea'));
const friendlyUiEnableNotificationsArea = computed(defaultStore.makeGetterSetter('friendlyUiEnableNotificationsArea'));
const enableLongPressOpenAccountMenu = computed(defaultStore.makeGetterSetter('enableLongPressOpenAccountMenu'));
const friendlyUiShowAvatarDecorationsInNavBtn = computed(defaultStore.makeGetterSetter('friendlyUiShowAvatarDecorationsInNavBtn'));

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
	enableWidgetsArea,
	friendlyUiEnableNotificationsArea,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: 'CherryPick',
	icon: 'ti ti-bulb-filled',
}));
</script>
