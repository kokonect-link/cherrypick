<template>
<MkModal ref="modal" :zPriority="'middle'" @closed="$emit('closed')">
	<div :class="$style.root">
		<div :class="$style.title">
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
			<MkButton :class="$style.gotIt" primary full @click="gotIt()">{{ i18n.ts.gotIt }}</MkButton>
			<MkButton :class="$style.copyLink" full @click="copyLink()">{{ i18n.ts.copyLink }}</MkButton>
		</div>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue';
import QRCodeVue3 from 'qrcode-vue3';
import MkModal from '@/components/MkModal.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { copyToClipboard } from '@/scripts/copy-to-clipboard.js';

const props = defineProps<{
	qrCode: string;
}>();

const modal = shallowRef<InstanceType<typeof MkModal>>();

const gotIt = () => {
	modal.value?.close();
};

const copyLink = () => {
	copyToClipboard(props.qrCode);
	os.toast(i18n.ts.copiedContent, 'copied');
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
	background: var(--panel);
	border-radius: var(--radius);
}

.title {
	font-weight: bold;

	> div {
		> div {
			> img {
				max-width: 60%;
			}
		}
	}

	> p {
		margin: 0;
	}
}

.time {
	font-size: 0.8rem;
}

.gotIt {
	margin: 8px 0 0 0;
}

.copyLink {
	margin: 8px 0 0 0;
}
</style>
