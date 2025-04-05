<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkA v-user-preview="canonical" :class="[$style.root, { [$style.isMe]: isMe }]" :to="url" :behavior="navigationBehavior">
	<img
		:class="$style.icon"
		:src="avatarUrl"
		alt=""
		@mouseover="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
		@mouseout="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
		@touchstart="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
		@touchend="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
	>
	<span>
		<span>@{{ username }}</span>
		<span v-if="(host != localHost)" :class="$style.host">@{{ toUnicode(host) }}</span>
	</span>
</MkA>
</template>

<script lang="ts" setup>
import { toUnicode } from 'punycode.js';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { host as localHost } from '@@/js/config.js';
import type { MkABehavior } from '@/components/global/MkA.vue';
import { $i } from '@/i.js';
import { getStaticImageUrl } from '@/utility/media-proxy.js';
import { prefer } from '@/preferences.js';

const props = defineProps<{
	username: string;
	host: string;
	navigationBehavior?: MkABehavior;
}>();

const canonical = props.host === localHost ? `@${props.username}` : `@${props.username}@${toUnicode(props.host)}`;

const url = `/${canonical}`;

const isMe = $i && (
	`@${props.username}@${toUnicode(props.host)}` === `@${$i.username}@${toUnicode(localHost)}`.toLowerCase()
);

const playAnimation = ref(true);
if (prefer.s.showingAnimatedImages === 'interaction') playAnimation.value = false;
let playAnimationTimer = window.setTimeout(() => playAnimation.value = false, 5000);
const avatarUrl = computed(() => (prefer.s.disableShowingAnimatedImages || prefer.s.dataSaver.avatar) || (['interaction', 'inactive'].includes(<string>prefer.s.showingAnimatedImages) && !playAnimation.value)
	? getStaticImageUrl(`/avatar/@${props.username}@${props.host}`)
	: `/avatar/@${props.username}@${props.host}`,
);

function resetTimer() {
	playAnimation.value = true;
	window.clearTimeout(playAnimationTimer);
	playAnimationTimer = window.setTimeout(() => playAnimation.value = false, 5000);
}

onMounted(() => {
	if (prefer.s.showingAnimatedImages === 'inactive') {
		window.addEventListener('mousemove', resetTimer);
		window.addEventListener('touchstart', resetTimer);
		window.addEventListener('touchend', resetTimer);
	}
});

onUnmounted(() => {
	if (prefer.s.showingAnimatedImages === 'inactive') {
		window.removeEventListener('mousemove', resetTimer);
		window.removeEventListener('touchstart', resetTimer);
		window.removeEventListener('touchend', resetTimer);
	}
});
</script>

<style lang="scss" module>
.root {
	display: inline-block;
	padding: 4px 8px 4px 4px;
	border-radius: 999px;
	color: var(--MI_THEME-mention);
	background: color(from var(--MI_THEME-mention) srgb r g b / 0.1);

	&.isMe {
		color: var(--MI_THEME-mentionMe);
		background: color(from var(--MI_THEME-mentionMe) srgb r g b / 0.1);
	}
}

.icon {
	width: 1.5em;
	height: 1.5em;
	object-fit: cover;
	margin: 0 0.2em 0 0;
	vertical-align: bottom;
	border-radius: 100%;
}

.host {
	opacity: 0.5;
}
</style>
