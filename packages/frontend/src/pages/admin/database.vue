<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="800" :marginMin="16" :marginMax="32">
		<div v-if="$i.isAdmin">
			<FormSuspense v-slot="{ result: database }" :p="databasePromiseFactory">
				<MkKeyValue v-for="table in database" :key="table[0]" oneline style="margin: 1em 0;">
					<template #key>{{ table[0] }}</template>
					<template #value>{{ bytes(table[1].size) }} ({{ number(table[1].count) }} recs)</template>
				</MkKeyValue>
			</FormSuspense>
		</div>
		<div v-else>
			<MkInfo warn>この管理設定は<strong>管理者権限</strong>が必要です。</MkInfo>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import FormSuspense from '@/components/form/suspense.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import { misskeyApi } from '@/scripts/misskey-api.js';
import bytes from '@/filters/bytes.js';
import number from '@/filters/number.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { openAccountMenu as openAccountMenu_, $i } from '@/account.js';
import MkInfo from '@/components/MkInfo.vue';

const databasePromiseFactory = () => misskeyApi('admin/get-table-stats').then(res => Object.entries(res).sort((a, b) => b[1].size - a[1].size));

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts.database,
	icon: 'ti ti-database',
}));
</script>
