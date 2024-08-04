<!--
SPDX-FileCopyrightText: marie and other Sharkey contributors, and esurio
SPDX-License-Identifier: AGPL-3.0-only
-->
<template>
<MkWindow ref="window" :initialWidth="600" :initialHeight="450" :canResize="true" @closed="emit('closed')">
	<template #header>
		<i class="ti ti-zoom" style="margin-right: 0.5em;"></i>
		<b>{{ i18n.ts.searchResult }}</b>
	</template>
	<MkNotes :key="props.noteKey" :pagination="props.notePagination"/>
</MkWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import type { Paging } from '@/components/MkPagination.vue';
import MkNotes from '@/components/MkNotes.vue';
import MkWindow from '@/components/MkWindow.vue';
import { i18n } from '@/i18n';

const props = defineProps<{
	noteKey: string | number | symbol | undefined;
	notePagination: Paging;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

</script>

<style lang="scss" module>

</style>
