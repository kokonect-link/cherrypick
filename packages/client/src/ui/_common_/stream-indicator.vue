<template>
<div v-if="hasDisconnected && $store.state.serverDisconnectedBehavior === 'quiet'" class="nsbbhtug" :class="{ friendly: isFriendly }" @click="resetDisconnected">
	<div class="text">{{ i18n.ts.disconnectedFromServer }}</div>
	<div class="command">
		<button class="_textButton" @click="reload">{{ i18n.ts.reload }}</button>
		<button class="_textButton">{{ i18n.ts.doNothing }}</button>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue';
import { stream } from '@/stream';
import { i18n } from '@/i18n';

const isFriendly = $ref(localStorage.getItem('ui') === 'friendly');

let hasDisconnected = $ref(false);

function onDisconnected() {
	hasDisconnected = true;
}

function resetDisconnected() {
	hasDisconnected = false;
}

function reload() {
	location.reload();
}

stream.on('_disconnected_', onDisconnected);

onUnmounted(() => {
	stream.off('_disconnected_', onDisconnected);
});
</script>

<style lang="scss" scoped>
.nsbbhtug {
	position: fixed;
	z-index: 16385;
	bottom: 8px;
	right: 8px;
	margin: 0;
	padding: 6px 12px;
	font-size: 0.9em;
	color: #fff;
	background: #000;
	opacity: 0.7;
	border-radius: 4px;
	max-width: 320px;

	&.friendly {
		@media (max-width: 1099px) {
			display: flex;
			width: 100%;
			max-width: initial;
			top: 55px;
			bottom: initial;
			right: initial;
			border-radius: initial;

			> .text {
				padding: 0.7em;
			}

			> .command {
				position: fixed;
				right: 0;
			}
		}
	}

	> .command {
		display: flex;
		justify-content: space-around;

		> button {
			padding: 0.7em;
		}
	}
}
</style>
