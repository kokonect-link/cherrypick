<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<div :class="$style.label"><i class="ti ti-truck-delivery"></i> {{ i18n.ts._deliveryTargetControl.deliveryTargetControl }}</div>

	<div :class="$style.body">
		<MkRadios v-model="deliveryMode" direction="vertical">
			<option value="include">{{ i18n.ts._deliveryTargetControl.deliveryTargetInclude }}</option>
			<option value="exclude">{{ i18n.ts._deliveryTargetControl.deliveryTargetExclude }}</option>
		</MkRadios>

		<div :class="$style.serverSelection">
			<MkLoading v-if="serversLoading"/>
			<div v-else-if="loadError" :class="$style.errorMessage">
				<i class="ti ti-alert-circle"></i>
				<span>{{ i18n.ts._deliveryTargetControl.loadError }}</span>
				<button class="_button" :class="$style.retryButton" @click="loadServers">
					<i class="ti ti-refresh"></i>
					{{ i18n.ts.retry }}
				</button>
			</div>
			<div v-else-if="servers.length === 0" :class="$style.noServers">
				<i class="ti ti-info-circle"></i>
				{{ i18n.ts._deliveryTargetControl.noFollowersFromRemoteServers }}
			</div>
			<div v-else>
				<!-- Search Field -->
				<MkInput v-model="searchQuery" type="search" :placeholder="i18n.ts.search" :class="$style.searchInput">
					<template #prefix><i class="ti ti-search"></i></template>
				</MkInput>

				<!-- Server List -->
				<div :class="$style.servers">
					<MkCheckbox
						v-for="server in filteredServers"
						:key="server.host"
						v-model="selectedHosts"
						:value="server.host"
						:class="$style.serverItem"
					>
						<div :class="$style.serverInfo">
							<div :class="$style.serverHost">{{ server.host }}</div>
							<div :class="$style.serverCount">
								{{ i18n.tsx._deliveryTargetControl.followersCount({ count: server.followersCount }) }}
							</div>
						</div>
					</MkCheckbox>
				</div>

				<!-- Server Count Info -->
				<div v-if="searchQuery && servers.length > 0" :class="$style.searchInfo">
					{{ i18n.tsx._deliveryTargetControl.searchResults({
						count: filteredServers.length,
						total: servers.length
					}) }}
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import MkRadios from '@/components/MkRadios.vue';
import MkLoading from '@/components/global/MkLoading.vue';
import MkInput from '@/components/MkInput.vue';
import MkCheckbox from '@/components/MkCheckbox.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';

export type DeliveryTargetEditorModelValue = {
	mode: 'include' | 'exclude';
	hosts: string[];
};

const props = withDefaults(defineProps<{
	modelValue: DeliveryTargetEditorModelValue;
}>(), {
	modelValue: () => ({ mode: 'include', hosts: [] }),
});

const emit = defineEmits<{
	(ev: 'update:modelValue', value: DeliveryTargetEditorModelValue): void;
	(ev: 'destroyed'): void;
}>();

const deliveryMode = ref<'include' | 'exclude'>(props.modelValue.mode);
const selectedHosts = ref<string[]>([...props.modelValue.hosts]);
const servers = ref<{ host: string; followersCount: number }[]>([]);
const serversLoading = ref(true);
const loadError = ref(false);
const searchQuery = ref('');

// 内部更新中フラグ（無限ループ防止）
const isInternalUpdate = ref(false);

// Search functionality
const filteredServers = computed(() => {
	if (!searchQuery.value.trim()) {
		return servers.value;
	}
	const query = searchQuery.value.toLowerCase().trim();

	return servers.value.filter(server =>
		server.host.toLowerCase().includes(query),
	);
});

// Watch for props changes - 外部からの変更のみ反映
watch(() => props.modelValue, (newValue) => {
	if (isInternalUpdate.value) return; // 内部更新中は無視
	// 値が実際に変わった場合のみ更新

	if (deliveryMode.value !== newValue.mode ||
		JSON.stringify(selectedHosts.value) !== JSON.stringify(newValue.hosts)) {
		deliveryMode.value = newValue.mode;
		selectedHosts.value = [...newValue.hosts];
	}
}, { deep: true });

// Clear selected hosts when switching to 'include' mode
watch(deliveryMode, (newMode) => {
	if (newMode === 'include') {
		selectedHosts.value = [];
	}
});

// Watch for internal changes and emit - 重複防止付き
watch([deliveryMode, selectedHosts], () => {
	const newValue = {
		mode: deliveryMode.value,
		hosts: [...selectedHosts.value],
	};

	// 実際に値が変わった場合のみemit
	if (JSON.stringify(newValue) !== JSON.stringify(props.modelValue)) {
		isInternalUpdate.value = true;
		emit('update:modelValue', newValue);

		nextTick(() => {
			isInternalUpdate.value = false;
		});
	}
}, { deep: true });

const loadServers = async () => {
	serversLoading.value = true;
	loadError.value = false;

	try {
		const result = await misskeyApi<{ servers: { host: string; followersCount: number }[] }>('i/followers-servers', {});
		servers.value = result.servers;
	} catch (err) {
		console.error('Failed to load follower servers:', err);
		loadError.value = true;
	} finally {
		serversLoading.value = false;
	}
};

onMounted(() => {
	loadServers();
});
</script>

<style lang="scss" module>
.root {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px 24px;
}

.label {
	font-size: 0.85em;
	padding: 0 0 8px 0;
	user-select: none;
	color: var(--MI_THEME-accent);
	display: flex;
	align-items: center;
	gap: 4px;
}

.body {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.serverSelection {
	padding: 8px 0;
}

.searchInput {
	margin-bottom: 8px;
}

.noServers {
	text-align: center;
	color: var(--MI_THEME-fgTransparentWeak);
	padding: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	font-size: 0.9em;
}

.servers {
	display: flex;
	flex-direction: column;
	gap: 4px;
	max-height: 240px;
	overflow-y: auto;
	padding: 8px;
	border: 1px solid var(--MI_THEME-divider);
	border-radius: 6px;
	background: var(--MI_THEME-bg);
}

.serverItem {
	width: 100%;
}

.serverInfo {
	flex: 1;
	min-width: 0;
}

.serverHost {
	font-weight: 500;
	color: var(--MI_THEME-fg);
	word-break: break-all;
	line-height: 1.3;
}

.serverCount {
	font-size: 0.8em;
	color: var(--MI_THEME-fgTransparentWeak);
	margin-top: 2px;
	line-height: 1.2;
}

.searchInfo {
	margin-top: 8px;
	font-size: 0.8em;
	color: var(--MI_THEME-fgTransparentWeak);
	text-align: center;
	padding: 4px 8px;
}

.errorMessage {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 16px;
	color: var(--MI_THEME-error);
	font-size: 0.9em;
	text-align: center;
}

.retryButton {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 6px 12px;
	border-radius: 4px;
	background: var(--MI_THEME-buttonBg);
	color: var(--MI_THEME-fg);
	font-size: 0.85em;
	transition: background-color 0.2s;

	&:hover {
		background: var(--MI_THEME-buttonHoverBg);
	}
}
</style>
