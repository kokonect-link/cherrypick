<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="meta">
	<XSetup v-if="meta.requireSetup"/>
	<XEntrance v-else/>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import XSetup from './welcome.setup.vue';
import XEntrance from './welcome.entrance.a.vue';
import { instanceName } from '@/config.js';
import * as os from '@/os.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

const meta = ref<Misskey.entities.MetaResponse | null>(null);

os.api('meta', { detail: true }).then(res => {
	meta.value = res;
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(computed(() => ({
	title: instanceName,
	icon: null,
})));
</script>
