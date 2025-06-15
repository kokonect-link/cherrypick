<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/cherrypick" label="CherryPick" :keywords="['cherrypick']" icon="ti ti-bulb-filled">
	<div class="_gaps_m">
		<FormSection first>
			<template #label><SearchLabel>{{ i18n.ts._cherrypick.function }}</SearchLabel></template>
			<template #description><SearchKeyword>{{ i18n.ts._cherrypick.functionDescription }}</SearchKeyword></template>
			<div class="_gaps_m">
				<SearchMarker :keywords="['nickname', 'enable']">
					<MkPreferenceContainer k="nicknameEnabled">
						<MkSwitch v-model="nicknameEnabled">
							<template #label><SearchLabel>{{ i18n.ts._cherrypick.nickname }}</SearchLabel></template>
							<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.nicknameDescription }}</SearchKeyword></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<div class="_gaps_s">
					<SearchMarker :keywords="['nickname', 'enable']">
						<MkPreferenceContainer k="useEnterToSend">
							<MkSwitch v-model="useEnterToSend">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.useEnterToSend }}</SearchLabel></template>
								<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.useEnterToSendDescription }}</SearchKeyword></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['post', 'form', 'visibility', 'hotkey']">
						<MkPreferenceContainer k="postFormVisibilityHotkey">
							<MkSwitch v-model="postFormVisibilityHotkey">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.postFormVisibilityHotkey }}</SearchLabel></template>
								<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.postFormVisibilityHotkeyDescription }}</SearchKeyword></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'renote', 'note', 'confirm', 'popup']">
						<MkPreferenceContainer k="showRenoteConfirmPopup">
							<MkSwitch v-model="showRenoteConfirmPopup">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.showRenoteConfirmPopup }}</SearchLabel></template>
								<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.showRenoteConfirmPopupDescription }}</SearchKeyword></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['expand', 'note', 'click']">
						<MkPreferenceContainer k="expandOnNoteClick">
							<MkSwitch v-model="expandOnNoteClick">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.expandOnNoteClick }}</SearchLabel></template>
								<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.expandOnNoteClickDescription }}</SearchKeyword></template>
							</MkSwitch>
						</MkPreferenceContainer>

						<MkDisableSection :disabled="!expandOnNoteClick">
							<SearchMarker :keywords="['behavior']">
								<MkPreferenceContainer k="expandOnNoteClickBehavior">
									<MkSelect v-model="expandOnNoteClickBehavior" style="margin-left: 44px;">
										<template #label><SearchLabel>{{ i18n.ts._cherrypick.expandOnNoteClickBehavior }}</SearchLabel></template>
										<option value="click">{{ i18n.ts._nsfwOpenBehavior.click }}</option>
										<option value="doubleClick">{{ i18n.ts._nsfwOpenBehavior.doubleClick }}</option>
									</MkSelect>
								</MkPreferenceContainer>
							</SearchMarker>
						</MkDisableSection>
					</SearchMarker>
				</div>

				<SearchMarker :keywords="['display', 'header', 'navbar', 'scroll']">
					<div>
						<MkPreferenceContainer k="displayHeaderNavBarWhenScroll">
							<MkRadios v-model="displayHeaderNavBarWhenScroll">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.displayHeaderNavBarWhenScroll }}</SearchLabel></template>
								<option value="all">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.all }}</option>
								<option value="hideHeaderOnly">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideHeaderOnly }}</option>
								<option value="hideHeaderFloatBtn">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideHeaderFloatBtn }}</option>
								<option value="hideFloatBtnOnly">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideFloatBtnOnly }}</option>
								<option value="hideFloatBtnNavBar">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hideFloatBtnNavBar }}</option>
								<option value="hide">{{ i18n.ts._cherrypick._displayHeaderNavBarWhenScroll.hide }}</option>
							</MkRadios>
						</MkPreferenceContainer>
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
						<MkPreferenceContainer k="reactableRemoteReactionEnabled">
							<MkSwitch v-model="reactableRemoteReactionEnabled">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.reactableRemoteReaction }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'follow', 'message', 'enable']">
						<MkPreferenceContainer k="showFollowingMessageInsteadOfButtonEnabled">
							<MkSwitch v-model="showFollowingMessageInsteadOfButtonEnabled">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.showFollowingMessageInsteadOfButton }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['mobile', 'header', 'change']">
						<MkPreferenceContainer k="mobileHeaderChange">
							<MkSwitch v-model="mobileHeaderChange">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.mobileHeaderChange }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['rename', 'post', 'form', 'nya']">
						<MkPreferenceContainer k="renameTheButtonInPostFormToNya">
							<MkSwitch v-model="renameTheButtonInPostFormToNya">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.renameTheButtonInPostFormToNya }}</SearchLabel></template>
								<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.renameTheButtonInPostFormToNyaDescription }}</SearchKeyword></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['ui', 'show', 'display']">
			<FormSection>
				<template #label><SearchLabel>UI</SearchLabel></template>
				<div class="_gaps_m">
					<SearchMarker :keywords="['enable', 'widget']">
						<MkPreferenceContainer k="enableWidgetsArea">
							<MkSwitch v-model="enableWidgetsArea">
								<template #label><SearchLabel>{{ i18n.ts._cherrypick.enableWidgetsArea }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['friendly']">
						<div class="_gaps_s" style="margin: 0 10px;">
							<div style="font-weight: bold; padding: 0.5em 0 0 0; margin: 0 0 8px 0;"><SearchLabel>Friendly UI</SearchLabel></div>

							<SearchMarker :keywords="['enable', 'notification']">
								<MkPreferenceContainer k="friendlyUiEnableNotificationsArea">
									<MkSwitch v-model="friendlyUiEnableNotificationsArea">
										<template #label><SearchLabel>{{ i18n.ts._cherrypick.friendlyUiEnableNotificationsArea }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['enable', 'long', 'press', 'open', 'account', 'menu']">
								<MkPreferenceContainer k="enableLongPressOpenAccountMenu">
									<MkSwitch v-model="enableLongPressOpenAccountMenu">
										<template #label><SearchLabel>{{ i18n.ts._cherrypick.enableLongPressOpenAccountMenu }}</SearchLabel></template>
										<template #caption><SearchKeyword>{{ i18n.ts._cherrypick.enableLongPressOpenAccountMenuDescription }}</SearchKeyword></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['show', 'avatar', 'decoration', 'navbtn']">
								<MkPreferenceContainer k="friendlyUiShowAvatarDecorationsInNavBtn">
									<MkSwitch v-model="friendlyUiShowAvatarDecorationsInNavBtn">
										<template #label><SearchLabel>{{ i18n.ts._cherrypick.friendlyUiShowAvatarDecorationsInNavBtn }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['behavior', 'lab']">
			<FormSection>
				<template #label><i class="ti ti-flask"/> <SearchLabel>{{ i18n.ts.cherrypickLabs }}</SearchLabel></template>
				<template #description><SearchKeyword>{{ i18n.ts.cherrypickLabsDescription }}</SearchKeyword></template>
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
import { prefer } from '@/preferences.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import MkDisableSection from '@/components/MkDisableSection.vue';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';

