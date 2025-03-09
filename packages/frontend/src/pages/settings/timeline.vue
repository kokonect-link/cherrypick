<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/timeline" :label="i18n.ts.timeline" :keywords="['timeline']" icon="ti ti-align-left">
	<div class="_gaps_m">
		<FormSection first>
			<template #label>{{ i18n.ts.timeline }}</template>
			<div class="_gaps_m">
				<SearchMarker :keywords="['enable', 'home']">
					<MkSwitch v-model="enableHomeTimeline">
						<template #label><i class="ti ti-home"></i> <SearchLabel>{{ i18n.ts._timelines.home }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'local']">
					<MkSwitch v-model="enableLocalTimeline">
						<template #label><i class="ti ti-planet"></i> <SearchLabel>{{ i18n.ts._timelines.local }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'social']">
					<MkSwitch v-model="enableSocialTimeline">
						<template #label><i class="ti ti-universe"></i> <SearchLabel>{{ i18n.ts._timelines.social }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'global']">
					<MkSwitch v-model="enableGlobalTimeline">
						<template #label><i class="ti ti-world"></i> <SearchLabel>{{ i18n.ts._timelines.global }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'bubble']">
					<MkSwitch v-model="enableBubbleTimeline">
						<template #label><i class="ti ti-droplet"></i> <SearchLabel>{{ i18n.ts._timelines.bubble }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>
			</div>
		</FormSection>

		<FormSection>
			<div class="_gaps_m">
				<SearchMarker :keywords="['enable', 'list']">
					<MkSwitch v-model="enableListTimeline">
						<template #label><i class="ti ti-list"></i> <SearchLabel>{{ i18n.ts.lists }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'antenna']">
					<MkSwitch v-model="enableAntennaTimeline">
						<template #label><i class="ti ti-antenna"></i> <SearchLabel>{{ i18n.ts.antennas }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'channel']">
					<MkSwitch v-model="enableChannelTimeline">
						<template #label><i class="ti ti-device-tv"></i> <SearchLabel>{{ i18n.ts.channel }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>
			</div>
		</FormSection>

		<MkButton primary class="save" @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { reloadAsk } from '@/scripts/reload-ask.js';

function save() {
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
}

const enableHomeTimeline = computed(defaultStore.makeGetterSetter('enableHomeTimeline'));
const enableLocalTimeline = computed(defaultStore.makeGetterSetter('enableLocalTimeline'));
const enableSocialTimeline = computed(defaultStore.makeGetterSetter('enableSocialTimeline'));
const enableGlobalTimeline = computed(defaultStore.makeGetterSetter('enableGlobalTimeline'));
const enableBubbleTimeline = computed(defaultStore.makeGetterSetter('enableBubbleTimeline'));
const enableListTimeline = computed(defaultStore.makeGetterSetter('enableListTimeline'));
const enableAntennaTimeline = computed(defaultStore.makeGetterSetter('enableAntennaTimeline'));
const enableChannelTimeline = computed(defaultStore.makeGetterSetter('enableChannelTimeline'));

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts.timeline,
	icon: 'ti ti-align-left',
}));
</script>
