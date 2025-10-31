<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<div class="_gaps">
		<MkInput ref="searchQueryEl" v-model="searchQuery" :large="true" :autofocus="true" type="search" @enter.prevent="search">
			<template #prefix><i class="ti ti-search"></i></template>
			<template v-if="searchQuery != ''" #suffix>
				<button type="button" :class="$style.searchInputButton" tabindex="-1" @click="searchQuery = ''; searchQueryEl?.focus();"><i class="ti ti-x"></i></button>
				<button type="button" :class="$style.searchInputButton" tabindex="-1" @click="search"><i class="ti ti-search"></i></button>
			</template>
		</MkInput>
		<MkFoldableSection expanded>
			<template #header>{{ i18n.ts.options }}</template>

			<div class="_gaps_m">
				<!--
				<MkRadios v-model="searchOrigin" @update:modelValue="search()">
					<option value="combined">{{ i18n.ts.all }}</option>
					<option value="local">{{ i18n.ts.local }}</option>
					<option value="remote">{{ i18n.ts.remote }}</option>
				</MkRadios>
				-->
				<MkSelect v-model="searchOrigin" :items="searchOriginDef" small @update:modelValue="search()"></MkSelect>

				<div :class="$style.subOptionRoot">
					<MkSelect v-model="eventSort" :items="eventSortDef" small>
						<template #label>{{ i18n.ts.sort }}</template>
					</MkSelect>

					<section>
						<MkInput v-model="startDate" small style="margin-top: 10px;" type="date">
							<template #label>{{ i18n.ts._event.startDate }}</template>
						</MkInput>
						<MkInput v-model="endDate" small style="margin-top: 10px;" type="date">
							<template #label>{{ i18n.ts._event.endDate }}</template>
						</MkInput>
					</section>
				</div>
			</div>
		</MkFoldableSection>
		<!--
		<div>
			<MkButton large primary gradate rounded style="margin: 0 auto;" @click="search">{{ i18n.ts.search }}</MkButton>
		</div>
		-->
	</div>

	<MkFoldableSection v-if="paginator">
		<template #header>{{ i18n.ts.searchResult }}</template>
		<MkNotesTimeline :key="key" :paginator="paginator" :getDate="eventSort === 'startDate' ? note => note.event.start : undefined"/>
	</MkFoldableSection>
</div>
</template>

<script lang="ts" setup>
import { computed, markRaw, ref, shallowRef, useTemplateRef } from 'vue';
import type { MkSelectItem } from '@/components/MkSelect.vue';
import MkNotesTimeline from '@/components/MkNotesTimeline.vue';
import MkInput from '@/components/MkInput.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkFolder from '@/components/MkFolder.vue';
import { i18n } from '@/i18n.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { Paginator } from '@/utility/paginator.js';

const key = ref(0);
const paginator = shallowRef<Paginator<'notes/events/search'> | null>(null);

const searchOriginDef = computed(() => {
	const items = [
		{ label: i18n.ts.all, value: 'combined' },
		{ label: i18n.ts.local, value: 'local' },
		{ label: i18n.ts.remote, value: 'remote' },
	] satisfies MkSelectItem[];
	return items;
});

const eventSortDef = computed(() => {
	const items = [
		{ label: i18n.ts._event.startDate, value: 'startDate' },
		{ label: i18n.ts.reverseChronological, value: 'createdAt' },
	] satisfies MkSelectItem[];
	return items;
});

const searchQuery = ref('');
const searchOrigin = ref('combined');

const eventSort = ref('startDate');
const startDate = ref<any>(null);
const endDate = ref<any>(null);

const searchQueryEl = useTemplateRef('searchQueryEl');

async function search(): Promise<void> {
	const query = searchQuery.value.toString().trim();

	// only notes/users search require the query string
	if (query == null || query === '') return;

	paginator.value = markRaw(new Paginator('notes/events/search', {
		limit: 10,
		offsetMode: true,
		params: {
			query: !searchQuery.value ? undefined : searchQuery.value,
			sortBy: eventSort.value,
			sinceDate: startDate.value ? (new Date(startDate.value)).getTime() : undefined,
			untilDate: endDate.value ? (new Date(endDate.value)).getTime() + 1000 * 3600 * 24 : undefined,
			origin: searchOrigin.value,
		},
	}));

	key.value++;
}
</script>

<style lang="scss" module>
.subOptionRoot {
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
	padding: var(--MI-margin);
}

.searchInputButton {
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
