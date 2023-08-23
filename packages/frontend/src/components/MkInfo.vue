<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="visible" :class="[$style.root, { [$style.warn]: warn }]">
	<i v-if="warn" class="ti ti-alert-triangle" :class="$style.i"></i>
	<i v-else class="ti ti-info-circle" :class="$style.i"></i>
	<slot></slot>
  <button v-if="closeable" v-tooltip="i18n.ts.close" :class="$style.close" class="_button" @click.stop="close" :aria-label="i18n.t('close')">
    <i class="ti ti-x"></i>
  </button>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { i18n } from '@/i18n';

const visible = ref(true);

const props = defineProps<{
	warn?: boolean;
  closeable?: boolean;
}>();

const emit = defineEmits<{
  (ev: 'closed'): void;
}>();

function close() {
  visible.value = false;
  emit('closed');
}
</script>

<style lang="scss" module>
.root {
	padding: 12px 14px;
	font-size: 90%;
	background: var(--infoBg);
	color: var(--infoFg);
	border-radius: var(--radius);
	white-space: pre-wrap;
  display: flex;
  align-items: center;

	&.warn {
		background: var(--infoWarnBg);
		color: var(--infoWarnFg);
	}
}

.i {
	margin-right: 8px;
}

.close {
  margin-left: auto;
  float: right;
}
</style>
