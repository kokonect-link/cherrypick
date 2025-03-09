<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/appearance" :label="i18n.ts.appearance" :keywords="['appearance']" icon="ti ti-device-desktop">
	<div class="_gaps_m">
		<FormSection first>
			<template #label>{{ i18n.ts.appearance }}</template>

			<div class="_gaps_m">
				<SearchMarker :keywords="['font', 'size']">
					<!--
					<MkRadios v-model="fontSize">
						<template #label><SearchLabel>{{ i18n.ts.fontSize }}</SearchLabel></template>
						<option value="1"><span style="font-size: 12px;">Aa</span></option>
						<option value="2"><span style="font-size: 13px;">Aa</span></option>
						<option :value="null"><span style="font-size: 14px;">Aa</span></option>
						<option value="3"><span style="font-size: 15px;">Aa</span></option>
						<option value="4"><span style="font-size: 16px;">Aa</span></option>
						<option value="5"><span style="font-size: 17px;">Aa</span></option>
						<option value="6"><span style="font-size: 18px;">Aa</span></option>
						<option value="7"><span style="font-size: 19px;">Aa</span></option>
						<option value="8"><span style="font-size: 20px;">Aa</span></option>
					</MkRadios>
					-->

					<div>
						<div :class="$style.label"><SearchLabel>{{ i18n.ts.fontSize }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></div>
						<div :class="$style.fontSize" class="_panel">
							<div v-if="fontSize === 1" style="font-size: 7px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 2" style="font-size: 8px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 3" style="font-size: 9px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 4" style="font-size: 10px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 5" style="font-size: 11px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 6" style="font-size: 12px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 7" style="font-size: 13px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 8" style="font-size: 14px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 9" style="font-size: 15px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 10" style="font-size: 16px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 11" style="font-size: 17px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 12" style="font-size: 18px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 13" style="font-size: 19px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 14" style="font-size: 20px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 15" style="font-size: 21px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 16" style="font-size: 22px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 17" style="font-size: 23px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 18" style="font-size: 24px;">{{ i18n.ts._mfc.dummy }}</div>
							<div v-else-if="fontSize === 19" style="font-size: 25px;">{{ i18n.ts._mfc.dummy }}</div>
						</div>
						<div :class="$style.fontSizeSlider">
							<div :class="$style.fontSizeLeft">Aa</div>
							<MkRange
								v-model="fontSize" style="position: initial !important; width: 100%; margin: 0 -10px;" :min="1" :max="19" :step="1" easing :textConverter="(v) =>
									v === 1 ? '7px' :
									v === 2 ? '8px' :
									v === 3 ? '9px' :
									v === 4 ? '10px' :
									v === 5 ? '11px' :
									v === 6 ? '12px' :
									v === 7 ? '13px' :
									v === 8 ? '14px' :
									v === 9 ? '15px' :
									v === 10 ? '16px' :
									v === 11 ? '17px' :
									v === 12 ? '18px' :
									v === 13 ? '19px' :
									v === 14 ? '20px' :
									v === 15 ? '21px' :
									v === 16 ? '22px' :
									v === 17 ? '23px' :
									v === 18 ? '24px' :
									v === 19 ? '25px' : ''"
							>
							</MkRange>
							<div :class="$style.fontSizeRight">Aa</div>
						</div>
						<MkInfo v-if="fontSize != fontSizeBefore" style="margin-top: 10px;">{{ i18n.ts.reloadToApplySetting2 }}</MkInfo>

						<SearchMarker :keywords="['bold']">
							<MkSwitch v-model="useBoldFont" style="margin-top: .75em;">
								<template #label><SearchLabel>{{ i18n.ts.useBoldFont }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['system', 'native']">
							<MkSwitch v-model="useSystemFont" style="margin-top: .75em;">
								<template #label><SearchLabel>{{ i18n.ts.useSystemFont }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>
					</div>
				</SearchMarker>

				<div class="_gaps_s">
					<SearchMarker :keywords="['blur']">
						<MkSwitch v-model="useBlurEffect">
							<template #label><SearchLabel>{{ i18n.ts.useBlurEffect }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['blur', 'modal']">
						<MkSwitch v-model="useBlurEffectForModal">
							<template #label><SearchLabel>{{ i18n.ts.useBlurEffectForModal }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<MkDisableSection :disabled="!(useBlurEffect && useBlurEffectForModal)">
						<SearchMarker :keywords="['blur', 'modal', 'bg', 'remove']">
							<MkSwitch v-model="removeModalBgColorForBlur">
								<template #label><SearchLabel>{{ i18n.ts.removeModalBgColorForBlur }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>
					</MkDisableSection>

					<SearchMarker :keywords="['highlight', 'sensitive', 'nsfw', 'image', 'photo', 'picture', 'media', 'thumbnail']">
						<MkSwitch v-model="highlightSensitiveMedia">
							<template #label><SearchLabel>{{ i18n.ts.highlightSensitiveMedia }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['avatar', 'icon', 'square']">
						<MkSwitch v-model="squareAvatars">
							<template #label><SearchLabel>{{ i18n.ts.squareAvatars }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['avatar', 'icon', 'square', 'federation', 'shape']">
						<MkSwitch v-model="setFederationAvatarShape" @update:modelValue="cantUseSetFederationAvatarShape">
							<template #label><SearchLabel>{{ i18n.ts.setFederationAvatarShape }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							<template #caption>
								<SearchKeyword>
									{{ $i?.policies.canSetFederationAvatarShape ? i18n.ts.setFederationAvatarShapeDescription : i18n.ts.cannotBeUsedFunc }}
									<span v-if="!$i?.policies.canSetFederationAvatarShape" style="margin-left: 3px;">
										<a class="_link" @click="learnMoreCantUseSetFederationAvatarShape">{{ i18n.ts.learnMore }}</a>
									</span>
								</SearchKeyword>
							</template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['avatar', 'icon', 'decoration', 'show']">
						<MkSwitch v-model="showAvatarDecorations">
							<template #label><SearchLabel>{{ i18n.ts.showAvatarDecorations }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['note', 'timeline', 'gap']">
						<MkSwitch v-model="showGapBetweenNotesInTimeline">
							<template #label><SearchLabel>{{ i18n.ts.showGapBetweenNotesInTimeline }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['effect', 'show']">
						<MkSwitch v-model="enableSeasonalScreenEffect">
							<template #label><SearchLabel>{{ i18n.ts.seasonalScreenEffect }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'unread', 'notification', 'count']">
						<MkSwitch v-model="showUnreadNotificationsCount">
							<template #label><SearchLabel>{{ i18n.ts.showUnreadNotificationsCount }}</SearchLabel> <span class="_beta">CherryPick</span></template>
						</MkSwitch>
					</SearchMarker>
				</div>

				<SearchMarker :keywords="['file', 'grid', 'layout', 'user', 'page']">
					<MkSwitch v-model="filesGridLayoutInUserPage">
						<template #label><SearchLabel>{{ i18n.ts.filesGridLayoutInUserPage }}</SearchLabel> <span class="_beta">CherryPick</span></template>
						<template #caption><SearchKeyword>{{ i18n.ts.filesGridLayoutInUserPageDescription }}</SearchKeyword></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['menu', 'style', 'popup', 'drawer']">
					<MkSelect v-model="menuStyle">
						<template #label><SearchLabel>{{ i18n.ts.menuStyle }}</SearchLabel></template>
						<option value="auto">{{ i18n.ts.auto }}</option>
						<option value="popup">{{ i18n.ts.popup }}</option>
						<option value="drawer">{{ i18n.ts.drawer }}</option>
					</MkSelect>
				</SearchMarker>

				<SearchMarker :keywords="['emoji', 'style', 'native', 'system', 'fluent', 'twemoji']">
					<div>
						<MkRadios v-model="emojiStyle">
							<template #label><SearchLabel>{{ i18n.ts.emojiStyle }}</SearchLabel></template>
							<option value="native">{{ i18n.ts.native }}</option>
							<option value="fluentEmoji">Fluent Emoji</option>
							<option value="twemoji">Twemoji</option>
						</MkRadios>
						<div style="margin: 8px 0 0 0; font-size: 1.5em;"><Mfm :key="emojiStyle" text="🍮🍦🍭🍩🍰🍫🍬🥞🍪"/></div>
					</div>
				</SearchMarker>
			</div>
		</FormSection>

		<SearchMarker :keywords="['note', 'display']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.displayOfNote }}</SearchLabel></template>

				<div class="_gaps_s">
					<SearchMarker :keywords="['reaction', 'size', 'scale', 'display']">
						<MkRadios v-model="reactionsDisplaySize">
							<template #label><SearchLabel>{{ i18n.ts.reactionsDisplaySize }}</SearchLabel></template>
							<option value="small">{{ i18n.ts.small }}</option>
							<option value="medium">{{ i18n.ts.medium }}</option>
							<option value="large">{{ i18n.ts.large }}</option>
						</MkRadios>
					</SearchMarker>

					<SearchMarker :keywords="['reaction', 'size', 'scale', 'display', 'width', 'limit']">
						<MkSwitch v-model="limitWidthOfReaction">
							<template #label><SearchLabel>{{ i18n.ts.limitWidthOfReaction }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['hide', 'avatar', 'note', 'display']">
						<MkSwitch v-model="hideAvatarsInNote">
							<template #label><SearchLabel>{{ i18n.ts.hideAvatarsInNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['enable', 'absolute', 'time', 'note', 'display']">
						<MkSwitch v-model="enableAbsoluteTime">
							<template #label><SearchLabel>{{ i18n.ts.enableAbsoluteTime }}</SearchLabel> <span class="_beta">CherryPick</span></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['enable', 'mark', 'date', 'note', 'display']">
						<MkSwitch v-model="enableMarkByDate" :disabled="defaultStore.state.enableAbsoluteTime">
							<template #label><SearchLabel>{{ i18n.ts.enableMarkByDate }}</SearchLabel> <span class="_beta">CherryPick</span></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'reply', 'target', 'note', 'display']">
						<MkSwitch v-model="showReplyTargetNote">
							<template #label><SearchLabel>{{ i18n.ts.showReplyTargetNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'reply', 'target', 'note', 'transparent', 'display']">
						<MkSwitch v-model="showReplyTargetNoteInSemiTransparent" :disabled="!showReplyTargetNote">
							<template #label><SearchLabel>{{ i18n.ts.showReplyTargetNoteInSemiTransparent }}</SearchLabel> <span class="_beta">CherryPick</span></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'list', 'size', 'height']">
						<MkRadios v-model="mediaListWithOneImageAppearance">
							<template #label><SearchLabel>{{ i18n.ts.mediaListWithOneImageAppearance }}</SearchLabel></template>
							<option value="expand">{{ i18n.ts.default }}</option>
							<option value="16_9">{{ i18n.tsx.limitTo({ x: '16:9' }) }}</option>
							<option value="1_1">{{ i18n.tsx.limitTo({ x: '1:1' }) }}</option>
							<option value="2_3">{{ i18n.tsx.limitTo({ x: '2:3' }) }}</option>
						</MkRadios>
					</SearchMarker>

					<MkDisableSection :disabled="instance.federation == 'none'">
						<SearchMarker :keywords="['ticker', 'information', 'label', 'instance', 'server', 'host', 'federation']">
							<MkSelect v-model="instanceTicker">
								<template #label><SearchLabel>{{ i18n.ts.instanceTicker }}</SearchLabel></template>
								<option value="none">{{ i18n.ts._instanceTicker.none }}</option>
								<option value="remote">{{ i18n.ts._instanceTicker.remote }}</option>
								<option value="always">{{ i18n.ts._instanceTicker.always }}</option>
							</MkSelect>
						</SearchMarker>
					</MkDisableSection>

					<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'nsfw', 'sensitive', 'display', 'show', 'hide', 'visibility']">
						<MkSelect v-model="nsfw">
							<template #label><SearchLabel>{{ i18n.ts.displayOfSensitiveMedia }}</SearchLabel></template>
							<option value="respect">{{ i18n.ts._displayOfSensitiveMedia.respect }}</option>
							<option value="ignore">{{ i18n.ts._displayOfSensitiveMedia.ignore }}</option>
							<option value="force">{{ i18n.ts._displayOfSensitiveMedia.force }}</option>
						</MkSelect>
					</SearchMarker>

					<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'nsfw', 'sensitive', 'display', 'show', 'hide', 'visibility', 'open', 'click', 'double']">
						<MkSelect v-model="nsfwOpenBehavior">
							<template #label>{{ i18n.ts.nsfwOpenBehavior }} <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
							<option value="click">{{ i18n.ts._nsfwOpenBehavior.click }}</option>
							<option value="doubleClick">{{ i18n.ts._nsfwOpenBehavior.doubleClick }}</option>
						</MkSelect>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['notification', 'display']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.notificationDisplay }}</SearchLabel></template>

				<div class="_gaps_m">
					<SearchMarker :keywords="['position']">
						<MkRadios v-model="notificationPosition">
							<template #label><SearchLabel>{{ i18n.ts.position }}</SearchLabel></template>
							<option value="leftTop"><i class="ti ti-align-box-left-top"></i> {{ i18n.ts.leftTop }}</option>
							<option value="rightTop"><i class="ti ti-align-box-right-top"></i> {{ i18n.ts.rightTop }}</option>
							<option value="leftBottom"><i class="ti ti-align-box-left-bottom"></i> {{ i18n.ts.leftBottom }}</option>
							<option value="rightBottom"><i class="ti ti-align-box-right-bottom"></i> {{ i18n.ts.rightBottom }}</option>
						</MkRadios>
					</SearchMarker>

					<SearchMarker :keywords="['stack', 'axis', 'direction']">
						<MkRadios v-model="notificationStackAxis">
							<template #label><SearchLabel>{{ i18n.ts.stackAxis }}</SearchLabel></template>
							<option value="vertical"><i class="ti ti-carousel-vertical"></i> {{ i18n.ts.vertical }}</option>
							<option value="horizontal"><i class="ti ti-carousel-horizontal"></i> {{ i18n.ts.horizontal }}</option>
						</MkRadios>
					</SearchMarker>

					<MkButton @click="testNotification">{{ i18n.ts._notification.checkNotificationBehavior }}</MkButton>
				</div>
			</FormSection>
		</SearchMarker>

		<FormSection>
			<FormLink to="/settings/custom-css"><template #icon><i class="ti ti-code"></i></template>{{ i18n.ts.customCss }}</FormLink>
		</FormSection>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import * as Misskey from 'cherrypick-js';
