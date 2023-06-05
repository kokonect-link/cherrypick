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
import { onMounted, onUnmounted } from 'vue';
import { useStream } from '@/stream';
import { i18n } from '@/i18n';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { eventBus } from '@/scripts/cherrypick/eventBus';

const zIndex = os.claimZIndex('high');

let hasRequireRefresh = $ref(false);
let hasDisconnected = $ref(false);

function onDisconnected() {
	hasDisconnected = true;
}

function resetDisconnected() {
	hasDisconnected = false;
}

function resetRequireRefresh() {
	hasRequireRefresh = false;
}

function reload() {
	location.reload();
}

useStream().on('_disconnected_', onDisconnected);

onMounted(() => {
	eventBus.on('hasRequireRefresh', (hasRequireRefresh_receive) => {
		hasRequireRefresh = hasRequireRefresh_receive;
	});
});

onUnmounted(() => {
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
