<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<PageWithHeader :tabs="headerTabs">
		<div class="_spacer" style="--MI_SPACER-w: 900px;">
			<div class="_gaps_m">
				<MkPagination :paginator="paginator" :displayLimit="50">
					<template #default="{ items }">
						<div class="_gaps_s">
							<MkApprovalUser v-for="item in items" :key="item.id" :user="(item as any)" :onDeleted="deleted"/>
						</div>
					</template>
				</MkPagination>
			</div>
		</div>
	</PageWithHeader>
</div>
</template>

<script lang="ts" setup>
import { computed, markRaw } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkApprovalUser from '@/components/MkApprovalUser.vue';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { Paginator } from '@/utility/paginator.js';

const paginator = markRaw(new Paginator('admin/show-users', {
	limit: 10,
	params: {
		sort: '+createdAt',
		state: 'pending',
		origin: 'local',
	},
	offsetMode: true,
}));

function deleted(id: string) {
	paginator.removeItem(id);
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.approvals,
	icon: 'ti ti-notes',
}));
</script>

<style lang="scss" module>
.inputs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.input {
	flex: 1;
}
</style>
