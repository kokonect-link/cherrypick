<template>
<div :class="$style.root">
	<MkAvatar :class="$style.avatar" :user="$i" link preview/>
	<div :class="$style.main">
		<div :class="$style.header">
			<MkUserName :user="$i" :nowrap="true"/>
		</div>
		<div>
			<div>
				<Mfm :text="text.trim()" :author="$i" :i="$i"/>
				<MkUrlPreview v-for="url in urls" :key="url" :url="url" :compact="true" :detail="false" :class="$style.urlPreview"/>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { $i } from '@/account';
import MkUrlPreview from '@/components/MkUrlPreview.vue';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm';
import * as mfm from 'mfm-js';

const props = defineProps<{
	text: string;
}>();
const urls = props.text ? extractUrlFromMfm(mfm.parse(props.text)) : null;
</script>

<style lang="scss" module>
.root {
	display: flex;
	margin: 0;
	padding: 0;
	overflow: clip;
	font-size: 0.95em;
}

.avatar {
	flex-shrink: 0 !important;
	display: block !important;
	margin: 0 10px 0 0 !important;
	width: 40px !important;
	height: 40px !important;
	border-radius: 8px !important;
	pointer-events: none !important;
}

.main {
	flex: 1;
	min-width: 0;
}

.header {
	margin-bottom: 2px;
	font-weight: bold;
	width: 100%;
	overflow: clip;
    text-overflow: ellipsis;
}

.urlPreview {
	margin-top: 8px;
	margin-bottom: 8px;
}

@container (min-width: 350px) {
	.avatar {
		margin: 0 10px 0 0 !important;
		width: 44px !important;
		height: 44px !important;
	}
}

@container (min-width: 500px) {
	.avatar {
		margin: 0 12px 0 0 !important;
		width: 48px !important;
		height: 48px !important;
	}
}
</style>
