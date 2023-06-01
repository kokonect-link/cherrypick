<template>
<div :class="$style.root">
	<div :class="$style.div">
		<XPie :class="$style.pie" :value="cpuUsage"/>
		<div :class="$style.div2">
			<p>CPU</p>
			<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text">{{ (cpuUsage * 100).toFixed(1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">%</span></text>
		</div>
		<XPie :class="$style.pie" :value="memUsage"/>
		<div :class="$style.div2">
			<p>RAM</p>
			<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text">{{ (memUsage * 100).toFixed(1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">%</span></text>
		</div>
	</div>
	<div :class="$style.divider"></div>
	<div :class="$style.div">
		<!-- 基準が10MBなので、基準を超えるとグラフが壊れる問題がある -->
		<XPie :class="$style.pie" :value="inRecent / 10000000"/>
		<div :class="$style.div2">
			<p>NET rx</p>
			<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text"><tspan>{{ bytes(inRecent, 1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">{{ bytesSizes(inRecent) }}</span></tspan></text>
		</div>
		<!-- 基準が10MBなので、基準を超えるとグラフが壊れる問題がある -->
		<XPie :class="$style.pie" :value="outRecent / 10000000"/>
		<div :class="$style.div2">
			<p>NET tx</p>
			<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text"><tspan>{{ bytes(outRecent, 1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">{{ bytesSizes(outRecent) }}</span></tspan></text>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import XPie from './pie-compact.vue';
import bytes from '@/filters/bytes-net-v';
import bytesSizes from '@/filters/bytes-net-sizes';

const props = defineProps<{
	connection: any,
	meta: any
}>();

let cpuUsage: number = $ref(0);
let memUsage: number = $ref(0);
let inRecent: number = $ref(0);
let outRecent: number = $ref(0);

function onStats(stats) {
	cpuUsage = stats.cpu;
	memUsage = stats.mem.active / props.meta.mem.total;
}

function onConnStats(connStats) {
	inRecent = connStats.net.rx;
	outRecent = connStats.net.tx;
}

onMounted(() => {
	props.connection.on('stats', onStats);
	props.connection.on('stats', onConnStats);
});

onBeforeUnmount(() => {
	props.connection.off('stats', onStats);
	props.connection.off('stats', onConnStats);
});
</script>

<style lang="scss" module>
.root {
	padding: 16px 32px;
}

.div {
	display: flex;
}

.pie {
	height: 42px;
	flex-shrink: 0;
	margin-right: 8px;
}

.div2 {
	flex: 1;
	margin: auto;

	> p {
		margin: 0 0 2px;
		font-size: 0.8em;
	}
}

.divider {
	margin: 16px 72px;
	border-top: solid 0.5px var(--divider);
}

.text {
	font-weight: bold;
	fill: currentColor;
}
</style>
