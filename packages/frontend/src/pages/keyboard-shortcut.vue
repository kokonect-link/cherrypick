<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-if="!popup" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="800">
		<div :class="$style.root">
			<div :class="$style.intro">{{ i18n.ts._keyboardShortCut.description }}</div>
			<MkFoldableSection>
				<template #header>{{ i18n.ts.general }}</template>
				<div :class="$style.section">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut.openPostForm }}</div>
					<div :class="$style.content">
						<kbd>N</kbd>, <kbd>P</kbd>
					</div>
				</div>
				<div :class="$style.section">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut.toggleDarkMode }}</div>
					<div :class="$style.content">
						<kbd>Ctrl</kbd>+<kbd>D</kbd>
					</div>
				</div>
				<div :class="$style.section">
					<div :class="$style.title">{{ i18n.ts._keyboardShortCut.redirectToSearch }}</div>
					<div :class="$style.content">
						<kbd>S</kbd>
					</div>
				</div>
			</MkFoldableSection>
			<MkFoldableSection>
				<template #header>{{ i18n.ts._keyboardShortCut.postForm }}</template>
				<div :class="$style.section">
					<div :clas="$style.title">{{ i18n.ts._cherrypick.postFormVisibilityHotkey }}</div>
					<div :class="$style.content">
						<kbd>Ctrl</kbd>+<kbd>Shift</kbd>
					</div>
				</div>
			</MkFoldableSection>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import MkFoldableSection from '@/components/MkFoldableSection.vue';

defineProps<{
	popup?: boolean;
}>();

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts.keyboardShortcuts,
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

</style>
