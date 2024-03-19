<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<XPie :class="$style.pie" :value="cpuUsage"/>
	<div :class="$style.div">
		<p>CPU</p>
		<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text">{{ (cpuUsage * 100).toFixed(1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">%</span></text>
	</div>
	<XPie :class="$style.pie" :value="memUsage"/>
	<div :class="$style.div">
		<p>RAM</p>
		<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text">{{ (memUsage * 100).toFixed(1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">%</span></text>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import XPie from './pie-compact.vue';

const props = defineProps<{
	connection: Misskey.ChannelConnection<Misskey.Channels['serverStats']>,
	meta: Misskey.entities.ServerInfoResponse
}>();

const cpuUsage = ref<number>(0);
const memUsage = ref<number>(0);

onMounted(() => {
	props.connection.on('stats', onStats);
});

onBeforeUnmount(() => {
	props.connection.off('stats', onStats);
});

function onStats(stats: Misskey.entities.ServerStats) {
	cpuUsage.value = stats.cpu;
	memUsage.value = stats.mem.active / props.meta.mem.total;
}
</script>

<style lang="scss" module>
.root {
	display: flex;
	padding: 16px 32px;
}

.pie {
	height: 42px;
	flex-shrink: 0;
	margin-right: 8px;
}

.div {
	flex: 1;
	margin: auto;

	> p {
		margin: 0 0 2px;
		font-size: 0.8em;
	}
}

.text {
	font-weight: bold;
	fill: currentColor;
}
</style>
