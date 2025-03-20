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
					<MkPreferenceContainer k="enableHomeTimeline">
						<MkSwitch v-model="enableHomeTimeline">
							<template #label><i class="ti ti-home"></i> <SearchLabel>{{ i18n.ts._timelines.home }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'local']">
					<MkPreferenceContainer k="enableLocalTimeline">
						<MkSwitch v-model="enableLocalTimeline">
							<template #label><i class="ti ti-planet"></i> <SearchLabel>{{ i18n.ts._timelines.local }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'social']">
					<MkPreferenceContainer k="enableSocialTimeline">
						<MkSwitch v-model="enableSocialTimeline">
							<template #label><i class="ti ti-universe"></i> <SearchLabel>{{ i18n.ts._timelines.social }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'global']">
					<MkPreferenceContainer k="enableGlobalTimeline">
						<MkSwitch v-model="enableGlobalTimeline">
							<template #label><i class="ti ti-world"></i> <SearchLabel>{{ i18n.ts._timelines.global }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'bubble']">
					<MkPreferenceContainer k="enableBubbleTimeline">
						<MkSwitch v-model="enableBubbleTimeline">
							<template #label><i class="ti ti-droplet"></i> <SearchLabel>{{ i18n.ts._timelines.bubble }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>
			</div>
		</FormSection>

		<FormSection>
			<div class="_gaps_m">
				<SearchMarker :keywords="['enable', 'list']">
					<MkPreferenceContainer k="enableListTimeline">
						<MkSwitch v-model="enableListTimeline">
							<template #label><i class="ti ti-list"></i> <SearchLabel>{{ i18n.ts.lists }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'antenna']">
					<MkPreferenceContainer k="enableAntennaTimeline">
						<MkSwitch v-model="enableAntennaTimeline">
							<template #label><i class="ti ti-antenna"></i> <SearchLabel>{{ i18n.ts.antennas }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['enable', 'channel']">
					<MkPreferenceContainer k="enableChannelTimeline">
						<MkSwitch v-model="enableChannelTimeline">
							<template #label><i class="ti ti-device-tv"></i> <SearchLabel>{{ i18n.ts.channel }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
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
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import FormSection from '@/components/form/section.vue';
import { prefer } from '@/preferences.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { reloadAsk } from '@/utility/reload-ask.js';

function save() {
	reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
}

const enableHomeTimeline = prefer.model('enableHomeTimeline');
const enableLocalTimeline = prefer.model('enableLocalTimeline');
const enableSocialTimeline = prefer.model('enableSocialTimeline');
const enableGlobalTimeline = prefer.model('enableGlobalTimeline');
const enableBubbleTimeline = prefer.model('enableBubbleTimeline');
const enableListTimeline = prefer.model('enableListTimeline');
const enableAntennaTimeline = prefer.model('enableAntennaTimeline');
const enableChannelTimeline = prefer.model('enableChannelTimeline');

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.timeline,
	icon: 'ti ti-align-left',
}));
</script>
