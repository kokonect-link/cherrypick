<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<MkInfo>{{ i18n.ts._initialAccountSetting.theseSettingsCanEditLater }}</MkInfo>

	<div>
		<div :class="$style.fontSize" class="_panel">
			<div v-for="size in 19" v-show="fontSize === size" :key="size" :style="{ fontSize: `${size + 6}px` }">{{ i18n.ts._mfc.dummy }}</div>
		</div>
		<div :class="$style.fontSizeSlider">
			<div :class="$style.fontSizeLeft">Aa</div>
			<MkRange
				v-model="fontSize"
				style="position: initial !important; width: 100%; margin: 0 -10px;"
				easing
				:min="1"
				:max="19"
				:step="1"
				:textConverter="(v) => `${v + 6}px`"
			/>
			<div :class="$style.fontSizeRight">Aa</div>
		</div>
		<MkInfo v-if="String(fontSize) != String(fontSizeBefore)" style="margin-top: 10px;">{{ i18n.ts.reloadToApplySetting2 }}</MkInfo>

		<MkSwitch v-model="useBoldFont" style="margin-top: .75em;">
			<template #label>{{ i18n.ts.useBoldFont }}</template>
		</MkSwitch>

		<MkSwitch v-model="useSystemFont" style="margin-top: .75em;">
			<template #label>{{ i18n.ts.useSystemFont }}</template>
		</MkSwitch>
	</div>

	<MkInfo>{{ i18n.ts._initialAccountSetting.youCanEditMoreSettingsInSettingsPageLater }}</MkInfo>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { i18n } from '@/i18n.js';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkRange from '@/components/MkRange.vue';
import { miLocalStorage } from '@/local-storage.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import { prefer } from '@/preferences.js';

const fontSize = prefer.model('fontSize');
const useSystemFont = ref(miLocalStorage.getItem('useSystemFont') != null);
const fontSizeBefore = ref(miLocalStorage.getItem('fontSize'));
const useBoldFont = ref(miLocalStorage.getItem('useBoldFont'));

watch(fontSize, () => {
	if (fontSize.value == null) {
		miLocalStorage.removeItem('fontSize');
	} else {
		miLocalStorage.setItem('fontSize', String(fontSize.value));
	}
});

watch(useBoldFont, () => {
	if (useBoldFont.value) {
		miLocalStorage.setItem('useBoldFont', useBoldFont.value);
	} else {
		miLocalStorage.removeItem('useBoldFont');
	}
});

watch(useSystemFont, () => {
	if (useSystemFont.value) {
		miLocalStorage.setItem('useSystemFont', 't');
	} else {
		miLocalStorage.removeItem('useSystemFont');
	}
});

watch([
	useBoldFont,
	useSystemFont,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

onMounted(() => {
	if (fontSizeBefore.value == null) {
		fontSizeBefore.value = String(fontSize.value);
	}
});
</script>

<style lang="scss" module>
.fontSize {
	padding: 20px;
	border-radius: 6px;
	text-align: center;
	background: var(--MI_THEME-bg);
}

.fontSizeSlider {
	display: flex;
	margin-top: 8px;
}

.fontSizeLeft, .fontSizeRight {
	position: relative;
	background: var(--MI_THEME-panel);
	font-weight: normal;
	line-height: 20px;
	border: solid 1px var(--MI_THEME-divider);
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
