<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkWindow
	ref="windowEl"
	:initialWidth="400"
	:initialHeight="500"
	:canResize="true"
	@close="windowEl?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ name }}</template>

	<div style="display: flex; flex-direction: column; min-height: 100%;">
		<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px; flex-grow: 1;">
			<div class="_gaps_m">
				<div v-if="url != ''" :class="$style.preview">
					<div :class="[$style.previewItem, $style.light]">
						<MkAvatar style="width: 60px; height: 60px;" :user="$i" :decorations="url != '' ? [{url}] : []" forceShowDecoration/>
					</div>
					<div :class="[$style.previewItem, $style.dark]">
						<MkAvatar style="width: 60px; height: 60px;" :user="$i" :decorations="url != '' ? [{url}] : []" forceShowDecoration/>
					</div>
				</div>
				<MkKeyValue>
					<template #key>{{ i18n.ts.id }}</template>
					<template #value>{{ name }}</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ i18n.ts.host }}</template>
					<template #value>{{ host }}</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ i18n.ts.description }}</template>
					<template #value>{{ description }}</template>
				</MkKeyValue>
			</div>
		</div>
	</div>
</MkWindow>
</template>

<script lang="ts" setup>
import { computed, useTemplateRef } from 'vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkButton from '@/components/MkButton.vue';
import MkWindow from '@/components/MkWindow.vue';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { ensureSignin } from '@/i.js';

const $i = ensureSignin();

const props = defineProps<{
	decoration: {
		id: string,
		name: string,
		description: string,
		url: string,
		host: string,
	},
}>();

const emit = defineEmits<{
	(ev: 'done'): void,
	(ev: 'closed'): void
}>();

const windowEl = useTemplateRef('windowEl');

const name = computed(() => props.decoration.name);
const description = computed(() => props.decoration.description);
const url = computed(() => props.decoration.url);
const host = computed(() => props.decoration.host);

async function done() {
	// TODO: 'admin/avatar-decorations/copy'の実装
	emit('done');
	windowEl.value?.close();
}

</script>

<style lang="scss" module>
.preview {
	display: grid;
	place-items: center;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
	gap: var(--MI-margin);
}

.previewItem {
	width: 100%;
	height: 100%;
	min-height: 160px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--MI-radius);

	&.light {
		background: #eee;
	}

	&.dark {
		background: #222;
	}
}

</style>
