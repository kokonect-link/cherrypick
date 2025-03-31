<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<input v-model="query" :class="$style.input" type="search" :placeholder="q" @click.stop>
	<button :class="$style.button" @click.stop="search"><i class="ti ti-search"></i> {{ i18n.ts.searchByGoogle }}</button>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { i18n } from '@/i18n.js';
import { store } from '@/store.js';

const props = defineProps<{
	q: string;
}>();

const query = ref(props.q);

const search = () => {
	const sp = new URLSearchParams();
	let url = '';
	switch (store.s.searchEngine) {
		case 'google':
			sp.append('q', query.value);
			url = `https://www.google.com/search?${sp.toString()}`;
			break;
		case 'bing':
			sp.append('q', query.value);
			url = `https://www.bing.com/search?${sp.toString()}`;
			break;
		case 'yahoo':
			sp.append('p', query.value);
			url = `https://search.yahoo.com/search?${sp.toString()}`;
			break;
		case 'baidu':
			// see detail: https://www.jademond.com/magazine/baidu-search-url-parameters/
			sp.append('wd', query.value);
			url = `https://www.baidu.com/s?${sp.toString()}`;
			break;
		case 'naver':
			sp.append('query', query.value);
			url = `https://search.naver.com/search.naver?${sp.toString()}`;
			break;
		case 'daum':
			sp.append('q', query.value);
			url = `https://search.daum.net/search?${sp.toString()}`;
			break;
		case 'duckduckgo':
			sp.append('q', query.value);
			url = `https://duckduckgo.com/?${sp.toString()}`;
			break;
		case 'other':
			sp.append(store.s.searchEngineUrlQuery, query.value);
			url = `${store.s.searchEngineUrl}${sp.toString()}`;
			break;
	}

	window.open(url, '_blank', 'noopener');
};
</script>

<style lang="scss" module>
.root {
	display: flex;
	margin: 8px 0;
}

.input {
	flex-shrink: 1;
	padding: 10px;
	width: 100%;
	height: 40px;
	font-size: 16px;
	border: solid 1px var(--MI_THEME-divider);
	border-radius: 4px 0 0 4px;
	-webkit-appearance: textfield;
}

.button {
	flex-shrink: 0;
	margin: 0;
	padding: 0 16px;
	border: solid 1px var(--MI_THEME-divider);
	border-left: none;
	border-radius: 0 4px 4px 0;

	&:active {
		box-shadow: 0 2px 4px rgba(#000, 0.15) inset;
	}
}
</style>
