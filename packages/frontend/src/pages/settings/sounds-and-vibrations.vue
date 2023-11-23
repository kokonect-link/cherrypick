<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection first>
		<template #label>{{ i18n.ts.sounds }}</template>
		<MkRange v-model="masterVolume" style="margin-bottom: 25px;" :min="0" :max="1" :step="0.05" :textConverter="(v) => `${Math.floor(v * 100)}%`">
			<template #label>{{ i18n.ts.masterVolume }}</template>
		</MkRange>

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
		<template #label>{{ i18n.ts.vibrations }} <span class="_beta">CherryPick</span></template>
		<div class="_gaps_s">
			<MkSwitch v-model="vibrate" @click="demoVibrate()">{{ i18n.ts.playVibrations }}<template #caption>{{ i18n.ts.playVibrationsDescription }}</template></MkSwitch>
			<MkSwitch v-if="vibrate" v-model="vibrateNote">{{ i18n.ts._vibrations.note }}</MkSwitch>
			<MkSwitch v-if="vibrate" v-model="vibrateNotification">{{ i18n.ts._vibrations.notification }}</MkSwitch>
			<MkSwitch v-if="vibrate" v-model="vibrateChat">{{ i18n.ts._vibrations.chat }}</MkSwitch>
			<MkSwitch v-if="vibrate" v-model="vibrateChatBg">{{ i18n.ts._vibrations.chatBg }}</MkSwitch>
			<MkSwitch v-if="vibrate" v-model="vibrateSystem" style="margin-top: 10px;">{{ i18n.ts._vibrations.system }}</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { Ref, computed, ref, watch } from 'vue';
import XSound from './sounds.sound.vue';
import * as os from '@/os.js';
import MkRange from '@/components/MkRange.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { defaultStore } from '@/store.js';
import { unisonReload } from '@/scripts/unison-reload.js';

const masterVolume = computed(defaultStore.makeGetterSetter('sound_masterVolume'));

const soundsKeys = ['note', 'noteMy', 'noteEdited', 'notification', 'chat', 'chatBg', 'antenna', 'channel'] as const;

const sounds = ref<Record<typeof soundsKeys[number], Ref<any>>>({
	note: defaultStore.reactiveState.sound_note,
	noteMy: defaultStore.reactiveState.sound_noteMy,
	noteEdited: defaultStore.reactiveState.sound_noteEdited,
	notification: defaultStore.reactiveState.sound_notification,
	chat: defaultStore.reactiveState.sound_chat,
	chatBg: defaultStore.reactiveState.sound_chatBg,
	antenna: defaultStore.reactiveState.sound_antenna,
	channel: defaultStore.reactiveState.sound_channel,
});

const vibrate = computed(defaultStore.makeGetterSetter('vibrate'));
const vibrateNote = computed(defaultStore.makeGetterSetter('vibrateNote'));
const vibrateNotification = computed(defaultStore.makeGetterSetter('vibrateNotification'));
const vibrateChat = computed(defaultStore.makeGetterSetter('vibrateChat'));
const vibrateChatBg = computed(defaultStore.makeGetterSetter('vibrateChatBg'));
const vibrateSystem = computed(defaultStore.makeGetterSetter('vibrateSystem'));

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

async function updated(type: keyof typeof sounds.value, sound) {
	const v = {
		type: sound.type,
		volume: sound.volume,
	};

	defaultStore.set(`sound_${type}`, v);
	sounds.value[type] = v;
}

function reset() {
	for (const sound of Object.keys(sounds.value) as Array<keyof typeof sounds.value>) {
		const v = defaultStore.def[`sound_${sound}`].default;
		defaultStore.set(`sound_${sound}`, v);
		sounds.value[sound] = v;
	}
}

function demoVibrate() {
	window.navigator.vibrate(100);
}

watch([
	vibrateSystem,
], async () => {
	await reloadAsk();
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.soundsAndVibrations,
	icon: 'ti ti-music',
});
</script>
