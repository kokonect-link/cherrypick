<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<template v-for="file in note.files">
	<div
		v-if="(((
			(prefer.s.nsfw === 'force' || file.isSensitive) &&
			prefer.s.nsfw !== 'ignore'
		) || (prefer.s.dataSaver.media && file.type.startsWith('image/'))) &&
			!showingFiles.has(file.id)
		)"
		:class="[$style.filePreview, { [$style.square]: square }]"
		@click="onClick($event, file)"
		@dblclick="onDblClick(file)"
	>
		<MkDriveFileThumbnail
			:file="file"
			fit="cover"
			:highlightWhenSensitive="prefer.s.highlightSensitiveMedia"
			:forceBlurhash="true"
			:large="true"
			:class="$style.file"
		/>
		<div :class="$style.sensitive">
			<div>
				<div v-if="file.isSensitive"><i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}{{ prefer.s.dataSaver.media && file.size ? ` (${bytes(file.size)})` : '' }}</div>
				<div v-else><i class="ti ti-photo"></i> {{ prefer.s.dataSaver.media && file.size ? bytes(file.size) : i18n.ts.image }}</div>
				<div>{{ i18n.ts.clickToShow }}</div>
			</div>
		</div>
	</div>
	<MkA v-else :class="[$style.filePreview, { [$style.square]: square }]" :to="notePage(note)">
		<MkDriveFileThumbnail
			:file="file"
			fit="cover"
			:highlightWhenSensitive="prefer.s.highlightSensitiveMedia"
			:large="true"
			:class="$style.file"
		/>
		<div :class="$style.indicators">
			<div v-if="['image/gif'].includes(file.type)" :class="$style.indicator">GIF</div>
			<div v-if="['image/apng'].includes(file.type)" :class="$style.indicator">APNG</div>
			<div v-if="file.comment" :class="$style.indicator">ALT</div>
			<div v-if="file.isSensitive" :class="$style.indicator" style="color: var(--MI_THEME-warn);" :title="i18n.ts.sensitive"><i class="ti ti-eye-exclamation"></i></div>
		</div>
	</MkA>
</template>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import * as os from '@/os.js';
import { notePage } from '@/filters/note.js';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences.js';
import bytes from '@/filters/bytes.js';

import MkDriveFileThumbnail from '@/components/MkDriveFileThumbnail.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';

defineProps<{
	note: Misskey.entities.Note;
	square?: boolean;
}>();

const showingFiles = ref<Set<string>>(new Set());

async function onClick(ev: MouseEvent, image: Misskey.entities.DriveFile) {
	if (!showingFiles.value.has(image.id)) {
		ev.stopPropagation();
		if (image.isSensitive && prefer.s.confirmWhenRevealingSensitiveMedia) {
			const { canceled } = await os.confirm({
				type: 'question',
				text: i18n.ts.sensitiveMediaRevealConfirm,
			});
			if (canceled) return;
			showingFiles.value.add(image.id);
		}
	}

	if (prefer.s.nsfwOpenBehavior === 'doubleClick') os.popup(MkRippleEffect, { x: ev.clientX, y: ev.clientY }, {});
	if (prefer.s.nsfwOpenBehavior === 'click') showingFiles.value.add(image.id);
}

async function onDblClick(image: Misskey.entities.DriveFile) {
	if (!showingFiles.value.has(image.id) && prefer.s.nsfwOpenBehavior === 'doubleClick') showingFiles.value.add(image.id);
}
</script>

<style lang="scss" module>
.square {
	width: 100%;
	height: auto;
	aspect-ratio: 1;
}

.filePreview {
	position: relative;
	height: 128px;
	border-radius: calc(var(--MI-radius) / 2);
	overflow: clip;

	&:hover {
		text-decoration: none;
	}

	&.square {
		height: 100%;
	}
}

.file {
	width: 100%;
	height: 100%;
	border-radius: calc(var(--MI-radius) / 2);
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
	text-align: center;
	padding: 8px;
	box-sizing: border-box;
	color: #fff;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
	cursor: pointer;
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
</style>
