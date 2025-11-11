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
				<MkRadios v-if="instance.federation !== 'none'" v-model="searchOrigin" @update:modelValue="search()">
					<option value="combined">{{ i18n.ts.all }}</option>
					<option value="local">{{ i18n.ts.local }}</option>
					<option value="remote">{{ i18n.ts.remote }}</option>
				</MkRadios>
				-->
				<MkSelect v-model="searchOrigin" :items="searchOriginDef" small @update:modelValue="search()"></MkSelect>
			</div>
		</MkFoldableSection>
		<!-- <MkButton large primary gradate rounded @click="search">{{ i18n.ts.search }}</MkButton> -->
	</div>

	<MkFoldableSection v-if="paginator">
		<template #header>{{ i18n.ts.searchResult }}</template>
		<MkUserList :key="`searchUsers:${key}`" :paginator="paginator"/>
	</MkFoldableSection>
</div>
</template>

<script lang="ts" setup>
import { computed, markRaw, ref, shallowRef, toRef, useTemplateRef } from 'vue';
import type { Endpoints } from 'cherrypick-js';
import type { MkSelectItem } from '@/components/MkSelect.vue';
import MkUserList from '@/components/MkUserList.vue';
import MkInput from '@/components/MkInput.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import * as os from '@/os.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { useRouter } from '@/router.js';
import { Paginator } from '@/utility/paginator.js';
import MkSelect from '@/components/MkSelect.vue';

const props = withDefaults(defineProps<{
	query?: string,
	origin?: Endpoints['users/search']['req']['origin'],
}>(), {
	query: '',
	origin: 'combined',
});

const router = useRouter();

const key = ref(0);
const paginator = shallowRef<Paginator<'users/search'> | null>(null);

const searchOriginDef = computed(() => {
	const items = [
		{ label: i18n.ts.all, value: 'combined' },
		{ label: i18n.ts.local, value: 'local' },
		{ label: i18n.ts.remote, value: 'remote' },
	] satisfies MkSelectItem[];
	return items;
});

const searchQuery = ref(toRef(props, 'query').value);
const searchOrigin = ref(toRef(props, 'origin').value);

const searchQueryEl = useTemplateRef('searchQueryEl');

async function search() {
	const query = searchQuery.value.toString().trim();

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (query == null || query === '') return;

	//#region AP lookup
	if (query.startsWith('https://') && !query.includes(' ')) {
		const confirm = await os.confirm({
			type: 'info',
			text: i18n.ts.lookupConfirm,
		});
		if (!confirm.canceled) {
			const promise = misskeyApi('ap/show', {
				uri: query,
			});

			os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

			const res = await promise;

			if (res.type === 'User') {
				router.push('/@:acct/:page?', {
					params: {
						acct: `${res.object.username}@${res.object.host}`,
					},
				});
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			} else if (res.type === 'Note') {
				router.push('/notes/:noteId/:initialTab?', {
					params: {
						noteId: res.object.id,
					},
				});
			}

			return;
		}
	}
	//#endregion

	if (query.length > 1 && !query.includes(' ')) {
		if (query.startsWith('@')) {
			const confirm = await os.confirm({
				type: 'info',
				text: i18n.ts.lookupConfirm,
			});
			if (!confirm.canceled) {
				router.pushByPath(`/${query}`);
				return;
			}
		}

		if (query.startsWith('#')) {
			const confirm = await os.confirm({
				type: 'info',
				text: i18n.ts.openTagPageConfirm,
			});
			if (!confirm.canceled) {
				router.push('/user-tags/:tag', {
					params: {
						tag: query.substring(1),
					},
				});
				return;
			}
		}
	}

	paginator.value = markRaw(new Paginator('users/search', {
		limit: 10,
		offsetMode: true,
		params: {
			query: query,
			origin: instance.federation === 'none' ? 'local' : searchOrigin.value,
		},
	}));

	key.value++;
}
</script>

<style lang="scss" module>
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
