<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MkStickyContainer>
		<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
		<MkSpacer :contentMax="1000">
			<div ref="rootEl" :class="$style.root">
				<MkFoldableSection class="item">
					<template #header>Stats</template>
					<XStats/>
				</MkFoldableSection>

				<MkFoldableSection v-if="meta" class="item">
					<template #header>Server Metric</template>
					<XCpuMemoryNetCompact v-if="meta.enableServerMachineStats" :connection="connection" :meta="serverInfo"/>
					<div v-else :class="$style.disabledServerMachineStats" v-html="i18n.ts.disabledServerMachineStats.replaceAll('\n', '<br>')"></div>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Active users</template>
					<XActiveUsers/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Heatmap</template>
					<XHeatmap/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Retention rate</template>
					<XRetention/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Moderators</template>
					<XModerators/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Federation</template>
					<XFederation/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Instances</template>
					<XInstances/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Ap requests</template>
					<XApRequests/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>New users</template>
					<XUsers/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Deliver queue</template>
					<XQueue domain="deliver"/>
				</MkFoldableSection>

				<MkFoldableSection class="item">
					<template #header>Inbox queue</template>
					<XQueue domain="inbox"/>
				</MkFoldableSection>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</div>
</template>

<script lang="ts" setup>
import { markRaw, onMounted, onBeforeUnmount, nextTick, onUnmounted, shallowRef, ref, computed } from 'vue';
import * as Misskey from 'cherrypick-js';
import XHeader from './_header_.vue';
import XFederation from './overview.federation.vue';
import XInstances from './overview.instances.vue';
import XQueue from './overview.queue.vue';
import XApRequests from './overview.ap-requests.vue';
import XUsers from './overview.users.vue';
import XActiveUsers from './overview.active-users.vue';
import XStats from './overview.stats.vue';
import XRetention from './overview.retention.vue';
import XModerators from './overview.moderators.vue';
import XHeatmap from './overview.heatmap.vue';
import type { InstanceForPie } from './overview.pie.vue';
import * as os from '@/os.js';
import { useStream } from '@/stream.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import XCpuMemoryNetCompact from '@/widgets/server-metric/cpu-mem-net-pie.vue';

const rootEl = shallowRef<HTMLElement>();
const serverInfo = ref<Misskey.entities.ServerInfoResponse | null>(null);
const topSubInstancesForPie = ref<InstanceForPie[] | null>(null);
const topPubInstancesForPie = ref<InstanceForPie[] | null>(null);
const federationPubActive = ref<number | null>(null);
const federationPubActiveDiff = ref<number | null>(null);
const federationSubActive = ref<number | null>(null);
const federationSubActiveDiff = ref<number | null>(null);
const newUsers = ref<Misskey.entities.UserDetailed[] | null>(null);
const activeInstances = shallowRef<Misskey.entities.FederationInstance | null>(null);
const queueStatsConnection = markRaw(useStream().useChannel('queueStats'));
const connection = useStream().useChannel('serverStats');
const now = new Date();
const filesPagination = {
	endpoint: 'admin/drive/files' as const,
	limit: 9,
	noPaging: true,
};

const meta = ref(null);

function onInstanceClick(i) {
	os.pageWindow(`/instance-info/${i.host}`);
}

onMounted(async () => {
	/*
	const magicGrid = new MagicGrid({
		container: rootEl,
		static: true,
		animate: true,
	});

	magicGrid.listen();
	*/

	os.apiGet('charts/federation', { limit: 2, span: 'day' }).then(chart => {
		federationPubActive.value = chart.pubActive[0];
		federationPubActiveDiff.value = chart.pubActive[0] - chart.pubActive[1];
		federationSubActive.value = chart.subActive[0];
		federationSubActiveDiff.value = chart.subActive[0] - chart.subActive[1];
	});

	os.apiGet('federation/stats', { limit: 10 }).then(res => {
		topSubInstancesForPie.value = [
			...res.topSubInstances.map(x => ({
				name: x.host,
				color: x.themeColor,
				value: x.followersCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			})),
			{ name: '(other)', color: '#80808080', value: res.otherFollowersCount },
		];
		topPubInstancesForPie.value = [
			...res.topPubInstances.map(x => ({
				name: x.host,
				color: x.themeColor,
				value: x.followingCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			})),
			{ name: '(other)', color: '#80808080', value: res.otherFollowingCount },
		];
	});

	os.api('admin/server-info').then(serverInfoResponse => {
		serverInfo.value = serverInfoResponse;
	});

	os.api('admin/show-users', {
		limit: 5,
		sort: '+createdAt',
	}).then(res => {
		newUsers.value = res;
	});

	os.api('federation/instances', {
		sort: '+latestRequestReceivedAt',
		limit: 25,
	}).then(res => {
		activeInstances.value = res;
	});

	os.api('admin/meta', {}).then(res => {
		meta.value = res;
	});

	nextTick(() => {
		queueStatsConnection.send('requestLog', {
			id: Math.random().toString().substring(2, 10),
			length: 100,
		});
	});
});

onBeforeUnmount(() => {
	queueStatsConnection.dispose();
});

onUnmounted(() => {
	connection.dispose();
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.dashboard,
	icon: 'ti ti-dashboard',
});
</script>

<style lang="scss" module>
.root {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	grid-gap: 16px;
}

.disabledServerMachineStats {
  color: var(--fgTransparentWeak);
  margin: 10px;
  font-size: 0.9em;
  text-align: center;
}
</style>
