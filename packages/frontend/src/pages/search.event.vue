<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<div class="_gaps">
		<MkInput ref="searchQueryEl" v-model="searchQuery" :large="true" :autofocus="true" type="search" @enter.prevent="search">
			<template #prefix><i class="ti ti-search"></i></template>
			<template v-if="searchQuery != ''" #suffix><button type="button" :class="$style.deleteBtn" tabindex="-1" @click="searchQuery = ''; searchQueryEl?.focus();"><i class="ti ti-x"></i></button></template>
		</MkInput>
		<MkRadios v-model="searchOrigin" @update:modelValue="search()">
			<option value="combined">{{ i18n.ts.all }}</option>
			<option value="local">{{ i18n.ts.local }}</option>
			<option value="remote">{{ i18n.ts.remote }}</option>
		</MkRadios>
		<MkFolder>
			<template #label>{{ i18n.ts.options }}</template>

			<MkSelect v-model="eventSort" small>
				<template #label>{{ i18n.ts.sort }}</template>
				<option value="startDate">{{ i18n.ts._event.startDate }}</option>
				<option value="createdAt">{{ i18n.ts.reverseChronological }}</option>
			</MkSelect>

			<section>
				<MkInput v-model="startDate" small style="margin-top: 10px;" type="date">
					<template #label>{{ i18n.ts._event.startDate }}</template>
				</MkInput>
				<MkInput v-model="endDate" small style="margin-top: 10px;" type="date">
					<template #label>{{ i18n.ts._event.endDate }}</template>
				</MkInput>
			</section>
		</MkFolder>
		<div>
			<MkButton large primary gradate rounded style="margin: 0 auto;" @click="search">{{ i18n.ts.search }}</MkButton>
		</div>
	</div>

	<MkFoldableSection v-if="eventPagination">
		<template #header>{{ i18n.ts.searchResult }}</template>
		<MkNotes :key="key" :pagination="eventPagination" :getDate="eventSort === 'startDate' ? note => note.event.start : undefined"/>
	</MkFoldableSection>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { Paging } from '@/components/MkPagination.vue';
import MkNotes from '@/components/MkNotes.vue';
import MkInput from '@/components/MkInput.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkFolder from '@/components/MkFolder.vue';
import { i18n } from '@/i18n.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';

const key = ref(0);
const eventPagination = ref<Paging<'notes/events/search'>>();

const searchQuery = ref('');
const searchOrigin = ref('combined');

const eventSort = ref('startDate');
const startDate = ref<any>(null);
const endDate = ref<any>(null);

const searchQueryEl = ref(null);

async function search(): Promise<void> {
	const query = searchQuery.value.toString().trim();

	// only notes/users search require the query string
	if (query == null || query === '') return;

	eventPagination.value = {
		endpoint: 'notes/events/search',
		limit: 10,
		offsetMode: true,
		params: {
			query: !searchQuery.value ? undefined : searchQuery.value,
			sortBy: eventSort.value,
			sinceDate: startDate.value ? (new Date(startDate.value)).getTime() : undefined,
			untilDate: endDate.value ? (new Date(endDate.value)).getTime() + 1000 * 3600 * 24 : undefined,
			origin: searchOrigin.value,
		},
	};

	key.value++;
}
</script>

<style lang="scss" module>
.deleteBtn {
	position: relative;
	z-index: 2;
	margin: 0 auto;
	border: none;
	background: none;
	color: inherit;
	font-size: 0.8em;
	cursor: pointer;
	pointer-events: auto;
	-webkit-tap-highlight-color: transparent;
}
</style>