const nicknameEnabled = prefer.model('nicknameEnabled');
const useEnterToSend = prefer.model('useEnterToSend');
const postFormVisibilityHotkey = prefer.model('postFormVisibilityHotkey');
const showRenoteConfirmPopup = prefer.model('showRenoteConfirmPopup');
const expandOnNoteClick = prefer.model('expandOnNoteClick');
const expandOnNoteClickBehavior = prefer.model('expandOnNoteClickBehavior');
const displayHeaderNavBarWhenScroll = prefer.model('displayHeaderNavBarWhenScroll');
const reactableRemoteReactionEnabled = prefer.model('reactableRemoteReactionEnabled');
const showFollowingMessageInsteadOfButtonEnabled = prefer.model('showFollowingMessageInsteadOfButtonEnabled');
const mobileHeaderChange = prefer.model('mobileHeaderChange');
const renameTheButtonInPostFormToNya = prefer.model('renameTheButtonInPostFormToNya');
const enableWidgetsArea = prefer.model('enableWidgetsArea');
const friendlyUiEnableNotificationsArea = prefer.model('friendlyUiEnableNotificationsArea');
const enableLongPressOpenAccountMenu = prefer.model('enableLongPressOpenAccountMenu');
const friendlyUiShowAvatarDecorationsInNavBtn = prefer.model('friendlyUiShowAvatarDecorationsInNavBtn');

watch([
	renameTheButtonInPostFormToNya,
], async () => {
	await prefer.commit('renameTheButtonInPostFormToNyaManualSet', true);
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

definePage(() => ({
	title: 'CherryPick',
	icon: 'ti ti-bulb-filled',
}));
</script>
