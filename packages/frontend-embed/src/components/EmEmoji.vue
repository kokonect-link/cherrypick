<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<img :class="$style.root" :src="url" :alt="props.emoji" decoding="async"/>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { char2twemojiFilePath } from '@@/js/emoji-base.js';

const props = defineProps<{
	emoji: string;
}>();

const url = computed(() => char2twemojiFilePath(props.emoji));
</script>

<style lang="scss" module>
.root {
	height: 1.1em;
	vertical-align: -0.235em;

	&.large {
		height: 1.3em;
		vertical-align: -0.4em;
	}
}
</style>
