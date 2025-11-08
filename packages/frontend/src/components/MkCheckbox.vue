<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	v-adaptive-border
	:class="[$style.root, { [$style.disabled]: disabled, [$style.checked]: checked }]"
	:aria-checked="checked"
	:aria-disabled="disabled"
	role="checkbox"
	@click="toggle"
>
	<input
		type="checkbox"
		:checked="checked"
		:disabled="disabled"
		:class="$style.input"
	>
	<span :class="$style.button">
		<i v-if="checked" class="ti ti-check"></i>
	</span>
	<span :class="$style.label"><slot></slot></span>
</div>
</template>

<script lang="ts" setup generic="T extends string">
import { computed } from 'vue';

const props = defineProps<{
	modelValue: T[];
	value: T;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'update:modelValue', value: T[]): void;
}>();

const checked = computed(() => props.modelValue.includes(props.value));

function toggle(): void {
	if (props.disabled) return;

	const currentValues = [...props.modelValue];
	if (checked.value) {
		// Remove from an array
		const index = currentValues.indexOf(props.value);

		if (index > -1) {
			currentValues.splice(index, 1);
		}
	} else {
		// Add to array
		currentValues.push(props.value);
	}

	emit('update:modelValue', currentValues);
}
</script>

<style lang="scss" module>
.root {
	position: relative;
	display: inline-flex;
	align-items: center;
	text-align: left;
	cursor: pointer;
	padding: 7px 10px;
	min-width: 60px;
	background-color: var(--MI_THEME-panel);
	background-clip: padding-box !important;
	border: solid 1px var(--MI_THEME-panel);
	border-radius: 6px;
	font-size: 90%;
	transition: all 0.2s;
	user-select: none;

	&.disabled {
		opacity: 0.6;
		cursor: not-allowed !important;
	}

	&:hover {
		border-color: var(--MI_THEME-inputBorderHover) !important;
	}

	&:focus-within {
		outline: none;
		box-shadow: 0 0 0 2px var(--MI_THEME-focus);
	}

	&.checked {
		background-color: var(--MI_THEME-accentedBg) !important;
		border-color: var(--MI_THEME-accentedBg) !important;
		color: var(--MI_THEME-accent);
		cursor: default !important;

		> .button {
			border-color: var(--MI_THEME-accent);
			background-color: var(--MI_THEME-accent);
			color: #fff;
		}
	}
}

.input {
	position: absolute;
	width: 0;
	height: 0;
	opacity: 0;
	margin: 0;
}

.button {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 14px;
	height: 14px;
	background: none;
	border: solid 2px var(--MI_THEME-inputBorder);
	border-radius: 2px;
	transition: inherit;
	font-size: 10px;
	line-height: 1;
}

.label {
	margin-left: 8px;
	display: block;
	line-height: 20px;
	cursor: pointer;
}
</style>
