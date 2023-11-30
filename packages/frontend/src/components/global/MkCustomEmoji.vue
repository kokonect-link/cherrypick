<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<span v-if="errored">:{{ customEmojiName }}:</span>
<img
	v-else
	:class="[$style.root, { [$style.normal]: normal, [$style.noStyle]: noStyle }]"
	:src="url"
	:alt="alt"
	:title="alt"
	decoding="async"
	@error="errored = true"
	@load="errored = false"
	@click.stop="onClick"
	@mouseover="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
	@mouseout="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
	@touchstart="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
	@touchend="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
/>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, inject } from 'vue';
import { getProxiedImageUrl, getStaticImageUrl } from '@/scripts/media-proxy.js';
import { defaultStore } from '@/store.js';
import { customEmojis, customEmojisMap } from '@/custom-emojis.js';
import * as os from '@/os.js';
import * as sound from '@/scripts/sound.js';
import copyToClipboard from '@/scripts/copy-to-clipboard.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/account.js';

const props = defineProps<{
	name: string;
	normal?: boolean;
	noStyle?: boolean;
	host?: string | null;
	url?: string;
	useOriginalSize?: boolean;
	menu?: boolean;
	menuReaction?: boolean;
}>();

const react = inject<((name: string) => void) | null>('react', null);

const customEmojiName = computed(() => (props.name[0] === ':' ? props.name.substring(1, props.name.length - 1) : props.name).replace('@.', ''));
const isLocal = computed(() => !props.host && (customEmojiName.value.endsWith('@.') || !customEmojiName.value.includes('@')));

const rawUrl = computed(() => {
	if (props.url) {
		return props.url;
	}
	if (isLocal.value) {
		return customEmojisMap.get(customEmojiName.value)?.url ?? null;
	}
	return props.host ? `/emoji/${customEmojiName.value}@${props.host}.webp` : `/emoji/${customEmojiName.value}.webp`;
});

let playAnimation = $ref(true);
if (defaultStore.state.showingAnimatedImages === 'interaction') playAnimation = false;
let playAnimationTimer = setTimeout(() => playAnimation = false, 5000);
const url = computed(() => {
	if (rawUrl.value == null) return null;

	const proxied =
		(rawUrl.value.startsWith('/emoji/') || (props.useOriginalSize && isLocal.value))
			? rawUrl.value
			: getProxiedImageUrl(
				rawUrl.value,
				props.useOriginalSize ? undefined : 'emoji',
				false,
				true,
			);
	return defaultStore.reactiveState.disableShowingAnimatedImages.value || (['interaction', 'inactive'].includes(<string>defaultStore.reactiveState.showingAnimatedImages.value) && !playAnimation)
		? getStaticImageUrl(proxied)
		: proxied;
});

const alt = computed(() => `:${customEmojiName.value}:`);
let errored = $ref(url.value == null);

function onClick(ev: MouseEvent) {
	if (props.menu) {
		os.popupMenu([{
			type: 'label',
			text: `:${props.name}:`,
		}, ...((customEmojis.value.find(it => it.name === customEmojiName.value)?.name ?? null) ? [{
			text: i18n.ts.copy,
			icon: 'ti ti-copy',
			action: () => {
				copyToClipboard(`:${props.name}:`);
			},
		}] : []), ...(props.host && $i && ($i.isAdmin || $i.policies.canManageCustomEmojis) ? [{
			text: i18n.ts.import,
			icon: 'ti ti-plus',
			action: () => {
				os.apiWithDialog('admin/emoji/steal', {
					name: customEmojiName.value,
					host: props.host,
				});
			},
		}] : []), ...(props.menuReaction && react ? [{
			text: i18n.ts.doReaction,
			icon: 'ti ti-mood-plus',
			action: () => {
				sound.play('reaction');
				react(`:${props.name}:`);
			},
		}] : [])], ev.currentTarget ?? ev.target);
	}
}

function resetTimer() {
	playAnimation = true;
	clearTimeout(playAnimationTimer);
	playAnimationTimer = setTimeout(() => playAnimation = false, 5000);
}

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
	height: 2em;
	vertical-align: middle;
	transition: transform 0.2s ease;

	&:hover {
		transform: scale(1.2);
	}
}

.normal {
	height: 1.25em;
	vertical-align: -0.25em;

	&:hover {
		transform: none;
	}
}

.noStyle {
	height: auto !important;
}
</style>