import * as os from '@/os.js';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkRange from '@/components/MkRange.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import MkInfo from '@/components/MkInfo.vue';
import FormLink from '@/components/form/link.vue';
import { instance } from '@/instance.js';
import { defaultStore } from '@/store.js';
import { reloadAsk } from '@/scripts/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { miLocalStorage } from '@/local-storage.js';
import { globalEvents } from '@/events.js';
import { claimAchievement } from '@/scripts/achievements.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { $i } from '@/account.js';
import MkDisableSection from '@/components/MkDisableSection.vue';

// const fontSize = ref(miLocalStorage.getItem('fontSize'));
const useSystemFont = ref(miLocalStorage.getItem('useSystemFont') != null);

const fontSizeBefore = ref(miLocalStorage.getItem('fontSize'));
const useBoldFont = ref(miLocalStorage.getItem('useBoldFont'));

const showAvatarDecorations = computed(defaultStore.makeGetterSetter('showAvatarDecorations'));
const emojiStyle = computed(defaultStore.makeGetterSetter('emojiStyle'));
const menuStyle = computed(defaultStore.makeGetterSetter('menuStyle'));
const useBlurEffectForModal = computed(defaultStore.makeGetterSetter('useBlurEffectForModal'));
const useBlurEffect = computed(defaultStore.makeGetterSetter('useBlurEffect'));
const highlightSensitiveMedia = computed(defaultStore.makeGetterSetter('highlightSensitiveMedia'));
const squareAvatars = computed(defaultStore.makeGetterSetter('squareAvatars'));
const enableSeasonalScreenEffect = computed(defaultStore.makeGetterSetter('enableSeasonalScreenEffect'));
const showGapBetweenNotesInTimeline = computed(defaultStore.makeGetterSetter('showGapBetweenNotesInTimeline'));
const mediaListWithOneImageAppearance = computed(defaultStore.makeGetterSetter('mediaListWithOneImageAppearance'));
const reactionsDisplaySize = computed(defaultStore.makeGetterSetter('reactionsDisplaySize'));
const limitWidthOfReaction = computed(defaultStore.makeGetterSetter('limitWidthOfReaction'));
const notificationPosition = computed(defaultStore.makeGetterSetter('notificationPosition'));
const notificationStackAxis = computed(defaultStore.makeGetterSetter('notificationStackAxis'));
const nsfw = computed(defaultStore.makeGetterSetter('nsfw'));
const instanceTicker = computed(defaultStore.makeGetterSetter('instanceTicker'));

