<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="700"
	@close="cancel"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.avatarDecorations }}</template>

	<div>
		<MkSpacer :marginMin="20" :marginMax="28">
			<div style="text-align: center;">
				<div :class="$style.name">{{ decoration.name }}</div>
				<MkAvatar style="width: 64px; height: 64px; margin-bottom: 20px;" :user="$i" :decoration="{ url: decoration.url, angle, flipH, scale, moveX, moveY, opacity }" forceShowDecoration/>
			</div>
			<div class="_gaps_s">
				<MkRadios v-model="insertLayer">
					<template #label>{{ i18n.ts.layer }}</template>
					<option value="0">1</option>
					<option value="1">2</option>
					<option value="2">3</option>
					<option value="3">4</option>
					<option value="4">5</option>
				</MkRadios>
				<MkRange v-model="angle" continuousUpdate :min="-0.5" :max="0.5" :step="0.025" :textConverter="(v) => `${Math.floor(v * 360)}°`">
					<template #label>{{ i18n.ts.angle }}</template>
				</MkRange>
				<MkSwitch v-model="flipH">
					<template #label>{{ i18n.ts.flip }}</template>
				</MkSwitch>
				<MkRange v-model="scale" continuousUpdate :min="0.5" :max="1.5" :step="0.05" :textConverter="(v) => `${v.toFixed(2)}x`">
					<template #label>{{ i18n.ts.scale }}</template>
				</MkRange>
				<MkRange v-model="moveX" continuousUpdate :min="-25" :max="25" :step="1">
					<template #label>{{ i18n.ts.Xcoordinate }}</template>
				</MkRange>
				<MkRange v-model="moveY" continuousUpdate :min="-25" :max="25" :step="1">
					<template #label>{{ i18n.ts.Ycoordinate }}</template>
				</MkRange>
				<MkRange v-model="opacity" continuousUpdate :min="0.1" :max="1" :step="0.05" :textConverter="(v) => `${(v * 100).toFixed(2)}%`">
					<template #label>{{ i18n.ts.opacity }}</template>
				</MkRange>
			</div>
		</MkSpacer>

		<div :class="$style.footer" class="_buttonsCenter">
			<MkButton v-if="using" primary rounded @click="attach"><i class="ti ti-check"></i> {{ i18n.ts.update }}</MkButton>
			<MkButton v-if="using" rounded @click="detach"><i class="ti ti-x"></i> {{ i18n.ts.detach }}</MkButton>
			<MkButton v-else primary rounded @click="attach"><i class="ti ti-check"></i> {{ i18n.ts.attach }}</MkButton>
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { shallowRef, ref, computed } from 'vue';
import MkButton from '@/components/MkButton.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import MkFolder from '@/components/MkFolder.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkRange from '@/components/MkRange.vue';
import { $i } from '@/account.js';

const props = defineProps<{
	decoration: {
		id: string;
		url: string;
	}
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const dialog = shallowRef<InstanceType<typeof MkModalWindow>>();
const using = computed(() => $i.avatarDecorations.some(x => x.id === props.decoration.id));
const layerNum = (() => {
	let result = -1;
	$i.avatarDecorations.some((x, i) => {
		if (x.id === props.decoration.id) {
			result = i;
			return true;
		}
		return false;
	});
	return result;
})();
const insertLayer = ref(layerNum === -1 ? String($i.avatarDecorations.length) : String(layerNum));
const angle = ref(using.value ? $i.avatarDecorations.find(x => x.id === props.decoration.id).angle ?? 0 : 0);
const flipH = ref(using.value ? $i.avatarDecorations.find(x => x.id === props.decoration.id).flipH ?? false : false);
const scale = ref(using.value ? $i.avatarDecorations.find(x => x.id === props.decoration.id).scale ?? 1 : 1);
const moveX = ref(using.value ? $i.avatarDecorations.find(x => x.id === props.decoration.id).moveX ?? 0 : 0);
const moveY = ref(using.value ? $i.avatarDecorations.find(x => x.id === props.decoration.id).moveY ?? 0 : 0);
const opacity = ref(using.value ? $i.avatarDecorations.find(x => x.id === props.decoration.id).opacity ?? 1 : 1);

function cancel() {
	dialog.value.close();
}

async function attach() {
	const decoration = {
		id: props.decoration.id,
		angle: angle.value,
		flipH: flipH.value,
		scale: scale.value,
		moveX: moveX.value,
		moveY: moveY.value,
		opacity: opacity.value,
	};
	const updatedDecorations = $i.avatarDecorations.toSpliced(layerNum, layerNum === -1 ? 0 : 1).toSpliced(Number(insertLayer.value), 0, decoration);
	await os.apiWithDialog('i/update', {
		avatarDecorations: updatedDecorations,
	});
	$i.avatarDecorations = updatedDecorations;

	dialog.value.close();
}

async function detach() {
	if (layerNum === -1) return;
	const deletedDecorations = $i.avatarDecorations.toSpliced(layerNum, 1);
	await os.apiWithDialog('i/update', {
		avatarDecorations: deletedDecorations,
	});
	$i.avatarDecorations = deletedDecorations;

	dialog.value.close();
}
</script>

<style lang="scss" module>
.name {
	position: relative;
	z-index: 10;
	font-weight: bold;
	margin-bottom: 28px;
}

.footer {
	position: sticky;
	bottom: 0;
	left: 0;
	padding: 12px;
	border-top: solid 0.5px var(--divider);
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
}
</style>
