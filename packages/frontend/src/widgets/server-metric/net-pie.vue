<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<!-- Max: 10GB -->
	<XPie v-if="inRecent > 1000000000" :class="$style.pie" :value="inRecent / 1000000000"/>
	<!-- Max: 1GB -->
	<XPie v-else-if="inRecent > 100000000" :class="$style.pie" :value="inRecent / 100000000"/>
	<!-- Max: 100MB -->
	<XPie v-else-if="inRecent > 10000000 && inRecent <= 100000000" :class="$style.pie" :value="inRecent / 100000000"/>
	<!-- Max: 10MB -->
	<XPie v-else :class="$style.pie" :value="inRecent / 10000000"/>
	<div :class="$style.div">
		<p>NET rx</p>
		<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text"><tspan>{{ bytes(inRecent, 1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">{{ bytesSizes(inRecent) }}</span></tspan></text>
	</div>
	<!-- Max: 10GB -->
	<XPie v-if="outRecent > 1000000000" :class="$style.pie" :value="outRecent / 1000000000"/>
	<!-- Max: 1GB -->
	<XPie v-if="outRecent > 100000000" :class="$style.pie" :value="outRecent / 100000000"/>
	<!-- Max: 100MB -->
	<XPie v-else-if="outRecent > 10000000 && outRecent <= 100000000" :class="$style.pie" :value="outRecent / 100000000"/>
	<!-- Max: 10MB -->
	<XPie v-else :class="$style.pie" :value="outRecent / 10000000"/>
	<div :class="$style.div">
		<p>NET tx</p>
		<text x="50%" y="50%" dy="0.05" text-anchor="middle" :class="$style.text"><tspan>{{ bytes(outRecent, 1) }}<span style="font-weight: normal; font-size: .75em; margin-left: 2px;">{{ bytesSizes(outRecent) }}</span></tspan></text>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import XPie from './pie-compact.vue';
import bytes from '@/filters/bytes-net-v.js';
import bytesSizes from '@/filters/bytes-net-sizes.js';

const props = defineProps<{
	connection: Misskey.ChannelConnection<Misskey.Channels['serverStats']>,
	meta: Misskey.entities.ServerInfoResponse
}>();

const inRecent = ref<number>(0);
const outRecent = ref<number>(0);

onMounted(() => {
	props.connection.on('stats', onStats);
});

onBeforeUnmount(() => {
	props.connection.off('stats', onStats);
});

function onStats(connStats: Misskey.entities.ServerStats) {
	inRecent.value = connStats.net.rx;
	outRecent.value = connStats.net.tx;
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
