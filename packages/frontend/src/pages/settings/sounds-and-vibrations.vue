<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/sounds-and-vibrations" :label="i18n.ts.soundsAndVibrations" :keywords="['sounds']" icon="ti ti-music">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/speaker_high_volume_3d.png" color="#ff006f">
			<SearchKeyword>{{ i18n.ts._settings.soundsBanner }}</SearchKeyword>
		</MkFeatureBanner>

		<div class="_gaps_s">
			<SearchMarker :keywords="['mute']">
				<MkPreferenceContainer k="sound.notUseSound">
					<MkSwitch v-model="notUseSound">
						<template #label><SearchLabel>{{ i18n.ts.notUseSound }}</SearchLabel></template>
					</MkSwitch>
				</MkPreferenceContainer>
			</SearchMarker>

			<SearchMarker :keywords="['active', 'mute']">
				<MkPreferenceContainer k="sound.useSoundOnlyWhenActive">
					<MkSwitch v-model="useSoundOnlyWhenActive">
						<template #label><SearchLabel>{{ i18n.ts.useSoundOnlyWhenActive }}</SearchLabel></template>
					</MkSwitch>
				</MkPreferenceContainer>
			</SearchMarker>

			<SearchMarker :keywords="['volume', 'master']">
				<MkPreferenceContainer k="sound.masterVolume">
					<MkRange v-model="masterVolume" style="margin-bottom: 25px;" :min="0" :max="1" :step="0.05" :textConverter="(v) => `${Math.floor(v * 100)}%`">
						<template #label><SearchLabel>{{ i18n.ts.masterVolume }}</SearchLabel></template>
					</MkRange>
				</MkPreferenceContainer>
			</SearchMarker>
		</div>

		<FormSection>
			<template #label>{{ i18n.ts.sounds }}</template>
			<div class="_gaps_s">
				<MkFolder v-for="type in operationTypes" :key="type">
					<template #label>{{ i18n.ts._sfx[type] }}</template>
					<template #suffix>{{ getSoundTypeName(sounds[type].type) }}</template>
					<Suspense>
						<template #default>
							<XSound :type="sounds[type].type" :volume="sounds[type].volume" :fileId="sounds[type].fileId" :fileUrl="sounds[type].fileUrl" @update="(res) => updated(type, res)"/>
						</template>
						<template #fallback>
							<MkLoading/>
						</template>
					</Suspense>
				</MkFolder>
			</div>
		</FormSection>

		<MkButton danger @click="reset()"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>

		<FormSection>
			<template #label>{{ i18n.ts.vibrations }} <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
			<div class="_gaps_s">
				<MkPreferenceContainer k="vibrate">
					<MkSwitch v-model="vibrate" :disabled="ua">
						<template #label><SearchLabel>{{ i18n.ts.playVibrations }}</SearchLabel></template>
						<template v-if="ua" #caption><SearchKeyword>{{ i18n.ts.cannotBeUsedFunc }}</SearchKeyword> <a class="_link" @click="learnMorePlayVibrations">{{ i18n.ts.learnMore }}</a></template>
						<template v-else #caption><a class="_link" @click="demoVibrate()">{{ i18n.ts.testVibrations }}</a></template>
					</MkSwitch>
				</MkPreferenceContainer>

				<template v-if="vibrate">
					<MkPreferenceContainer k="vibrate.on.note">
						<MkSwitch v-model="vibrateNote">
							<template #label><SearchLabel>{{ i18n.ts._vibrations.note }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>

					<MkPreferenceContainer k="vibrate.on.notification">
						<MkSwitch v-model="vibrateNotification">
							<template #label><SearchLabel>{{ i18n.ts._vibrations.notification }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>

					<MkPreferenceContainer k="vibrate.on.system">
						<MkSwitch v-model="vibrateSystem" style="margin-top: 10px;">
							<template #label><SearchLabel>{{ i18n.ts._vibrations.system }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</template>
			</div>
		</FormSection>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import XSound from './sounds.sound.vue';
import type { Ref } from 'vue';
import type { SoundType, OperationType } from '@/utility/sound.js';
import type { SoundStore } from '@/preferences/def.js';
import { prefer } from '@/preferences.js';
import MkRange from '@/components/MkRange.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { operationTypes } from '@/utility/sound.js';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import { PREF_DEF } from '@/preferences/def.js';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';
import { reloadAsk } from '@/utility/reload-ask.js';
import * as os from '@/os.js';

const ua = /ipad|iphone/.test(navigator.userAgent.toLowerCase()) || !window.navigator.vibrate;

const notUseSound = prefer.model('sound.notUseSound');
const useSoundOnlyWhenActive = prefer.model('sound.useSoundOnlyWhenActive');
const masterVolume = prefer.model('sound.masterVolume');

const sounds = ref<Record<OperationType, Ref<SoundStore>>>({
	note: prefer.r['sound.on.note'],
	noteMy: prefer.r['sound.on.noteMy'],
	noteSchedulePost: prefer.r['sound.on.noteSchedulePost'],
	noteEdited: prefer.r['sound.on.noteEdited'],
	notification: prefer.r['sound.on.notification'],
	reaction: prefer.r['sound.on.reaction'],
	chatMessage: prefer.r['sound.on.chatMessage'],
});

const vibrate = prefer.model('vibrate');
const vibrateNote = prefer.model('vibrate.on.note');
const vibrateNotification = prefer.model('vibrate.on.notification');
const vibrateSystem = prefer.model('vibrate.on.system');

function getSoundTypeName(f: SoundType): string {
	switch (f) {
		case null:
			return i18n.ts.none;
		case '_driveFile_':
			return i18n.ts._soundSettings.driveFile;
		default:
			return f;
	}
}

async function updated(type: keyof typeof sounds.value, sound) {
	const v: SoundStore = {
		type: sound.type,
		fileId: sound.fileId,
		fileUrl: sound.fileUrl,
		volume: sound.volume,
	};

	prefer.commit(`sound.on.${type}`, v);
	sounds.value[type] = v;
}

function reset() {
	for (const sound of Object.keys(sounds.value) as Array<keyof typeof sounds.value>) {
		const v = PREF_DEF[`sound.on.${sound}`].default;
		prefer.commit(`sound.on.${sound}`, v);
		sounds.value[sound] = v;
	}

	os.success();
}

function demoVibrate() {
	window.navigator.vibrate(100);
}

function learnMorePlayVibrations() {
	os.alert({
		type: 'info',
		text: i18n.ts.playVibrationsDescription,
	});
}

watch([
	vibrateSystem,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.soundsAndVibrations,
	icon: 'ti ti-music',
}));
</script>
