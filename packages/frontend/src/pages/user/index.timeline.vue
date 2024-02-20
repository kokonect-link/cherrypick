<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header>
		<MkTab v-if="($i && ($i.id === user.id || $i.isAdmin || $i.isModerator)) || user.publicReactions" v-model="tab" :class="$style.tab">
			<option :value="null">{{ i18n.ts.notes }}</option>
			<option value="all">{{ i18n.ts.all }}</option>
			<option value="featured">{{ i18n.ts.featured }}</option>
			<option value="files">{{ i18n.ts.withFiles }}</option>
			<option value="reactions">{{ i18n.ts.reaction }}</option>
		</MkTab>
		<MkTab v-else v-model="tab" :class="$style.tab">
			<option :value="null">{{ i18n.ts.notes }}</option>
			<option value="all">{{ i18n.ts.all }}</option>
			<option value="featured">{{ i18n.ts.featured }}</option>
			<option value="files">{{ i18n.ts.withFiles }}</option>
		</MkTab>
	</template>
	<XReactions v-if="tab === 'reactions'" :user="user"/>
	<MkNotes v-else :noGap="true" :pagination="pagination" :class="$style.tl"/>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNotes from '@/components/MkNotes.vue';
import MkTab from '@/components/MkTab.vue';
import XReactions from '@/pages/user/reactions.vue';
import { i18n } from '@/i18n.js';
import { $i } from '@/account.js';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const tab = ref<string | null>(null);

const pagination = computed(() => tab.value === 'featured' ? {
	endpoint: 'users/featured-notes' as const,
	limit: 10,
	params: {
		userId: props.user.id,
	},
} : {
	endpoint: 'users/notes' as const,
	limit: 10,
	params: {
		userId: props.user.id,
		withRenotes: tab.value === 'all',
		withReplies: tab.value === 'all',
		withChannelNotes: tab.value === 'all',
		withFiles: tab.value === 'files',
	},
});
</script>

<style lang="scss" module>
.tab {
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}
</style>
