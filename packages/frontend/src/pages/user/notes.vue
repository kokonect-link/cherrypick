<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_spacer" style="--MI_SPACER-w: 800px;">
	<div :class="$style.root">
		<MkStickyContainer>
			<template #header>
				<MkTab
					v-model="tab"
					:tabs="[
						{ key: 'notes', label: i18n.ts.notes },
						{ key: 'all', label: i18n.ts.all },
						{ key: 'featured', label: i18n.ts.featured },
						{ key: 'files', label: i18n.ts.withFiles },
						...(($i && ($i.id === user.id || $i.isAdmin || $i.isModerator)) || user.publicReactions ? [{
							key: 'reactions',
							label: i18n.ts.reaction
						}] : []),
					]"
					:class="$style.tab"
				>
				</MkTab>
			</template>
			<XReactions v-if="tab === 'reactions'" :user="user"/>
			<XFiles v-else-if="tab === 'files' && prefer.s.filesGridLayoutInUserPage" :paginator="filesPaginator"/>
			<MkNotesTimeline v-else-if="tab === 'featured'" :paginator="featuredPaginator" :class="$style.tl" :noGap="!prefer.s.showGapBetweenNotesInTimeline"/>
			<MkNotesTimeline v-else :paginator="notesPaginator" :class="$style.tl" :noGap="!prefer.s.showGapBetweenNotesInTimeline"/>
		</MkStickyContainer>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed, markRaw } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNotesTimeline from '@/components/MkNotesTimeline.vue';
import MkTab from '@/components/MkTab.vue';
import { i18n } from '@/i18n.js';
import { Paginator } from '@/utility/paginator.js';
import { prefer } from '@/preferences.js';
import { $i } from '@/i.js';
import XReactions from "@/pages/user/reactions.vue";
import XFiles from "@/pages/user/index.timeline.files.vue";

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const tab = ref<'notes' | 'all' | 'featured' | 'files' | 'reactions'>('notes');

const featuredPaginator = markRaw(new Paginator('users/featured-notes', {
	limit: 10,
	params: {
		userId: props.user.id,
	},
}));

const notesPaginator = markRaw(new Paginator('users/notes', {
	limit: 10,
	computedParams: computed(() => ({
		userId: props.user.id,
		withRenotes: tab.value === 'all',
		withReplies: tab.value === 'all',
		withChannelNotes: tab.value === 'all',
		withFiles: tab.value === 'files',
	})),
}));

const filesPaginator = markRaw(new Paginator('users/notes', {
	limit: 30,
	computedParams: computed(() => ({
		userId: props.user.id,
		withFiles: true,
	})),
}));
</script>

<style lang="scss" module>
.tab {
	padding: calc(var(--MI-margin) / 2) 0;
	background: var(--MI_THEME-bg);
}

.tl {
	background: var(--MI_THEME-bg);
	border-radius: var(--MI-radius);
	overflow: clip;
}
</style>
