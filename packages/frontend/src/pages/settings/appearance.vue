<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/appearance" :label="i18n.ts.appearance" :keywords="['appearance']" icon="ti ti-device-desktop">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/desktop_computer_3d.png" color="#eaff00">
			<SearchKeyword>{{ i18n.ts._settings.appearanceBanner }}</SearchKeyword>
		</MkFeatureBanner>

		<FormSection first>
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

					<div style="width: 100%">
						<div :class="$style.label"><SearchLabel>{{ i18n.ts.fontSize }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></div>
						<div :class="$style.fontSize" class="_panel">
							<MkPreferenceContainer k="fontSize">
								<div v-for="size in 19" v-show="fontSize === size" :key="size" :style="{ fontSize: `${size + 6}px` }">{{ i18n.ts._mfc.dummy }}</div>
							</MkPreferenceContainer>
						</div>
						<div :class="$style.fontSizeSlider">
							<div :class="$style.fontSizeLeft">Aa</div>
							<MkRange
								v-model="fontSize"
								style="position: initial !important; width: 100%; margin: 0 -10px;"
								easing
								:min="1"
								:max="19"
								:step="1"
								:textConverter="(v) => `${v + 6}px`"
							/>
							<div :class="$style.fontSizeRight">Aa</div>
						</div>
						<MkInfo v-if="String(fontSize) != String(fontSizeBefore)" style="margin-top: 10px;">{{ i18n.ts.reloadToApplySetting2 }} <a class="_link" @click="reload">{{ i18n.ts.reload }}</a></MkInfo>

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
						<MkPreferenceContainer k="useBlurEffect">
							<MkSwitch v-model="useBlurEffect">
								<template #label><SearchLabel>{{ i18n.ts.useBlurEffect }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['blur', 'modal']">
						<MkPreferenceContainer k="useBlurEffectForModal">
							<MkSwitch v-model="useBlurEffectForModal">
								<template #label><SearchLabel>{{ i18n.ts.useBlurEffectForModal }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['blur', 'modal', 'bg', 'remove']">
						<MkPreferenceContainer k="removeModalBgColorForBlur">
							<MkSwitch v-if="useBlurEffect && useBlurEffectForModal" v-model="removeModalBgColorForBlur">
								<template #label><SearchLabel>{{ i18n.ts.removeModalBgColorForBlur }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['highlight', 'sensitive', 'nsfw', 'image', 'photo', 'picture', 'media', 'thumbnail']">
						<MkPreferenceContainer k="highlightSensitiveMedia">
							<MkSwitch v-model="highlightSensitiveMedia">
								<template #label><SearchLabel>{{ i18n.ts.highlightSensitiveMedia }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['avatar', 'icon', 'square']">
						<MkPreferenceContainer k="squareAvatars">
							<MkSwitch v-model="squareAvatars">
								<template #label><SearchLabel>{{ i18n.ts.squareAvatars }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['avatar', 'icon', 'square', 'federation', 'shape']">
						<MkPreferenceContainer k="setFederationAvatarShape">
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
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['avatar', 'icon', 'decoration', 'show']">
						<MkPreferenceContainer k="showAvatarDecorations">
							<MkSwitch v-model="showAvatarDecorations">
								<template #label><SearchLabel>{{ i18n.ts.showAvatarDecorations }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['note', 'timeline', 'gap']">
						<MkPreferenceContainer k="showGapBetweenNotesInTimeline">
							<MkSwitch v-model="showGapBetweenNotesInTimeline">
								<template #label><SearchLabel>{{ i18n.ts.showGapBetweenNotesInTimeline }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['effect', 'show']">
						<MkPreferenceContainer k="enableSeasonalScreenEffect">
							<MkSwitch v-model="enableSeasonalScreenEffect">
								<template #label><SearchLabel>{{ i18n.ts.seasonalScreenEffect }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'unread', 'notification', 'count']">
						<MkPreferenceContainer k="showUnreadNotificationsCount">
							<MkSwitch v-model="showUnreadNotificationsCount">
								<template #label><SearchLabel>{{ i18n.ts.showUnreadNotificationsCount }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>
				</div>

				<SearchMarker :keywords="['file', 'grid', 'layout', 'user', 'page']">
					<MkPreferenceContainer k="filesGridLayoutInUserPage">
						<MkSwitch v-model="filesGridLayoutInUserPage">
							<template #label><SearchLabel>{{ i18n.ts.filesGridLayoutInUserPage }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							<template #caption><SearchKeyword>{{ i18n.ts.filesGridLayoutInUserPageDescription }}</SearchKeyword></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['menu', 'style', 'popup', 'drawer']">
					<MkPreferenceContainer k="menuStyle">
						<MkSelect v-model="menuStyle">
							<template #label><SearchLabel>{{ i18n.ts.menuStyle }}</SearchLabel></template>
							<option value="auto">{{ i18n.ts.auto }}</option>
							<option value="popup">{{ i18n.ts.popup }}</option>
							<option value="drawer">{{ i18n.ts.drawer }}</option>
						</MkSelect>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['emoji', 'style', 'native', 'system', 'fluent', 'twemoji']">
					<MkPreferenceContainer k="emojiStyle">
						<div>
							<MkRadios v-model="emojiStyle">
								<template #label><SearchLabel>{{ i18n.ts.emojiStyle }}</SearchLabel></template>
								<option value="native">{{ i18n.ts.native }}</option>
								<option value="fluentEmoji">Fluent Emoji</option>
								<option value="twemoji">Twemoji</option>
							</MkRadios>
							<div style="margin: 8px 0 0 0; font-size: 1.5em;"><Mfm :key="emojiStyle" text="🍮🍦🍭🍩🍰🍫🍬🥞🍪"/></div>
						</div>
					</MkPreferenceContainer>
				</SearchMarker>
			</div>
		</FormSection>

		<SearchMarker :keywords="['note', 'display']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.displayOfNote }}</SearchLabel></template>

				<div class="_gaps_s">
					<SearchMarker :keywords="['reaction', 'size', 'scale', 'display']">
						<MkPreferenceContainer k="reactionsDisplaySize">
							<MkRadios v-model="reactionsDisplaySize">
								<template #label><SearchLabel>{{ i18n.ts.reactionsDisplaySize }}</SearchLabel></template>
								<option value="small">{{ i18n.ts.small }}</option>
								<option value="medium">{{ i18n.ts.medium }}</option>
								<option value="large">{{ i18n.ts.large }}</option>
							</MkRadios>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['reaction', 'size', 'scale', 'display', 'width', 'limit']">
						<MkPreferenceContainer k="limitWidthOfReaction">
							<MkSwitch v-model="limitWidthOfReaction">
								<template #label><SearchLabel>{{ i18n.ts.limitWidthOfReaction }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['hide', 'avatar', 'note', 'display']">
						<MkPreferenceContainer k="hideAvatarsInNote">
							<MkSwitch v-model="hideAvatarsInNote">
								<template #label><SearchLabel>{{ i18n.ts.hideAvatarsInNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['enable', 'absolute', 'time', 'note', 'display']">
						<MkPreferenceContainer k="enableAbsoluteTime">
							<MkSwitch v-model="enableAbsoluteTime">
								<template #label><SearchLabel>{{ i18n.ts.enableAbsoluteTime }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['enable', 'mark', 'date', 'note', 'display']">
						<MkPreferenceContainer k="enableMarkByDate">
							<MkSwitch v-model="enableMarkByDate" :disabled="prefer.s.enableAbsoluteTime">
								<template #label><SearchLabel>{{ i18n.ts.enableMarkByDate }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'reply', 'target', 'note', 'display']">
						<MkPreferenceContainer k="showReplyTargetNote">
							<MkSwitch v-model="showReplyTargetNote">
								<template #label><SearchLabel>{{ i18n.ts.showReplyTargetNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'reply', 'target', 'note', 'transparent', 'display']">
						<MkPreferenceContainer k="showReplyTargetNoteInSemiTransparent">
							<MkSwitch v-model="showReplyTargetNoteInSemiTransparent" :disabled="!showReplyTargetNote">
								<template #label><SearchLabel>{{ i18n.ts.showReplyTargetNoteInSemiTransparent }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'list', 'size', 'height']">
						<MkPreferenceContainer k="mediaListWithOneImageAppearance">
							<MkRadios v-model="mediaListWithOneImageAppearance">
								<template #label><SearchLabel>{{ i18n.ts.mediaListWithOneImageAppearance }}</SearchLabel></template>
								<option value="expand">{{ i18n.ts.default }}</option>
								<option value="16_9">{{ i18n.tsx.limitTo({ x: '16:9' }) }}</option>
								<option value="1_1">{{ i18n.tsx.limitTo({ x: '1:1' }) }}</option>
								<option value="2_3">{{ i18n.tsx.limitTo({ x: '2:3' }) }}</option>
							</MkRadios>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['ticker', 'information', 'label', 'instance', 'server', 'host', 'federation']">
						<MkPreferenceContainer k="instanceTicker">
							<MkSelect v-if="instance.federation !== 'none'" v-model="instanceTicker">
								<template #label><SearchLabel>{{ i18n.ts.instanceTicker }}</SearchLabel></template>
								<option value="none">{{ i18n.ts._instanceTicker.none }}</option>
								<option value="remote">{{ i18n.ts._instanceTicker.remote }}</option>
								<option value="always">{{ i18n.ts._instanceTicker.always }}</option>
							</MkSelect>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'nsfw', 'sensitive', 'display', 'show', 'hide', 'visibility']">
						<MkPreferenceContainer k="nsfw">
							<MkSelect v-model="nsfw">
								<template #label><SearchLabel>{{ i18n.ts.displayOfSensitiveMedia }}</SearchLabel></template>
								<option value="respect">{{ i18n.ts._displayOfSensitiveMedia.respect }}</option>
								<option value="ignore">{{ i18n.ts._displayOfSensitiveMedia.ignore }}</option>
								<option value="force">{{ i18n.ts._displayOfSensitiveMedia.force }}</option>
							</MkSelect>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'nsfw', 'sensitive', 'display', 'show', 'hide', 'visibility', 'open', 'click', 'double']">
						<MkPreferenceContainer k="nsfwOpenBehavior">
							<MkSelect v-model="nsfwOpenBehavior">
								<template #label>{{ i18n.ts.nsfwOpenBehavior }} <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
								<option value="click">{{ i18n.ts._nsfwOpenBehavior.click }}</option>
								<option value="doubleClick">{{ i18n.ts._nsfwOpenBehavior.doubleClick }}</option>
							</MkSelect>
						</MkPreferenceContainer>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['notification', 'display']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.notificationDisplay }}</SearchLabel></template>

				<div class="_gaps_m">
					<SearchMarker :keywords="['position']">
						<MkPreferenceContainer k="notificationPosition">
							<MkRadios v-model="notificationPosition">
								<template #label><SearchLabel>{{ i18n.ts.position }}</SearchLabel></template>
								<option value="leftTop"><i class="ti ti-align-box-left-top"></i> {{ i18n.ts.leftTop }}</option>
								<option value="rightTop"><i class="ti ti-align-box-right-top"></i> {{ i18n.ts.rightTop }}</option>
								<option value="leftBottom"><i class="ti ti-align-box-left-bottom"></i> {{ i18n.ts.leftBottom }}</option>
								<option value="rightBottom"><i class="ti ti-align-box-right-bottom"></i> {{ i18n.ts.rightBottom }}</option>
							</MkRadios>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['stack', 'axis', 'direction']">
						<MkPreferenceContainer k="notificationStackAxis">
							<MkRadios v-model="notificationStackAxis">
								<template #label><SearchLabel>{{ i18n.ts.stackAxis }}</SearchLabel></template>
								<option value="vertical"><i class="ti ti-carousel-vertical"></i> {{ i18n.ts.vertical }}</option>
								<option value="horizontal"><i class="ti ti-carousel-horizontal"></i> {{ i18n.ts.horizontal }}</option>
							</MkRadios>
						</MkPreferenceContainer>
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
import MkInfo from '@/components/MkInfo.vue';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import FormSection from '@/components/form/section.vue';
import FormLink from '@/components/form/link.vue';
import { prefer } from '@/preferences.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { miLocalStorage } from '@/local-storage.js';
import { globalEvents } from '@/events.js';
import { claimAchievement } from '@/utility/achievements.js';
import { instance } from '@/instance.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { $i } from '@/i.js';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';
import { unisonReload } from '@/utility/unison-reload.js';

