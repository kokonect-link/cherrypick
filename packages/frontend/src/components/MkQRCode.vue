<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModal ref="modal" :zPriority="'middle'" @closed="$emit('closed')">
	<div :class="$style.root">
		<div :class="$style.body">
			<div :class="$style.title">{{ i18n.ts._getQRCode.title }}</div>
			<div :class="$style.description">{{ i18n.ts._getQRCode.description }}</div>
			<QRCodeVue3
				:value="qrCode"
				:qrOptions="{ errorCorrectionLevel: 'Q' }"
				:cornersSquareOptions="{ type: 'square' }"
				:cornersDotOptions="{ type: 'square' }"
				:dotsOptions="{
					type: 'square',
				}"
			/>
		</div>
		<div class="_flexList" style="gap: 0.6rem">
			<MkButton :class="$style.copyLink" rounded full @click="copyLink()">{{ i18n.ts.copyLink }}</MkButton>
			<MkButton :class="$style.gotIt" primary rounded full @click="gotIt()">{{ i18n.ts.gotIt }}</MkButton>
		</div>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import QRCodeVue3 from 'qrcode-vue3';
import MkModal from '@/components/MkModal.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { copyToClipboard } from '@/utility/copy-to-clipboard.js';

const props = defineProps<{
	qrCode: string;
}>();

const modal = useTemplateRef('modal');

const gotIt = () => {
	modal.value?.close();
};

const copyLink = () => {
	copyToClipboard(props.qrCode, 'link');
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

.body {
	font-weight: bold;

	> div {
		> div {
			> img {
				max-width: 60%;
				padding: 10px 0;
			}
		}
	}

	> p {
		margin: 0;
	}
}

.title {
	font-size: larger;
	margin-bottom: 4px;
}

.description {
	font-weight: normal;
	margin-bottom: 12px;
}

.time {
	font-size: 0.8rem;
}

.copyLink {
	margin: 8px 0 0 0;
}

.gotIt {
	margin: 8px 0 0 0;
}
</style>
