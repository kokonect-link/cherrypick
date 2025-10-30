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
			<div
				ref="qrCodeEl" v-flip
				style="cursor: default;"
				:class="$style.qr"
			></div>
		</div>
		<div class="_flexList" style="gap: 0.6rem">
			<MkButton :class="$style.copyLink" rounded full @click="copyLink()"><i class="ti ti-link"></i> {{ i18n.ts.copyLink }}</MkButton>
			<MkButton :class="$style.gotIt" primary rounded full @click="gotIt()"><i class="ti ti-check"></i> {{ i18n.ts.gotIt }}</MkButton>
		</div>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { computed, onMounted, useTemplateRef } from 'vue';
import MkModal from '@/components/MkModal.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { copyToClipboard } from '@/utility/copy-to-clipboard.js';
import QRCodeStyling from 'qr-code-styling';
import { instance } from '@/instance.js';
import { getStaticImageUrl } from '@/utility/media-proxy.js';
import tinycolor from 'tinycolor2';

const props = defineProps<{
	qrCode: string;
}>();

const modal = useTemplateRef('modal');

const qrCodeEl = useTemplateRef('qrCodeEl');

const qrColor = computed(() => tinycolor(instance.themeColor ?? 'rgb(255, 188, 220)'));
const qrHsl = computed(() => qrColor.value.toHsl());

const qrCodeInstance = new QRCodeStyling({
	width: 600,
	height: 600,
	margin: 42,
	type: 'canvas',
	data: props.qrCode,
	image: instance.iconUrl ? getStaticImageUrl(instance.iconUrl) : '/favicon.ico',
	qrOptions: {
		typeNumber: 0,
		mode: 'Byte',
		errorCorrectionLevel: 'H',
	},
	imageOptions: {
		hideBackgroundDots: true,
		imageSize: 0.3,
		margin: 16,
		crossOrigin: 'anonymous',
	},
	dotsOptions: {
		type: 'dots',
		color: tinycolor(`hsl(${qrHsl.value.h}, 100, 18)`).toRgbString(),
	},
	cornersDotOptions: {
		type: 'dot',
	},
	cornersSquareOptions: {
		type: 'extra-rounded',
	},
	backgroundOptions: {
		//color: tinycolor(`hsl(${qrHsl.value.h}, 100, 97)`).toRgbString(),
	},
});

const gotIt = () => {
	modal.value?.close();
};

const copyLink = () => {
	copyToClipboard(props.qrCode, 'link');
};

onMounted(() => {
	if (qrCodeEl.value != null) {
		qrCodeInstance.append(qrCodeEl.value);
	}
});
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

.qr {
	position: relative;
	margin: 0 auto;
	width: 100%;
	max-width: 230px;
	border-radius: 12px;
	overflow: clip;
	aspect-ratio: 1;

	> svg,
	> canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
}

.copyLink {
	margin: 8px 0 0 0;
}

.gotIt {
	margin: 8px 0 0 0;
}
</style>
