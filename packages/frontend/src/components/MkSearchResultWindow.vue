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
	<MkNotesTimeline :key="props.noteKey" :paginator="props.notePaginator"/>
</MkWindow>
</template>

<script lang="ts" setup>
import { Paginator } from '@/utility/paginator.js';
import MkNotesTimeline from '@/components/MkNotesTimeline.vue';
import MkWindow from '@/components/MkWindow.vue';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	noteKey: string | number | symbol | undefined;
	notePaginator: Paginator<'notes/search'>;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();
</script>
