<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModal ref="modal" :zPriority="'middle'">
	<div :class="$style.root">
		<i class="ti ti-notification" style="display: block; margin: auto; font-size: 3em; color: var(--MI_THEME-accent);"></i>
		<div :class="$style.title">{{ i18n.ts.pushNotification }}</div>
		<small style="opacity: 0.7;">{{ i18n.tsx._initialAccountSetting.pushNotificationDescription({ name: instance.name ?? host }) }}</small>
		<MkPushNotificationAllowButton primary showOnlyToRegister style="margin: 8px auto 14px;"/>
		<MkButton :class="$style.ok" primary rounded full @click="close ">{{ i18n.ts.ok }}</MkButton>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import { host } from '@@/js/config.js';
import MkModal from '@/components/MkModal.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import MkPushNotificationAllowButton from '@/components/MkPushNotificationAllowButton.vue';
import { miLocalStorage } from '@/local-storage.js';

const modal = useTemplateRef('modal');

const close = async () => {
	modal.value?.close();
	miLocalStorage.setItem('showPushNotificationDialog', 'false');
};
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-width: 320px;
	max-width: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
}

.title {
	font-weight: bold;
	margin: 4px auto;
}

.ok {
	margin: 8px 0 0 0;
}
</style>
