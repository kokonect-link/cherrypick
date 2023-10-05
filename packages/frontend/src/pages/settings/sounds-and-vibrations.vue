<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkRange v-model="masterVolume" :min="0" :max="1" :step="0.05" :textConverter="(v) => `${Math.floor(v * 100)}%`">
		<template #label>{{ i18n.ts.masterVolume }}</template>
	</MkRange>

	<FormSection>
		<template #label>{{ i18n.ts.sounds }}</template>
		<div class="_gaps_s">
			<MkFolder v-for="type in soundsKeys" :key="type">
				<template #label>{{ i18n.t('_sfx.' + type) }}</template>
				<template #suffix>{{ sounds[type].type ?? i18n.ts.none }}</template>

				<XSound :type="sounds[type].type" :volume="sounds[type].volume" @update="(res) => updated(type, res)"/>
			</MkFolder>
		</div>
	</FormSection>

	<MkButton danger @click="reset()"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>

	<FormSection>
		<template #label>{{ i18n.ts.vibrations }}</template>
		<div class="_gaps_s">
			<MkSwitch v-model="vibrate" @click="demoVibrate()">{{ i18n.ts.playVibrationsOnClick }}<template #caption>{{ i18n.ts.playVibrationsOnClickDescription }}</template> <span class="_beta">CherryPick</span></MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { Ref, computed, ref } from 'vue';
import XSound from './sounds.sound.vue';
import MkRange from '@/components/MkRange.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { soundConfigStore } from '@/scripts/sound.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { ColdDeviceStorage } from '@/store.js';

const masterVolume = computed(soundConfigStore.makeGetterSetter('sound_masterVolume'));

const soundsKeys = ['note', 'noteMy', 'notification', 'chat', 'chatBg', 'antenna', 'channel'] as const;

const sounds = ref<Record<typeof soundsKeys[number], Ref<any>>>({
	note: soundConfigStore.reactiveState.sound_note,
	noteMy: soundConfigStore.reactiveState.sound_noteMy,
	notification: soundConfigStore.reactiveState.sound_notification,
	chat: soundConfigStore.reactiveState.sound_chat,
	chatBg: soundConfigStore.reactiveState.sound_chatBg,
	antenna: soundConfigStore.reactiveState.sound_antenna,
	channel: soundConfigStore.reactiveState.sound_channel,
});

const vibrate = computed(ColdDeviceStorage.makeGetterSetter('vibrate'));

async function updated(type: keyof typeof sounds.value, sound) {
	const v = {
		type: sound.type,
		volume: sound.volume,
	};

	soundConfigStore.set(`sound_${type}`, v);
	sounds.value[type] = v;
}

function reset() {
	for (const sound of Object.keys(sounds.value) as Array<keyof typeof sounds.value>) {
		const v = soundConfigStore.def[`sound_${sound}`].default;
		soundConfigStore.set(`sound_${sound}`, v);
		sounds.value[sound] = v;
	}
}

function demoVibrate() {
	window.navigator.vibrate(100);
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.soundsAndVibrations,
	icon: 'ti ti-music',
});
</script>
