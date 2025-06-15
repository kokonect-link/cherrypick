<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs" :popup="popup">
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<div :class="$style.root">
			<div :class="$style.intro">{{ i18n.ts._keyboardShortCut.description }}</div>

			<MkFoldableSection>
				<template #header>{{ i18n.ts._keyboardShortCut._category.general }}</template>
				<div :class="$style.section" class="_gaps_s">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut._general.openPostForm }}</div>
					<div :class="$style.content">
						<kbd>N</kbd>, <kbd>P</kbd>
					</div>
				</div>
				<div :class="$style.section" class="_gaps_s">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut._general.toggleDarkMode }}</div>
					<div :class="$style.content">
						<kbd>D</kbd>
					</div>
				</div>
				<div :class="$style.section" class="_gaps_s">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut._general.redirectToSearch }}</div>
					<div :class="$style.content">
						<kbd>S</kbd>
					</div>
				</div>
				<div :class="$style.section" class="_gaps_s">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut._general.viewKeyboardShortCutList }}</div>
					<div :class="$style.content">
						<kbd>Shift</kbd> + <kbd>/</kbd> or <kbd>?</kbd>
					</div>
				</div>
			</MkFoldableSection>

			<MkFoldableSection>
				<template #header>{{ i18n.ts._keyboardShortCut._category.postForm }}</template>
				<div :class="$style.section" class="_gaps_s">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut._postForm.toggleVisibility }}</div>
					<div v-if="!prefer.s.postFormVisibilityHotkey" :class="$style.caution">{{ i18n.ts._keyboardShortCut._postForm.featureWarn }}</div>
					<div :class="$style.content">
						<kbd>Ctrl</kbd> + <kbd>Shift</kbd>
					</div>
				</div>
				<div :class="$style.section" class="_gaps_s">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut._postForm.toggleLocalOnly }}</div>
					<div v-if="!prefer.s.postFormVisibilityHotkey" :class="$style.caution">{{ i18n.ts._keyboardShortCut._postForm.featureWarn }}</div>
					<div :class="$style.content">
						<kbd>Ctrl</kbd> + <kbd>Alt</kbd>
					</div>
				</div>
				<div :class="$style.section" class="_gaps_s">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut._postForm.sendPost }}</div>
					<div v-if="prefer.s.useEnterToSend" :class="$style.content">
						<kbd>Enter</kbd>
					</div>
					<div v-else :class="$style.content">
						<kbd>Ctrl</kbd> + <kbd>Enter</kbd>
					</div>
				</div>
			</MkFoldableSection>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { prefer } from '@/preferences.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';

defineProps<{
	popup?: boolean;
}>();

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts._keyboardShortCut.title,
	icon: 'ti ti-keyboard',
}));
</script>

<style lang="scss" module>
.root {
	background: var(--MI_THEME-bg);
}

.intro {
	margin-bottom: 30px;
	padding-bottom: 16px;
	border-bottom: solid 1px var(--MI_THEME-divider);
}

.section {
	&:not(:last-child) {
		margin-bottom: 30px;
	}
}

.title {
	position: sticky;
	z-index: 1;
	top: var(--MI-stickyTop, 0px);
	padding: 16px;
	font-weight: bold;
	-webkit-backdrop-filter: var(--MI-blur, blur(10px));
	backdrop-filter: var(--MI-blur, blur(10px));
	background-color: var(--MI_THEME-panel);
}

.content {
	padding: 16px;
	> kbd {
		border-radius: 3px;
		border:1px solid var(--MI_THEME-accent);
		color: var(--MI_THEME-fg);
		display: inline-block;
		font-size: 0.85em;
		font-weight: bold;
		line-height: 1;
		padding: 2px 4px;
		white-space: nowrap;
	}
}

.caution {
	font-size: 0.8em;
	padding: 16px;
	background: var(--MI_THEME-infoWarnBg);
	color: var(--MI_THEME-infoWarnFg);
	border-radius: var(--MI-radius);
	overflow: clip;
}
</style>
