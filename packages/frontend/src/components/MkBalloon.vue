<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, tail === 'left' ? $style.left : $style.right]">
	<div :class="$style.bg">
		<svg :class="$style.tail" version="1.1" viewBox="0 0 14.597 14.58" xmlns="http://www.w3.org/2000/svg">
			<g transform="translate(-173.71 -87.184)">
				<path d="m188.19 87.657c-1.469 2.3218-3.9315 3.8312-6.667 4.0865-2.2309-1.7379-4.9781-2.6816-7.8061-2.6815h-5.1e-4v12.702h12.702v-5.1e-4c2e-5 -1.9998-0.47213-3.9713-1.378-5.754 2.0709-1.6834 3.2732-4.2102 3.273-6.8791-6e-5 -0.49375-0.0413-0.98662-0.1235-1.4735z" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke-width=".33225" style="paint-order:stroke fill markers"/>
			</g>
		</svg>
		<div :class="$style.content">
			<slot></slot>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	tail?: 'left' | 'right';
}>(), {
	tail: 'right',
});
</script>

<style lang="scss" module>
.root {
	--balloon-radius: 16px;
	--balloon-bg: var(--MI_THEME-panel);

	position: relative;
	display: inline-block;
	min-height: calc(var(--balloon-radius) * 2);
	padding-top: calc(var(--balloon-radius) * .13);

	&.left {
		padding-left: calc(var(--balloon-radius) * .13);
	}

	&.right {
		padding-right: calc(var(--balloon-radius) * .13);
	}
}

.bg {
	width: 100%;
	height: 100%;
	background: var(--balloon-bg);
	border-radius: var(--balloon-radius);
}

.content {
	position: relative;
	padding: 8px 12px;
}

.tail {
	position: absolute;
	top: 0;
	display: block;
	width: calc(var(--balloon-radius) * 1.13);
	height: auto;
	fill: var(--balloon-bg);
}

.left .tail {
	left: 0;
	transform: rotateY(180deg);
}

.right .tail {
	right: 0;
}
</style>
