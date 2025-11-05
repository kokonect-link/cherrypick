<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="note.files.length > 0" :class="[$style.root, $style.visible]">
	<div v-if="!showingFiles.includes(note.files[0].id)" :key="note.id + note.files[0].id" :class="$style.img" @click="onClick($event, note.files[0])" @dblclick="onDblClick(note.files[0])">
		<MkImgWithBlurhash
			v-if="isThumbnailAvailable && prefer.s.enableHighQualityImagePlaceholders"
			:hash="note.files[0].blurhash"
			:src="url"
			:alt="note.files[0].comment ?? undefined"
			:title="note.files[0].name"
			:class="$style.sensitiveImg"
			:cover="true"
			:forceBlurhash="true"
		/>
		<img
			v-else-if="isThumbnailAvailable && note.files[0].thumbnailUrl != null"
			:src="url ?? undefined"
			:alt="note.files[0].name"
			:title="note.files[0].name"
			:class="$style.thumbnail"
			style="object-fit: cover;"
		/>
		<div :class="$style.sensitive">
			<div>
				<div v-if="note.files[0].isSensitive" style="display: block;"><i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}{{ prefer.s.dataSaver.media ? ` (${i18n.ts.image}${note.files[0].size ? ' ' + bytes(note.files[0].size) : ''})` : '' }}</div>
				<div v-else style="display: block;"><i class="ti ti-photo"></i> {{ prefer.s.dataSaver.media && note.files[0].size ? bytes(note.files[0].size) : i18n.ts.image }}</div>
				<div>{{ i18n.ts.clickToShow }}</div>
			</div>
		</div>
	</div>
	<MkA v-else :class="[$style.img, { [$style.multipleImg]: note.files.length > 1 }]" :to="notePage(note)">
		<MkImgWithBlurhash
			v-if="isThumbnailAvailable && prefer.s.enableHighQualityImagePlaceholders"
			:hash="note.files[0].blurhash"
			:src="url"
			:alt="note.files[0].comment ?? undefined"
			:title="note.files[0].name"
			:class="$style.thumbnail"
			:cover="true"
			:forceBlurhash="false"
			@mouseover="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
			@mouseout="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
			@touchstart="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
			@touchend="prefer.s.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
		/>
		<img
			v-else-if="isThumbnailAvailable && note.files[0].thumbnailUrl != null"
			:src="url ?? undefined"
			:alt="note.files[0].name"
			:title="note.files[0].name"
			:class="$style.thumbnail"
			style="object-fit: cover;"
		/>
		<div :class="$style.indicators">
			<div v-if="['image/gif'].includes(note.files[0].type)" :class="$style.indicator">GIF</div>
			<div v-if="['image/apng'].includes(note.files[0].type)" :class="$style.indicator">APNG</div>
			<div v-if="note.files[0].comment" :class="$style.indicator">ALT</div>
			<div v-if="note.files[0].isSensitive" :class="$style.indicator" style="color: var(--MI_THEME-warn);" :title="i18n.ts.sensitive"><i class="ti ti-eye-exclamation"></i></div>
		</div>
	</MkA>
	<div v-if="note.files.length > 1" :class="$style.multiple">
		<span style="text-align: center; margin-right: 0.25em;">{{ note.files.length }}</span>
		<i class="ti ti-box-multiple-filled"></i>
	</div>
	<div :class="$style.time">
		<MkTime :time="note.createdAt" :mode="prefer.s.enableAbsoluteTime ? 'absolute' : 'relative'" colored/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import * as Misskey from 'cherrypick-js';
import * as os from '@/os.js';
import bytes from '@/filters/bytes.js';
import { getStaticImageUrl } from '@/utility/media-proxy.js';
import { notePage } from '@/filters/note.js';
import MkImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';
import MkA from '@/components/global/MkA.vue';
import { prefer } from '@/preferences.js';
import { i18n } from '@/i18n.js';
import MkRippleEffect from '@/components/MkRippleEffect.vue';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
	note: Misskey.entities.Note & { files: Misskey.entities.DriveFile[] };
}>();

const showingFiles = ref<string[]>([]);

const is = computed(() => {
	if (props.note.files[0].type.startsWith('image/')) return 'image';
	if (props.note.files[0].type.startsWith('video/')) return 'video';
	if (props.note.files[0].type === 'audio/midi') return 'midi';
	if (props.note.files[0].type.startsWith('audio/')) return 'audio';
	if (props.note.files[0].type.endsWith('/csv')) return 'csv';
	if (props.note.files[0].type.endsWith('/pdf')) return 'pdf';
	if (props.note.files[0].type.startsWith('text/')) return 'textfile';
	if ([
		'application/zip',
		'application/x-cpio',
		'application/x-bzip',
		'application/x-bzip2',
		'application/java-archive',
		'application/x-rar-compressed',
		'application/x-tar',
		'application/gzip',
		'application/x-7z-compressed',
	].some(archiveType => archiveType === props.note.files[0].type)) return 'archive';
	return 'unknown';
});

const isThumbnailAvailable = computed(() => {
	return props.note.files[0].thumbnailUrl || (['interaction', 'inactive'].includes(<string>prefer.s.showingAnimatedImages) && !playAnimation.value)
		? (is.value === 'image' || is.value === 'video')
		: false;
});

