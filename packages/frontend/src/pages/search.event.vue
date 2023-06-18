<template>
<div class="_gaps">
	<div class="_gaps">
		<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search" @keydown="onInputKeydown">
			<template #prefix><i class="ti ti-search"></i></template>
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
import MkNotes from '@/components/MkNotes.vue';
import MkInput from '@/components/MkInput.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkFolder from '@/components/MkFolder.vue';
import { i18n } from '@/i18n';
import MkFoldableSection from '@/components/MkFoldableSection.vue';

let key = $ref(0);
let searchQuery = $ref('');
let searchOrigin = $ref('combined');
let eventSort = $ref('startDate');
let eventPagination = $ref();
let startDate = $ref(null);
let endDate = $ref(null);

async function search(): Promise<void> {
	const query = searchQuery.toString().trim();

	// only notes/users search require the query string
	if (query == null || query === '') return;

	eventPagination = {
		endpoint: 'notes/events/search',
		limit: 10,
		offsetMode: true,
		params: {
			query: !searchQuery ? undefined : searchQuery,
			sortBy: eventSort,
			sinceDate: startDate ? (new Date(startDate)).getTime() : undefined,
			untilDate: endDate ? (new Date(endDate)).getTime() + 1000 * 3600 * 24 : undefined,
			origin: searchOrigin,
		},
	};

	key++;
}

function onInputKeydown(evt: KeyboardEvent) {
	if (evt.key === 'Enter') {
		search();
	}
}
</script>
