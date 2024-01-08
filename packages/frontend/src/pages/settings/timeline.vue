<!--
SPDX-FileCopyrightText: syuilo and noridev and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection first>
		<template #label>{{ i18n.ts.timeline }}</template>
		<div class="_gaps_m">
			<MkSwitch v-model="enableHomeTimeline"><i class="ti ti-home"></i> {{ i18n.ts._timelines.home }}</MkSwitch>
			<MkSwitch v-model="enableLocalTimeline"><i class="ti ti-planet"></i> {{ i18n.ts._timelines.local }}</MkSwitch>
			<MkSwitch v-model="enableSocialTimeline"><i class="ti ti-universe"></i> {{ i18n.ts._timelines.social }}</MkSwitch>
			<MkSwitch v-model="enableGlobalTimeline"><i class="ti ti-world"></i> {{ i18n.ts._timelines.global }}</MkSwitch>
		</div>
	</FormSection>

	<FormSection>
		<div class="_gaps_m">
			<MkSwitch v-model="enableListTimeline"><i class="ti ti-list"></i> {{ i18n.ts.lists }}</MkSwitch>
			<MkSwitch v-model="enableAntennaTimeline"><i class="ti ti-antenna"></i> {{ i18n.ts.antennas }}</MkSwitch>
			<MkSwitch v-model="enableChannelTimeline"><i class="ti ti-device-tv"></i> {{ i18n.ts.channel }}</MkSwitch>
		</div>
	</FormSection>

	<MkButton primary class="save" @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import { defaultStore } from '@/store.js';
import * as os from '@/os.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

function save() {
	reloadAsk();
}

const enableHomeTimeline = computed(defaultStore.makeGetterSetter('enableHomeTimeline'));
const enableLocalTimeline = computed(defaultStore.makeGetterSetter('enableLocalTimeline'));
const enableSocialTimeline = computed(defaultStore.makeGetterSetter('enableSocialTimeline'));
const enableGlobalTimeline = computed(defaultStore.makeGetterSetter('enableGlobalTimeline'));
const enableListTimeline = computed(defaultStore.makeGetterSetter('enableListTimeline'));
const enableAntennaTimeline = computed(defaultStore.makeGetterSetter('enableAntennaTimeline'));
const enableChannelTimeline = computed(defaultStore.makeGetterSetter('enableChannelTimeline'));

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.timeline,
	icon: 'ti ti-align-left',
});
</script>
