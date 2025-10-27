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
					v-model="include"
					:tabs="[
						{ key: 'upcoming', label: i18n.ts._event.startDate },
						{ key: 'future', label: i18n.ts.reverseChronological },
					]"
					:class="[$style.tab, { [$style.reduceBlurEffect]: !prefer.s.useBlurEffect, [$style.scrollToTransparent]: showEl }]"
				>
				</MkTab>
			</template>
			<MkNotesTimeline :noGap="!prefer.s.showGapBetweenNotesInTimeline" :paginator="eventsPaginator" :class="$style.tl" :getDate="include === 'upcoming' ? note => note.event.start : undefined "/>
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
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';

const { showEl } = scrollToVisibility();

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const include = ref<'upcoming' | 'future'>('upcoming');

const eventsPaginator = markRaw(new Paginator('notes/events/search', {
	limit: 10,
	offsetMode: include.value === 'upcoming',
	computedParams: computed(() => ({
		users: [props.user.id],
		sortBy: include.value === 'upcoming' ? 'startDate' : 'createdAt',
	})),
}));
</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--MI-margin) / 2) 0;
	padding: calc(var(--MI-margin) / 2) 0;
	//background: var(--MI_THEME-bg);
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
	transition: opacity 0.5s, background-color 0.5s;

	&.reduceBlurEffect {
		background-color: color(from var(--MI_THEME-bg) srgb r g b / 1);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}

	&.scrollToTransparent {
		background-color: transparent;
	}
}

.tl {
	background: var(--MI_THEME-bg);
    border-radius: var(--MI-radius);
    overflow: clip;
}
</style>
