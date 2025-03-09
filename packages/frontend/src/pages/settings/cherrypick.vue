<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/cherrypick" label="CherryPick" :keywords="['cherrypick']" icon="ti ti-bulb-filled">
	<div class="_gaps_m">
		<FormSection first>
			<template #label>{{ i18n.ts._cherrypick.function }}</template>
			<template #description>{{ i18n.ts._cherrypick.functionDescription }}</template>
			<div class="_gaps_m">
				<SearchMarker :keywords="['nickname', 'enable']">
					<MkSwitch v-model="nicknameEnabled">
						<template #label><SearchLabel>{{ i18n.ts._cherrypick.nickname }}</SearchLabel></template>
						<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.nicknameDescription }}</SearchKeyword></template>
					</MkSwitch>
				</SearchMarker>

				<div class="_gaps_s">
					<SearchMarker :keywords="['nickname', 'enable']">
						<MkSwitch v-model="useEnterToSend">
							<template #label>{{ i18n.ts._cherrypick.useEnterToSend }}</template>
							<template #caption>{{ i18n.ts._cherrypick.useEnterToSendDescription }}</template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['post', 'postform', 'visibility', 'hotkey']">
						<MkSwitch v-model="postFormVisibilityHotkey">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.postFormVisibilityHotkey }}</SearchLabel></template>
							<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.postFormVisibilityHotkeyDescription }}</SearchKeyword></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'renote', 'note', 'confirm', 'popup']">
						<MkSwitch v-model="showRenoteConfirmPopup">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.showRenoteConfirmPopup }}</SearchLabel></template>
							<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.showRenoteConfirmPopupDescription }}</SearchKeyword></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['expand', 'note', 'click']">
						<MkSwitch v-model="expandOnNoteClick">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.expandOnNoteClick }}</SearchLabel></template>
							<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.expandOnNoteClickDescription }}</SearchKeyword></template>
						</MkSwitch>

						<MkDisableSection :disabled="!expandOnNoteClick">
							<SearchMarker :keywords="['behavior']">
								<MkSelect v-model="expandOnNoteClickBehavior" style="margin-left: 44px;">
									<template #label><SearchLabel>{{ i18n.ts._cherrypick.expandOnNoteClickBehavior }}</SearchLabel></template>
									<option value="click">{{ i18n.ts._nsfwOpenBehavior.click }}</option>
									<option value="doubleClick">{{ i18n.ts._nsfwOpenBehavior.doubleClick }}</option>
								</MkSelect>
							</SearchMarker>
						</MkDisableSection>
					</SearchMarker>
				</div>

				<SearchMarker :keywords="['display', 'header', 'navbar', 'scroll']">
					<div>
						<MkRadios v-model="displayHeaderNavBarWhenScroll">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.displayHeaderNavBarWhenScroll }}</SearchLabel></template>
							<option value="all">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.all }}</option>
							<option value="hideHeaderOnly">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideHeaderOnly }}</option>
							<option value="hideHeaderFloatBtn">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideHeaderFloatBtn }}</option>
							<option value="hideFloatBtnOnly">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideFloatBtnOnly }}</option>
							<option value="hideFloatBtnNavBar">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideFloatBtnNavBar }}</option>
							<option value="hide">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hide }}</option>
						</MkRadios>
					</div>
				</SearchMarker>
			</div>
		</FormSection>

		<SearchMarker :keywords="['patch', 'behavior']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts._cherrypick.patch }}</SearchLabel></template>
				<template #description><SearchKeyword>{{ i18n.ts._cherrypick.patchDescription }}</SearchKeyword></template>
				<div class="_gaps_m">
					<SearchMarker :keywords="['reactable', 'remote', 'reaction', 'react', 'enable']">
						<MkSwitch v-model="reactableRemoteReactionEnabled">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.reactableRemoteReaction }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'follow', 'message', 'enable']">
						<MkSwitch v-model="showFollowingMessageInsteadOfButtonEnabled">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.showFollowingMessageInsteadOfButton }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['mobile', 'header', 'change']">
						<MkSwitch v-model="mobileHeaderChange">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.mobileHeaderChange }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['rename', 'post', 'postform', 'nya']">
						<MkSwitch v-model="renameTheButtonInPostFormToNya">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.renameTheButtonInPostFormToNya }}</SearchLabel></template>
							<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.renameTheButtonInPostFormToNyaDescription }}</SearchKeyword></template>
						</MkSwitch>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['ui', 'show', 'display']">
			<FormSection>
				<template #label>UI</template>
				<div class="_gaps_m">
					<SearchMarker :keywords="['enable', 'widget']">
						<MkSwitch v-model="enableWidgetsArea">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.enableWidgetsArea }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['friendly']">
						<div class="_gaps_s" style="margin: 0 10px;">
							<div style="font-weight: bold; padding: 0.5em 0 0 0; margin: 0 0 8px 0;">Friendly UI</div>

							<SearchMarker :keywords="['enable', 'notification']">
								<MkSwitch v-model="friendlyUiEnableNotificationsArea">
									<template #label><SearchLabel>{{ i18n.ts._cherrypick.friendlyUiEnableNotificationsArea }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['enable', 'long', 'press', 'open', 'account', 'menu']">
								<MkSwitch v-model="enableLongPressOpenAccountMenu">
									<template #label><SearchLabel>{{ i18n.ts._cherrypick.enableLongPressOpenAccountMenu }}</SearchLabel></template>
									<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.enableLongPressOpenAccountMenuDescription }}</SearchKeyword></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['show', 'avatar', 'decoration', 'navbtn']">
								<MkSwitch v-model="friendlyUiShowAvatarDecorationsInNavBtn">
									<template #label><SearchLabel>{{ i18n.ts._cherrypick.friendlyUiShowAvatarDecorationsInNavBtn }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>
						</div>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['behavior', 'lab']">
			<FormSection>
				<template #label><i class="ti ti-flask"/> {{ i18n.ts.cherrypickLabs }}</template>
				<template #description>{{ i18n.ts.cherrypickLabsDescription }}</template>
				<div class="_gaps_m">
				</div>
			</FormSection>
		</SearchMarker>
	</div>
</SearchMarker>
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
import MkDisableSection from '@/components/MkDisableSection.vue';

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
