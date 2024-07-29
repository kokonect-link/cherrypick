<template>
<MkModal ref="modal" :zPriority="'middle'" @closed="$emit('closed')">
	<div :class="$style.root">
		<div :class="$style.title">
			<QRCodeVue3
				:value="qrCode"
				:qrOptions="{ errorCorrectionLevel: 'H' }"
				:cornersSquareOptions="{ type: 'extra-rounded' }"
				:cornersDotOptions="{ type: 'square' }"
				:dotsOptions="{
					type: 'rounded',
					color: '#DEC5E3',
					gradient: {
						type: 'linear',
						rotation: 160,
						colorStops: [
							{ offset: 0, color: '#02129B' },
							{ offset: 1, color: '#9E1FFC' }
						]
					}, }"
			/>
		</div>
		<div class="_flexList" style="gap: 0.6rem">
			<MkButton :class="$style.gotIt" primary full @click="gotIt()">
				{{
					i18n.ts.gotIt
				}}
			</MkButton>
			<MkButton :class="$style.copyLink" full @click="copyLink()">
				{{
					i18n.ts.copyLink
				}}
			</MkButton>
		</div>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue';
import QRCodeVue3 from 'qrcode-vue3';
import MkModal from '@/components/MkModal.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n';
import * as os from '@/os';
import { copyToClipboard } from '@/scripts/copy-to-clipboard';

const props = defineProps<{
	qrCode: string;
}>();

const modal = shallowRef<InstanceType<typeof MkModal>>();

const gotIt = () => {
	modal.value?.close();
};

const copyLink = () => {
	copyToClipboard(props.qrCode);
	os.success();
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

	> img {
		border-radius: 10px;
		max-height: 100%;
		max-width: 100%;
	}
}

.title {
	font-weight: bold;

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
