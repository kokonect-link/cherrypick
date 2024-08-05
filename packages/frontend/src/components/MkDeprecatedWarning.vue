<template>
	<div :class="$style.root">
	<i class="ti ti-exclamation-circle"></i>
	{{ i18n.ts.deprecatedCaution }}
	</div>
</template>

<script lang="ts" setup>
import { i18n } from '@/i18n.js';

</script>

<style lang="scss" module>
.root {
	font-size: 0.8em;
	padding: 16px;
	background-color: var(--infoWarnBg);
	color: var(--error);
	border-radius: var(--radius);
}

</style>
