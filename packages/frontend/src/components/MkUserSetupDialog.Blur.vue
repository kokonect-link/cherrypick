<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<MkInfo>{{ i18n.ts._initialAccountSetting.theseSettingsCanEditLater }}</MkInfo>

	<MkFolder>
		<template #label>{{ i18n.ts.useBlurEffect }}</template>
		<template #icon><i class="ti ti-blur"></i></template>
		<template #suffix>{{ useBlurEffect ? i18n.ts.on : i18n.ts.off }}</template>

		<MkInfo v-if="useBlurEffect" style="margin-bottom: 15px;" warn>{{ i18n.ts.performanceWarning }}</MkInfo>
		<MkSwitch v-model="useBlurEffect">{{ i18n.ts.useBlurEffect }}<template #caption>{{ i18n.ts.useBlurEffectDescription }}</template></MkSwitch>
	</MkFolder>

	<MkFolder>
		<template #label>{{ i18n.ts.useBlurEffectForModal }}</template>
		<template #icon><i class="ti ti-blur"></i></template>
		<template #suffix>{{ useBlurEffectForModal ? i18n.ts.on : i18n.ts.off }}</template>

		<MkInfo v-if="useBlurEffectForModal" style="margin-bottom: 15px;" warn>{{ i18n.ts.performanceWarning }}</MkInfo>
		<MkSwitch v-model="useBlurEffectForModal">{{ i18n.ts.useBlurEffectForModal }}</MkSwitch>
	</MkFolder>

	<MkInfo>{{ i18n.ts._initialAccountSetting.youCanEditMoreSettingsInSettingsPageLater }}</MkInfo>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { i18n } from '@/i18n.js';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkFolder from '@/components/MkFolder.vue';
import { defaultStore } from '@/store.js';

const useBlurEffect = computed(defaultStore.makeGetterSetter('useBlurEffect'));
const useBlurEffectForModal = computed(defaultStore.makeGetterSetter('useBlurEffectForModal'));
</script>

<style lang="scss" module>

</style>
