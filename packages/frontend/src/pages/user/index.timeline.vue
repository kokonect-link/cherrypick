<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header>
		<MkTab v-model="include" :class="$style.tab">
			<option :value="null">{{ i18n.ts.notes }}</option>
			<option value="all">{{ i18n.ts.all }}</option>
			<option value="featured">{{ i18n.ts.featured }}</option>
			<option value="files">{{ i18n.ts.withFiles }}</option>
		</MkTab>
	</template>
	<MkNotes v-if="include === 'featured'" :noGap="true" :pagination="featuredPagination" :class="$style.tl"/>
	<MkNotes v-else :noGap="true" :pagination="pagination" :class="$style.tl"/>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNotes from '@/components/MkNotes.vue';
import MkTab from '@/components/MkTab.vue';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const include = ref<string | null>(null);

const pagination = {
	endpoint: include.value === 'featured' ? 'users/featured-notes' : 'users/notes' as const,
	limit: 10,
	params: computed(() => ({
		userId: props.user.id,
		withRenotes: include.value === 'all',
		withReplies: include.value === 'all' || include.value === 'files',
		withChannelNotes: include.value === 'all',
		withFiles: include.value === 'files',
	})),
};

const featuredPagination = {
	endpoint: 'users/featured-notes' as const,
	limit: 10,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--margin) / 2) 0;
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}
</style>