const removeModalBgColorForBlur = computed(defaultStore.makeGetterSetter('removeModalBgColorForBlur'));
const setFederationAvatarShape = computed(defaultStore.makeGetterSetter('setFederationAvatarShape'));
const showUnreadNotificationsCount = computed(defaultStore.makeGetterSetter('showUnreadNotificationsCount'));
const filesGridLayoutInUserPage = computed(defaultStore.makeGetterSetter('filesGridLayoutInUserPage'));
const fontSize = computed(defaultStore.makeGetterSetter('fontSize'));
const hideAvatarsInNote = computed(defaultStore.makeGetterSetter('hideAvatarsInNote'));
const enableAbsoluteTime = computed(defaultStore.makeGetterSetter('enableAbsoluteTime'));
const enableMarkByDate = computed(defaultStore.makeGetterSetter('enableMarkByDate'));
const showReplyTargetNote = computed(defaultStore.makeGetterSetter('showReplyTargetNote'));
const showReplyTargetNoteInSemiTransparent = computed(defaultStore.makeGetterSetter('showReplyTargetNoteInSemiTransparent'));
const nsfwOpenBehavior = computed(defaultStore.makeGetterSetter('nsfwOpenBehavior'));

watch(fontSize, () => {
	if (fontSize.value == null) {
		miLocalStorage.removeItem('fontSize');
	} else {
		// miLocalStorage.setItem('fontSize', fontSize.value);
		miLocalStorage.setItem('fontSize', fontSize.value as number);
	}
});