const playAnimation = ref(true);
if (prefer.s.showingAnimatedImages === 'interaction') playAnimation.value = false;
let playAnimationTimer = window.setTimeout(() => playAnimation.value = false, 5000);
const url = computed(() => (prefer.s.loadRawImages)
	? props.note.files[0].url
	: (prefer.s.disableShowingAnimatedImages || prefer.s.dataSaver.media) || (['interaction', 'inactive'].includes(<string>prefer.s.showingAnimatedImages) && !playAnimation.value)
		? getStaticImageUrl(props.note.files[0].url)
		: props.note.files[0].thumbnailUrl,
);

async function onClick(ev: MouseEvent, image: Misskey.entities.DriveFile) {
	if (!showingFiles.value.includes(image.id)) {
		ev.stopPropagation();
		if (image.isSensitive && prefer.s.confirmWhenRevealingSensitiveMedia) {
			const { canceled } = await os.confirm({
				type: 'question',
				text: i18n.ts.sensitiveMediaRevealConfirm,
			});
			if (canceled) return;
			showingFiles.value.push(image.id);
		}
	}

	if (prefer.s.nsfwOpenBehavior === 'doubleClick') os.popup(MkRippleEffect, { x: ev.clientX, y: ev.clientY }, {});
	if (prefer.s.nsfwOpenBehavior === 'click') showingFiles.value.push(image.id);
}

async function onDblClick(image: Misskey.entities.DriveFile) {
	if (!showingFiles.value.includes(image.id) && prefer.s.nsfwOpenBehavior === 'doubleClick') showingFiles.value.push(image.id);
}

watch(() => props.note, () => {
	if (prefer.s.nsfw === 'force' || prefer.s.dataSaver.media) {
		//hide = true;
	} else {
		for (const image of props.note.files) {
			if (image.isSensitive) {
				if (prefer.s.nsfw !== 'ignore') {
					//hide = true;
				} else {
					if (!showingFiles.value.includes(image.id)) {
						showingFiles.value.push(image.id);
					}
				}
			} else {
				if (!showingFiles.value.includes(image.id)) {
					showingFiles.value.push(image.id);
				}
			}
		}
	}
}, {
	deep: true,
	immediate: true,
});

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
	position: relative;
}

.img {
	display: flex;
	position: relative;
	height: 224px;
	border-radius: 3px;
	overflow: clip;
}

.empty {
	margin: 0;
	padding: 16px;
	text-align: center;
}

.sensitiveImg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	filter: brightness(0.7);
}

.sensitive {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: grid;
	place-items: center;
	font-size: 0.8em;
	color: #fff;
	cursor: pointer;
}
.sensitive > div{
	display: flex;
	flex-direction: column;
	align-items: center;
}

.visible {
	position: relative;
	-webkit-tap-highlight-color: transparent;
	//box-shadow: 0 0 0 1px var(--MI_THEME-divider) inset;
	background: var(--MI_THEME-bg);
	background-size: 16px 16px;
}

html[data-color-scheme=dark] .visible {
	--c: rgb(255 255 255 / 2%);
	background-image: linear-gradient(45deg, var(--c) 16.67%, var(--MI_THEME-bg) 16.67%, var(--MI_THEME-bg) 50%, var(--c) 50%, var(--c) 66.67%, var(--MI_THEME-bg) 66.67%, var(--MI_THEME-bg) 100%);
}

html[data-color-scheme=light] .visible {
	--c: rgb(0 0 0 / 2%);
	background-image: linear-gradient(45deg, var(--c) 16.67%, var(--MI_THEME-bg) 16.67%, var(--MI_THEME-bg) 50%, var(--c) 50%, var(--c) 66.67%, var(--MI_THEME-bg) 66.67%, var(--MI_THEME-bg) 100%);
}

.multipleImg {
	filter: brightness(0.9);
}

.multiple {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 10px;
	right: 10px;
	font-size: 1.25em;
	color: #fff;
	opacity: .9;
	filter: drop-shadow(0 0 1.5px #6060608a);
}

.indicators {
	display: inline-flex;
	position: absolute;
	top: 10px;
	left: 10px;
	pointer-events: none;
	opacity: .5;
	gap: 6px;
}

.indicator {
	/* Hardcode to black because either --MI_THEME-bg or --MI_THEME-fg makes it hard to read in dark/light mode */
	background-color: black;
	border-radius: 6px;
	color: hsl(from var(--MI_THEME-accent) h s calc(l + 10));
	display: inline-block;
	font-weight: bold;
	font-size: 0.8em;
	padding: 2px 5px;
}

.thumbnail {
	width: 100%;
}

.time {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	bottom: 10px;
	right: 10px;
	text-decoration: none;
	color: #fff;
	opacity: .9;
	filter: drop-shadow(0 0 1.5px #6060608a);

	&:hover {
		text-decoration: none;
	}
}

@container (max-width: 785px) {
	.img {
		height: 192px;
	}
}

@container (max-width: 660px) {
	.img {
		height: 160px;
	}
}

@container (max-width: 530px) {
	.img {
		height: 145px;
	}

	.multiple {
		top: 8.5px;
		right: 8.5px;
		font-size: 1.1em;
	}
}

@container (max-width: 450px) {
	.img {
		height: 128px;
	}

	.multiple {
		top: 9px;
		right: 9px;
		font-size: 1.05em;
	}
}
</style>
