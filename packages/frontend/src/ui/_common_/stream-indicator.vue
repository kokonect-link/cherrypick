<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="hasRequireRefresh && defaultStore.state.requireRefreshBehavior === 'quiet'" :class="$style.root" class="_panel _shadow" @click="resetRequireRefresh">
	<div><i class="ti ti-alert-circle"></i> {{ i18n.ts.reloadToApplySetting2 }}</div>
	<div :class="$style.command" class="_buttons">
		<MkButton small primary @click="reload">{{ i18n.ts.reload }}</MkButton>
		<MkButton small>{{ i18n.ts.doNothing }}</MkButton>
	</div>
</div>
<div v-if="hasDisconnected && defaultStore.state.serverDisconnectedBehavior === 'quiet'" :class="$style.root" class="_panel _shadow" @click="resetDisconnected">
	<div><i class="ti ti-alert-triangle"></i> {{ i18n.ts.disconnectedFromServer }}</div>
	<div :class="$style.command" class="_buttons">
		<MkButton small primary @click="reload">{{ i18n.ts.reload }}</MkButton>
		<MkButton small>{{ i18n.ts.doNothing }}</MkButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useStream } from '@/stream.js';
import { i18n } from '@/i18n.js';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { globalEvents } from '@/events.js';

const zIndex = os.claimZIndex('high');

const hasRequireRefresh = ref(false);
const hasDisconnected = ref(false);
const timeoutId = ref<number>();

function onDisconnected() {
	window.clearTimeout(timeoutId);
	timeoutId.value = window.setTimeout(() => {
		hasDisconnected.value = true;
	}, 1000 * 10);
}

function resetDisconnected() {
	window.clearTimeout(timeoutId);
	hasDisconnected.value = false;
}

function resetRequireRefresh() {
	hasRequireRefresh.value = false;
}

function reload() {
	location.reload();
}

useStream().on('_connected_', resetDisconnected);
useStream().on('_disconnected_', onDisconnected);

onMounted(() => {
	globalEvents.on('hasRequireRefresh', (hasRequireRefresh_receive) => {
		hasRequireRefresh.value = hasRequireRefresh_receive;
	});
});

onUnmounted(() => {
	window.clearTimeout(timeoutId);
	useStream().off('_connected_', resetDisconnected);
	useStream().off('_disconnected_', onDisconnected);
});
</script>

<style lang="scss" module>
.root {
	position: fixed;
	z-index: v-bind(zIndex);
	bottom: calc(var(--minBottomSpacing) + var(--margin));
	right: var(--margin);
	margin: 0;
	padding: 12px;
	font-size: 0.9em;
	max-width: 320px;
}

.command {
	margin-top: 8px;
}
</style>