watch(useBoldFont, () => {
	if (useBoldFont.value) {
		miLocalStorage.setItem('useBoldFont', useBoldFont.value);
	} else {
		miLocalStorage.removeItem('useBoldFont');
	}
});

watch(useSystemFont, () => {
	if (useSystemFont.value) {
		miLocalStorage.setItem('useSystemFont', 't');
	} else {
		miLocalStorage.removeItem('useSystemFont');
	}
});

watch([
	squareAvatars,
	setFederationAvatarShape,
], () => {
	misskeyApi('i/update', {
		setFederationAvatarShape: $i?.policies.canSetFederationAvatarShape ? setFederationAvatarShape.value : false,
		isSquareAvatars: defaultStore.state.squareAvatars,
	});
});

watch([
	useBlurEffect,
	useBlurEffectForModal,
	removeModalBgColorForBlur,
	// fontSize,
	useBoldFont,
	useSystemFont,
	squareAvatars,
	setFederationAvatarShape,
	highlightSensitiveMedia,
	enableSeasonalScreenEffect,
	showGapBetweenNotesInTimeline,
	showUnreadNotificationsCount,
	filesGridLayoutInUserPage,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch([
	hideAvatarsInNote,
	mediaListWithOneImageAppearance,
	reactionsDisplaySize,
	limitWidthOfReaction,
	instanceTicker,
	highlightSensitiveMedia,
	enableAbsoluteTime,
	enableMarkByDate,
	showReplyTargetNote,
	showReplyTargetNoteInSemiTransparent,
], () => {
	reloadTimeline();
	reloadNotification();
});

let smashCount = 0;
let smashTimer: number | null = null;

function testNotification(): void {
	const notification: Misskey.entities.Notification = {
		id: Math.random().toString(),
		createdAt: new Date().toUTCString(),
		isRead: false,
		type: 'test',
	};

	globalEvents.emit('clientNotification', notification);

	// セルフ通知破壊 実績関連
	smashCount++;
	if (smashCount >= 10) {
		claimAchievement('smashTestNotificationButton');
		smashCount = 0;
	}
	if (smashTimer) {
		clearTimeout(smashTimer);
	}
	smashTimer = window.setTimeout(() => {
		smashCount = 0;
	}, 300);
}

function reloadTimeline() {
	globalEvents.emit('reloadTimeline');
}

function reloadNotification() {
	globalEvents.emit('reloadNotification');
}

async function cantUseSetFederationAvatarShape() {
	if ($i && !$i.policies.canSetFederationAvatarShape && setFederationAvatarShape.value) setFederationAvatarShape.value = false;
}

function learnMoreCantUseSetFederationAvatarShape() {
	os.alert({
		type: 'info',
		title: i18n.ts.setFederationAvatarShape,
		text: i18n.tsx.cantUseThisFunctionDescription({ name: i18n.ts.setFederationAvatarShape }),
		caption: i18n.tsx.cantUseThisFunctionCaption({ name: i18n.ts.setFederationAvatarShape }),
	});
}

onMounted(() => {
	if (fontSizeBefore.value == null) {
		fontSizeBefore.value = fontSize.value as string;
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts.appearance,
	icon: 'ti ti-device-desktop',
}));
</script>

<style lang="scss" module>
.label {
	font-size: 0.85em;
	padding: 0 0 8px 0;
	user-select: none;
}

.fontSize {
	padding: 20px 20px 28px;
	border-radius: 6px;
	text-align: center;
}

.fontSizeSlider {
	display: flex;
	margin-top: -8px;
	border-top: solid .5px var(--MI_THEME-divider);

	> .fontSizeLeft, .fontSizeRight {
		position: relative;
		background: var(--MI_THEME-panel);
		font-weight: normal;
		line-height: 20px;
	}

	> .fontSizeLeft {
		padding: 7px 6px 7px 18px;
		border-bottom-left-radius: 6px;
		font-size: 12px;
	}

	> .fontSizeRight {
		padding: 7px 18px 7px 6px;
		border-bottom-right-radius: 6px;
		font-size: 18px;
	}
}
</style>
