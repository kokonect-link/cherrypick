<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.inline]: inline, [$style.colored]: colored, [$style.mini]: mini, [$style.em]: em }]">
	<div :class="$style.container">
		<svg :class="[$style.spinner]" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
			<circle :class="[$style.path]" cx="25" cy="25" r="20" fill="none" stroke-width="6px" style="fill: none; stroke: currentColor; stroke-width: 6px;"></circle>
		</svg>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';

const props = withDefaults(defineProps<{
	static?: boolean;
	inline?: boolean;
	colored?: boolean;
	mini?: boolean;
	em?: boolean;
}>(), {
	static: false,
	inline: false,
	colored: true,
	mini: false,
	em: false,
});
</script>

<style lang="scss" module>
/* Credit to https://codepen.io/supah/pen/BjYLdW */

@keyframes spinner {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes dash {
	0% {
		stroke-dasharray: 1, 150;
		stroke-dashoffset: 0;
	}
	50% {
		stroke-dasharray: 90, 150;
		stroke-dashoffset: -35;
	}
	100% {
		stroke-dasharray: 90, 150;
		stroke-dashoffset: -124;
	}
}

.root {
	padding: 32px;
	text-align: center;
	cursor: wait;

	--size: 40px;

	&.colored {
		color: var(--accent);
	}

	&.inline {
		display: inline;
		padding: 0;
		--size: 32px;
	}

	&.mini {
		padding: 16px;
		--size: 32px;
	}

	&.em {
		display: inline-block;
		vertical-align: middle;
		padding: 0;
		--size: 1em;
	}
}

.container {
	position: relative;
	width: var(--size);
	height: var(--size);
	margin: 0 auto;
}

.spinner {
	position: absolute;
	top: 0;
	left: 0;
	width: var(--size);
	height: var(--size);
	animation: spinner 2s linear infinite;
}

.path {
	stroke: var(--accent);
	stroke-linecap: round;
	animation: dash 1.2s ease-in-out infinite;
}
</style>