// const fontSize = ref(miLocalStorage.getItem('fontSize'));
const fontSize = prefer.model('fontSize');
const fontSizeBefore = ref(miLocalStorage.getItem('fontSize'));
const useSystemFont = ref(miLocalStorage.getItem('useSystemFont') != null);
const useBoldFont = ref(miLocalStorage.getItem('useBoldFont'));

const showAvatarDecorations = prefer.model('showAvatarDecorations');
const emojiStyle = prefer.model('emojiStyle');
const menuStyle = prefer.model('menuStyle');
const useBlurEffectForModal = prefer.model('useBlurEffectForModal');
const useBlurEffect = prefer.model('useBlurEffect');
const highlightSensitiveMedia = prefer.model('highlightSensitiveMedia');
const squareAvatars = prefer.model('squareAvatars');
const enableSeasonalScreenEffect = prefer.model('enableSeasonalScreenEffect');
const showGapBetweenNotesInTimeline = prefer.model('showGapBetweenNotesInTimeline');
const mediaListWithOneImageAppearance = prefer.model('mediaListWithOneImageAppearance');
const reactionsDisplaySize = prefer.model('reactionsDisplaySize');
const limitWidthOfReaction = prefer.model('limitWidthOfReaction');
const notificationPosition = prefer.model('notificationPosition');
const notificationStackAxis = prefer.model('notificationStackAxis');
const nsfw = prefer.model('nsfw');
const instanceTicker = prefer.model('instanceTicker');

const removeModalBgColorForBlur = prefer.model('removeModalBgColorForBlur');
const setFederationAvatarShape = prefer.model('setFederationAvatarShape');
const showUnreadNotificationsCount = prefer.model('showUnreadNotificationsCount');
const filesGridLayoutInUserPage = prefer.model('filesGridLayoutInUserPage');
const hideAvatarsInNote = prefer.model('hideAvatarsInNote');
const enableAbsoluteTime = prefer.model('enableAbsoluteTime');
const enableMarkByDate = prefer.model('enableMarkByDate');
const showReplyTargetNote = prefer.model('showReplyTargetNote');
const showReplyTargetNoteInSemiTransparent = prefer.model('showReplyTargetNoteInSemiTransparent');
const nsfwOpenBehavior = prefer.model('nsfwOpenBehavior');

watch(fontSize, () => {
	if (fontSize.value == null) {
		miLocalStorage.removeItem('fontSize');
	} else {
		miLocalStorage.setItem('fontSize', String(fontSize.value));
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
		isSquareAvatars: prefer.s.squareAvatars,
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

function reload() {
	unisonReload();
}

onMounted(() => {
	if (fontSizeBefore.value == null) {
		fontSizeBefore.value = String(fontSize.value);
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
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
