<template>
<div :class="$style.root" :style="bg">
	<img v-if="faviconUrl" :class="$style.icon" :src="faviconUrl"/>
	<div :class="$style.name">{{ instance.name }}</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { instanceName } from '@/config';
import { instance as Instance } from '@/instance';
import { getProxiedImageUrlNullable } from '@/scripts/media-proxy';

const props = defineProps<{
	instance?: {
		faviconUrl?: string
		name: string
		themeColor?: string
	}
}>();

// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	name: instanceName,
	themeColor: (document.querySelector('meta[name="theme-color-orig"]') as HTMLMetaElement).content,
};

const faviconUrl = $computed(() => props.instance ? getProxiedImageUrlNullable(props.instance.faviconUrl, 'preview') : getProxiedImageUrlNullable(Instance.iconUrl, 'preview') ?? getProxiedImageUrlNullable(Instance.faviconUrl, 'preview') ?? '/favicon.ico');

const themeColor = instance.themeColor ?? '#777777';

const bg = {
	background: `${themeColor}`,
};
</script>

<style lang="scss" module>
$height: 2ex;

.root {
	display: flex;
	align-items: center;
	height: $height;
	border-radius: .3rem;
	overflow: clip;
	color: #fff;
	margin-top: 5px;
	padding: 1px 3px 1px 0;
	text-shadow: /* .866 ≈ sin(60deg) */
		1px 0 1px #000,
		.866px .5px 1px #000,
		.5px .866px 1px #000,
		0 1px 1px #000,
		-.5px .866px 1px #000,
		-.866px .5px 1px #000,
		-1px 0 1px #000,
		-.866px -.5px 1px #000,
		-.5px -.866px 1px #000,
		0 -1px 1px #000,
		.5px -.866px 1px #000,
		.866px -.5px 1px #000;
}

.icon {
	height: 2.5ex;
	flex-shrink: 0;
	border-radius: .3rem;
}

.name {
	margin-left: 4px;
	line-height: 1;
	font-size: 0.9em;
	font-weight: bold;
	white-space: nowrap;
	overflow: visible;
	text-shadow: -1px -1px 0 var(--bg), 1px -1px 0 var(--bg),
	-1px 1px 0 var(--bg), 1px 1px 0 var(--bg);
}
</style>
