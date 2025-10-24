<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkPagination :paginator="props.paginator" withControl>
	<template #empty><MkResult type="empty" :text="i18n.ts.noNotes"/></template>

	<template #default="{ items: user }">
		<div :class="$style.stream">
			<XFiles v-for="item in user" :key="item.user.id" :user="item.user" :note="item"/>
		</div>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import { Paginator } from '@/utility/paginator.js';
import MkPagination from '@/components/MkPagination.vue';
import XFiles from '@/pages/user/index.timeline.files.files.vue';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	paginator: Paginator<'users/notes'>;
}>();
</script>

<style lang="scss" module>
.stream {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(224px, 1fr));
	grid-gap: 6px;
}

@container (max-width: 785px) {
	.stream {
		grid-template-columns: repeat(auto-fill, minmax(192px, 1fr));
	}
}

@container (max-width: 660px) {
	.stream {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	}
}

@container (max-width: 530px) {
	.stream {
		grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
	}
}
</style>
