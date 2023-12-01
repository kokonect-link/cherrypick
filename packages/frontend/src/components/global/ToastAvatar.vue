<!--
SPDX-FileCopyrightText: syuilo and noridev and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component :is="link ? MkA : 'span'" v-user-preview="preview ? user.id : undefined" v-bind="bound" class="_noSelect" :class="$style.root" :style="{ color }" :title="acct(user)" @click="onClick">
	<MkImgWithBlurhash
		:class="$style.inner"
		:src="url"
		:hash="user.avatarBlurhash"
		:cover="true"
		:onlyAvgColor="true"
		@mouseover="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
		@mouseout="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
		@touchstart="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
		@touchend="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
	/>
	<span v-if="showDecoration && !decoration && user.avatarDecorations.length > 0">
		<img
			v-for="avatarDecoration in user.avatarDecorations"
			:key="avatarDecoration.id"
			:class="[$style.decoration]"
			:src="avatarDecoration.url"
			:style="{
				rotate: getDecorationAngle(avatarDecoration),
				scale: getDecorationScale(avatarDecoration),
				transform: getDecorationTransform(avatarDecoration),
				opacity: getDecorationOpacity(avatarDecoration),
			}"
			alt=""
		>
	</span>
	<img
		v-else-if="showDecoration && decoration"
		:class="[$style.decoration]"
		:src="decoration?.url"
		:style="{
			rotate: getDecorationAngle(decoration),
			scale: getDecorationScale(decoration),
			transform: getDecorationTransform(decoration),
			opacity: getDecorationOpacity(decoration),
		}"
		alt=""
	>
</component>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkA from '@/components/global/MkA.vue';
import MkImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import { extractAvgColorFromBlurhash } from '@/scripts/extract-avg-color-from-blurhash.js';
import { acct, userPage } from '@/filters/user.js';
import { defaultStore } from '@/store.js';

const props = withDefaults(defineProps<{
	user: Misskey.entities.User;
	target?: string | null;
	link?: boolean;
	preview?: boolean;
	decoration?: {
		url: string;
		angle?: number;
		flipH?: boolean;
		flipV?: boolean;
    scale?: number;
    moveX?: number;
    moveY?: number;
    opacity?: number;
	};
	forceShowDecoration?: boolean;
}>(), {
	target: null,
	link: false,
	preview: false,
	decoration: undefined,
	forceShowDecoration: false,
});

const emit = defineEmits<{
	(ev: 'click', v: MouseEvent): void;
}>();

const showDecoration = props.forceShowDecoration || defaultStore.state.showAvatarDecorations;

const bound = $computed(() => props.link
	? { to: userPage(props.user), target: props.target }
	: {});

let playAnimation = $ref(true);
if (defaultStore.state.showingAnimatedImages === 'interaction') playAnimation = false;
let playAnimationTimer = setTimeout(() => playAnimation = false, 5000);
const url = $computed(() => (defaultStore.state.disableShowingAnimatedImages || defaultStore.state.dataSaver.avatar) || (['interaction', 'inactive'].includes(<string>defaultStore.state.showingAnimatedImages) && !playAnimation)
	? getStaticImageUrl(props.user.avatarUrl)
	: props.user.avatarUrl);

function onClick(ev: MouseEvent): void {
	if (props.link) return;
	emit('click', ev);
}

function getDecorationAngle(avatarDecoration) {
	let angle = avatarDecoration.angle ?? 0;
	return angle === 0 ? undefined : `${angle * 360}deg`;
}

function getDecorationScale(avatarDecoration) {
	let scaleX = avatarDecoration.flipH ? -1 : 1;
	return scaleX === 1 ? undefined : `${scaleX} 1`;
}

function getDecorationTransform(avatarDecoration) {
	let scale = avatarDecoration.scale ?? 1;
	let moveX = avatarDecoration.moveX ?? 0;
	let moveY = avatarDecoration.moveY ?? 0;
	return `${scale === 1 ? '' : `scale(${scale})`} ${moveX === 0 && moveY === 0 ? '' : `translate(${moveX}%, ${moveY}%)`}`;
}

function getDecorationOpacity(avatarDecoration) {
	let opacity = avatarDecoration.opacity ?? 1;
	return opacity === 1 ? undefined : opacity;
}

function resetTimer() {
	playAnimation = true;
	clearTimeout(playAnimationTimer);
	playAnimationTimer = setTimeout(() => playAnimation = false, 5000);
}

let color = $ref<string | undefined>();

watch(() => props.user.avatarBlurhash, () => {
	color = extractAvgColorFromBlurhash(props.user.avatarBlurhash);
}, {
	immediate: true,
});

onMounted(() => {
	if (defaultStore.state.showingAnimatedImages === 'inactive') {
		window.addEventListener('mousemove', resetTimer);
		window.addEventListener('touchstart', resetTimer);
		window.addEventListener('touchend', resetTimer);
	}
});

onUnmounted(() => {
	if (defaultStore.state.showingAnimatedImages === 'inactive') {
		window.removeEventListener('mousemove', resetTimer);
		window.removeEventListener('touchstart', resetTimer);
		window.removeEventListener('touchend', resetTimer);
	}
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	border-radius: 100%;
	line-height: 16px;
}

.inner {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	top: 0;
	border-radius: 100%;
	z-index: 1;
	overflow: clip;
	object-fit: cover;
	width: 100%;
	height: 100%;
}

.decoration {
  position: absolute;
  z-index: 1;
  top: -50%;
  left: -50%;
  width: 200%;
  pointer-events: none;
}
</style>
