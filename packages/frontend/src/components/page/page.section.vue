<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<section :class="$style.section">
	<component
		:is="'h' + h"
		:class="
			h === 2 ? $style.h2 :
			h === 3 ? $style.h3 :
			h === 4 ? $style.h4 : ''
		"
	>
		{{ block.title }}
	</component>

	<div class="_gaps">
		<XBlock v-for="child in block.children" :key="child.id" :page="page" :block="child" :h="h + 1"/>
	</div>
</section>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import * as Misskey from 'cherrypick-js';

const XBlock = defineAsyncComponent(() => import('./page.block.vue'));

defineProps<{
	block: Misskey.entities.PageBlock,
	h: number,
	page: Misskey.entities.Page,
}>();
</script>

<style lang="scss" module>
.h2 {
	font-size: 1.6em;
	margin: 0 0 0.5em 0;
	border-bottom: 1px solid var(--accentLighten);
	padding: 0.1em;
}

.h3 {
	font-size: 1.25em;
	margin: 0 0 0.5em 0;
	border-left: 3px solid var(--accentLighten);
	border-bottom: 1px solid var(--accentLighten);
	padding: 0.05em 0.5em 0.15em;
}

.h4 {
	font-size: 1em;
	margin: 0 0 0.5em 0;
}

.section {
	margin-bottom: 1em;
}
</style>
