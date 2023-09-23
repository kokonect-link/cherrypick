<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<MkInfo>{{ i18n.ts._initialAccountSetting.theseSettingsCanEditLater }}</MkInfo>

	<div>
		<div :class="$style.fontSize" class="_panel">
			<div v-if="fontSize === 1" style="font-size: 7px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 2" style="font-size: 8px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 3" style="font-size: 9px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 4" style="font-size: 10px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 5" style="font-size: 11px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 6" style="font-size: 12px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 7" style="font-size: 13px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 8" style="font-size: 14px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 9" style="font-size: 15px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 10" style="font-size: 16px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 11" style="font-size: 17px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 12" style="font-size: 18px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 13" style="font-size: 19px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 14" style="font-size: 20px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 15" style="font-size: 21px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 16" style="font-size: 22px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 17" style="font-size: 23px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 18" style="font-size: 24px;">{{ i18n.ts._mfm.dummy }}</div>
			<div v-else-if="fontSize === 19" style="font-size: 25px;">{{ i18n.ts._mfm.dummy }}</div>
		</div>
		<div :class="$style.fontSizeSlider">
			<div :class="$style.fontSizeLeft">Aa</div>
			<MkRange
				v-model="fontSize" style="position: initial !important; width: 100%; margin: 0 -10px;" :min="1" :max="19" :step="1" easing :textConverter="(v) =>
					v === 1 ? '7px' :
					v === 2 ? '8px' :
					v === 3 ? '9px' :
					v === 4 ? '10px' :
					v === 5 ? '11px' :
					v === 6 ? '12px' :
					v === 7 ? '13px' :
					v === 8 ? '14px' :
					v === 9 ? '15px' :
					v === 10 ? '16px' :
					v === 11 ? '17px' :
					v === 12 ? '18px' :
					v === 13 ? '19px' :
					v === 14 ? '20px' :
					v === 15 ? '21px' :
					v === 16 ? '22px' :
					v === 17 ? '23px' :
					v === 18 ? '24px' :
					v === 19 ? '25px' : ''"
			>
			</MkRange>
			<div :class="$style.fontSizeRight">Aa</div>
		</div>
		<MkInfo v-if="fontSize != fontSizeBefore" style="margin-top: 10px;">{{ i18n.ts.reloadToApplySetting2 }}</MkInfo>
		<MkSwitch v-model="useBoldFont" style="margin-top: .75em;">{{ i18n.ts.useBoldFont }}</MkSwitch>
	</div>

	<MkInfo>{{ i18n.ts._initialAccountSetting.youCanEditMoreSettingsInSettingsPageLater }}</MkInfo>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { i18n } from '@/i18n.js';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkRange from '@/components/MkRange.vue';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { miLocalStorage } from '@/local-storage.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { globalEvents } from '@/events.js';

const fontSizeBefore = ref(miLocalStorage.getItem('fontSize'));
const useBoldFont = ref(miLocalStorage.getItem('useBoldFont'));

async function reloadAsk() {
	if (defaultStore.state.requireRefreshBehavior === 'dialog') {
		const { canceled } = await os.confirm({
			type: 'info',
			text: i18n.ts.reloadToApplySetting,
		});
		if (canceled) return;

		unisonReload();
	} else globalEvents.emit('hasRequireRefresh', true);
}

const fontSize = computed(defaultStore.makeGetterSetter('fontSize'));

watch(fontSize, () => {
	if (fontSize.value == null) {
		miLocalStorage.removeItem('fontSize');
	} else {
		miLocalStorage.setItem('fontSize', fontSize.value as string);
	}
});

watch(useBoldFont, () => {
	if (useBoldFont.value) {
		miLocalStorage.setItem('useBoldFont', useBoldFont.value);
	} else {
		miLocalStorage.removeItem('useBoldFont');
	}
});

watch([
	useBoldFont,
], async () => {
	await reloadAsk();
});

onMounted(() => {
	if (fontSizeBefore.value == null) {
		fontSizeBefore.value = fontSize.value as string;
	}
});
</script>

<style lang="scss" module>
.fontSize {
	padding: 20px;
	border-radius: 6px;
	text-align: center;
	background: var(--bg);
}

.fontSizeSlider {
	display: flex;
	margin-top: 8px;
}

.fontSizeLeft, .fontSizeRight {
	position: relative;
	background: var(--panel);
	font-weight: normal;
	line-height: 20px;
	border: solid 1px var(--divider);
}

.fontSizeLeft {
	padding: 7px 6px 7px 18px;
	border-top-left-radius: 6px;
	border-bottom-left-radius: 6px;
	border-right-style: none;
	font-size: 12px;
}

.fontSizeRight {
	padding: 7px 18px 7px 6px;
	border-top-right-radius: 6px;
	border-bottom-right-radius: 6px;
	border-left-style: none;
	font-size: 18px;
}
</style>
