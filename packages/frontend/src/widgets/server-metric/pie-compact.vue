<!--
SPDX-FileCopyrightText: syuilo and noridev and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<svg :class="$style.root" viewBox="0 0 1 1" preserveAspectRatio="none">
	<circle
		:r="r"
		cx="50%" cy="50%"
		fill="none"
		stroke-width="0.2"
		stroke="rgba(0, 0, 0, 0.05)"
		:class="$style.circle"
	/>
	<circle
		:r="r"
		cx="50%" cy="50%"
		:stroke-dasharray="Math.PI * (r * 2)"
		:stroke-dashoffset="strokeDashoffset"
		fill="none"
		stroke-width="0.2"
		:class="$style.circle"
		:stroke="color"
	/>
</svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
	value: number;
}>();

const r = 0.35;

const color = computed(() => `hsl(${180 - (props.value * 180)}, 80%, 70%)`);
const strokeDashoffset = computed(() => (1 - props.value) * (Math.PI * (r * 2)));
</script>

<style lang="scss" module>
.root {
	display: block;
	height: 100%;
}

.circle {
	transform-origin: center;
	transform: rotate(-90deg);
	transition: stroke-dashoffset 0.5s ease;
	stroke-linecap: round;
}
</style>
