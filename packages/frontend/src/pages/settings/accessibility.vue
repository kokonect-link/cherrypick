<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/accessibility" :label="i18n.ts.accessibility" :keywords="['accessibility']" icon="ti ti-accessible">
	<div class="_gaps_m">
		<div class="_gaps_s">
			<SearchMarker :keywords="['animation', 'motion', 'reduce']">
				<MkSwitch v-model="reduceAnimation">
					<template #label><SearchLabel>{{ i18n.ts.reduceUiAnimation }}</SearchLabel></template>
				</MkSwitch>
			</SearchMarker>

			<SearchMarker :keywords="['disable', 'animation', 'image', 'photo', 'picture', 'media', 'thumbnail', 'gif']">
				<MkSwitch v-model="disableShowingAnimatedImages">
					<template #label><SearchLabel>{{ i18n.ts.disableShowingAnimatedImages }}</SearchLabel></template>
					<template #caption><i class="ti ti-alert-triangle" style="color: var(--MI_THEME-warn);"></i> {{ i18n.ts.disableShowingAnimatedImagesDescription }}</template>
				</MkSwitch>
			</SearchMarker>

			<MkDisableSection :disabled="disableShowingAnimatedImages">
				<SearchMarker :keywords="['disable', 'animation', 'image', 'photo', 'picture', 'media', 'thumbnail', 'gif']">
					<MkSelect v-model="showingAnimatedImages" style="margin-left: 44px;">
						<option value="always">{{ i18n.ts._showingAnimatedImages.always }}</option>
						<option value="interaction">{{ i18n.ts._showingAnimatedImages.interaction }}</option>
						<option value="inactive">{{ i18n.ts._showingAnimatedImages.inactive }}</option>
						<template #caption>{{ i18n.ts.showingAnimatedImagesDescription }}</template>
					</MkSelect>
				</SearchMarker>
			</MkDisableSection>

			<MkDisableSection :disabled="!defaultStore.state.advancedMfm">
				<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'animated']">
					<MkSwitch v-model="animatedMfm">
						<template #label><SearchLabel>{{ i18n.ts.enableAnimatedMfm }}</SearchLabel></template>
					</MkSwitch>

					<div :class="$style.mfmPreview">
						<div v-if="defaultStore.state.advancedMfm && animatedMfm" style="margin: 0 0 8px; font-size: 1.5em;">
							<Mfm :key="emojiStyle" text="$[jelly 🍮] $[spin 🍪] $[shake 🍭]"/>
						</div>
						<div v-else style="margin: 0 0 8px; font-size: 1.5em;">
							<Mfm :key="emojiStyle" text="🍮 🍪 🍭"/>
						</div>
					</div>
				</SearchMarker>
			</MkDisableSection>

			<SearchMarker :keywords="['swipe', 'horizontal', 'tab']">
				<MkSwitch v-model="enableHorizontalSwipe">
					<template #label><SearchLabel>{{ i18n.ts.enableHorizontalSwipe }}</SearchLabel></template>
				</MkSwitch>
			</SearchMarker>

			<SearchMarker :keywords="['keep', 'screen', 'display', 'on']">
				<MkSwitch v-model="keepScreenOn">
					<template #label><SearchLabel>{{ i18n.ts.keepScreenOn }}</SearchLabel></template>
				</MkSwitch>
			</SearchMarker>

			<SearchMarker :keywords="['native', 'system', 'video', 'audio', 'player', 'media']">
				<MkSwitch v-model="useNativeUIForVideoAudioPlayer">
					<template #label><SearchLabel>{{ i18n.ts.useNativeUIForVideoAudioPlayer }}</SearchLabel></template>
				</MkSwitch>
			</SearchMarker>
		</div>

		<SearchMarker :keywords="['contextmenu', 'system', 'native']">
			<MkSelect v-model="contextMenu">
				<template #label><SearchLabel>{{ i18n.ts._contextMenu.title }}</SearchLabel></template>
				<option value="app">{{ i18n.ts._contextMenu.app }}</option>
				<option value="appWithShift">{{ i18n.ts._contextMenu.appWithShift }}</option>
				<option value="native">{{ i18n.ts._contextMenu.native }}</option>
			</MkSelect>
		</SearchMarker>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import { defaultStore } from '@/store.js';
import { reloadAsk } from '@/scripts/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import MkDisableSection from '@/components/MkDisableSection.vue';

const reduceAnimation = computed(defaultStore.makeGetterSetter('animation', v => !v, v => !v));
const animatedMfm = computed(defaultStore.makeGetterSetter('animatedMfm'));
const disableShowingAnimatedImages = computed(defaultStore.makeGetterSetter('disableShowingAnimatedImages'));
const keepScreenOn = computed(defaultStore.makeGetterSetter('keepScreenOn'));
const enableHorizontalSwipe = computed(defaultStore.makeGetterSetter('enableHorizontalSwipe'));
const useNativeUIForVideoAudioPlayer = computed(defaultStore.makeGetterSetter('useNativeUIForVideoAudioPlayer'));
const contextMenu = computed(defaultStore.makeGetterSetter('contextMenu'));

const showingAnimatedImages = computed(defaultStore.makeGetterSetter('showingAnimatedImages'));
const emojiStyle = computed(defaultStore.makeGetterSetter('emojiStyle'));

watch([
	keepScreenOn,
	contextMenu,
	disableShowingAnimatedImages,
	showingAnimatedImages,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
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
