<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/accessibility" :label="i18n.ts.accessibility" :keywords="['accessibility']" icon="ti ti-accessible">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/mens_room_3d.png" color="#0011ff">
			<SearchKeyword>{{ i18n.ts._settings.accessibilityBanner }}</SearchKeyword>
		</MkFeatureBanner>

		<div class="_gaps_s">
			<SearchMarker :keywords="['animation', 'motion', 'reduce']">
				<MkPreferenceContainer k="animation">
					<MkSwitch v-model="reduceAnimation">
						<template #label><SearchLabel>{{ i18n.ts.reduceUiAnimation }}</SearchLabel></template>
					</MkSwitch>
				</MkPreferenceContainer>
			</SearchMarker>

			<SearchMarker :keywords="['disable', 'animation', 'image', 'photo', 'picture', 'media', 'thumbnail', 'gif']">
				<MkPreferenceContainer k="disableShowingAnimatedImages">
					<MkSwitch v-model="disableShowingAnimatedImages">
						<template #label><SearchLabel>{{ i18n.ts.disableShowingAnimatedImages }}</SearchLabel></template>
						<template #caption><i class="ti ti-alert-triangle" style="color: var(--MI_THEME-warn);"></i> {{ i18n.ts.disableShowingAnimatedImagesDescription }}</template>
					</MkSwitch>
				</MkPreferenceContainer>

				<MkDisableSection :disabled="disableShowingAnimatedImages">
					<MkPreferenceContainer k="disableShowingAnimatedImages">
						<MkSelect v-model="showingAnimatedImages" style="margin-left: 44px;">
							<option value="always">{{ i18n.ts._showingAnimatedImages.always }}</option>
							<option value="interaction">{{ i18n.ts._showingAnimatedImages.interaction }}</option>
							<option value="inactive">{{ i18n.ts._showingAnimatedImages.inactive }}</option>
							<template #caption><SearchKeyword>{{ i18n.ts.showingAnimatedImagesDescription }}</SearchKeyword></template>
						</MkSelect>
					</MkPreferenceContainer>
				</MkDisableSection>
			</SearchMarker>

			<MkDisableSection :disabled="!prefer.s.advancedMfm">
				<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'animated']">
					<MkPreferenceContainer k="animatedMfm">
						<MkSwitch v-model="animatedMfm">
							<template #label><SearchLabel>{{ i18n.ts.enableAnimatedMfm }}</SearchLabel></template>
						</MkSwitch>

						<div :class="$style.mfmPreview">
							<div v-if="prefer.s.advancedMfm && animatedMfm" style="margin: 0 0 8px; font-size: 1.5em;">
								<Mfm :key="emojiStyle" text="$[jelly 🍮] $[spin 🍪] $[shake 🍭]"/>
							</div>
							<div v-else style="margin: 0 0 8px; font-size: 1.5em;">
								<Mfm :key="emojiStyle" text="🍮 🍪 🍭"/>
							</div>
						</div>
					</MkPreferenceContainer>
				</SearchMarker>
			</MkDisableSection>

			<SearchMarker :keywords="['swipe', 'horizontal', 'tab']">
				<MkPreferenceContainer k="enableHorizontalSwipe">
					<MkSwitch v-model="enableHorizontalSwipe">
						<template #label><SearchLabel>{{ i18n.ts.enableHorizontalSwipe }}</SearchLabel></template>
					</MkSwitch>
				</MkPreferenceContainer>
			</SearchMarker>

			<SearchMarker :keywords="['keep', 'screen', 'display', 'on']">
				<MkPreferenceContainer k="keepScreenOn">
					<MkSwitch v-model="keepScreenOn">
						<template #label><SearchLabel>{{ i18n.ts.keepScreenOn }}</SearchLabel></template>
					</MkSwitch>
				</MkPreferenceContainer>
			</SearchMarker>

			<SearchMarker :keywords="['native', 'system', 'video', 'audio', 'player', 'media']">
				<MkPreferenceContainer k="useNativeUiForVideoAudioPlayer">
					<MkSwitch v-model="useNativeUiForVideoAudioPlayer">
						<template #label><SearchLabel>{{ i18n.ts.useNativeUIForVideoAudioPlayer }}</SearchLabel></template>
					</MkSwitch>
				</MkPreferenceContainer>
			</SearchMarker>

			<SearchMarker :keywords="['text', 'selectable']">
				<MkPreferenceContainer k="makeEveryTextElementsSelectable">
					<MkSwitch v-model="makeEveryTextElementsSelectable">
						<template #label><SearchLabel>{{ i18n.ts._settings.makeEveryTextElementsSelectable }}</SearchLabel></template>
						<template #caption>{{ i18n.ts._settings.makeEveryTextElementsSelectable_description }}</template>
					</MkSwitch>
				</MkPreferenceContainer>
			</SearchMarker>
		</div>

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

		<SearchMarker :keywords="['contextmenu', 'system', 'native']">
			<MkPreferenceContainer k="contextMenu">
				<MkSelect v-model="contextMenu">
					<template #label><SearchLabel>{{ i18n.ts._contextMenu.title }}</SearchLabel></template>
					<option value="app">{{ i18n.ts._contextMenu.app }}</option>
					<option value="appWithShift">{{ i18n.ts._contextMenu.appWithShift }}</option>
					<option value="native">{{ i18n.ts._contextMenu.native }}</option>
				</MkSelect>
			</MkPreferenceContainer>
		</SearchMarker>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import { prefer } from '@/preferences.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';
import MkDisableSection from '@/components/MkDisableSection.vue';

const reduceAnimation = prefer.model('animation', v => !v, v => !v);
const animatedMfm = prefer.model('animatedMfm');
const disableShowingAnimatedImages = prefer.model('disableShowingAnimatedImages');
const keepScreenOn = prefer.model('keepScreenOn');
const enableHorizontalSwipe = prefer.model('enableHorizontalSwipe');
const useNativeUiForVideoAudioPlayer = prefer.model('useNativeUiForVideoAudioPlayer');
const contextMenu = prefer.model('contextMenu');
const menuStyle = prefer.model('menuStyle');
const makeEveryTextElementsSelectable = prefer.model('makeEveryTextElementsSelectable');

const showingAnimatedImages = prefer.model('showingAnimatedImages');
const emojiStyle = prefer.model('emojiStyle');

watch([
	keepScreenOn,
	contextMenu,
	makeEveryTextElementsSelectable,
	disableShowingAnimatedImages,
	showingAnimatedImages,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.accessibility,
	icon: 'ti ti-accessible',
}));
</script>

<style lang="scss" module>
.mfmPreview {
	margin-top: 8px;
	text-align: center;
	max-width: 110px;
}
</style>
