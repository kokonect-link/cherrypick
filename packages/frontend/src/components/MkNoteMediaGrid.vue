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
		:data-scroll-anchor="file.id"
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
		<div v-if="isTimeline" :class="$style.bottom">
			<MkAvatar v-if="!prefer.s.hideAvatarsInNote" :class="$style.avatar" :user="note.user" link preview noteClick/>
			<div style="white-space: nowrap;">
				<MkA v-user-preview="note.user.id" :class="$style.name" :to="userPage(note.user)" noteClick>
					<MkUserName :user="note.user"/>
				</MkA>
				<div :class="$style.username"><MkAcct :user="note.user"/></div>
			</div>
		</div>
		<div :class="[$style.time, { [$style.isTimeline]: isTimeline }]">
			<MkTime :time="note.createdAt" :mode="prefer.s.enableAbsoluteTime ? 'absolute' : 'relative'" colored/>
		</div>
		<div :class="$style.sensitive">
			<div>
				<div v-if="file.isSensitive"><i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}{{ prefer.s.dataSaver.media && file.size ? ` (${bytes(file.size)})` : '' }}</div>
				<div v-else><i class="ti ti-photo"></i> {{ prefer.s.dataSaver.media && file.size ? bytes(file.size) : i18n.ts.image }}</div>
				<div>{{ i18n.ts.clickToShow }}</div>
			</div>
		</div>
	</div>
	<MkA v-else :class="[$style.filePreview, { [$style.square]: square }]" :data-scroll-anchor="file.id" :to="notePage(note)">
		<MkDriveFileThumbnail
			:file="file"
			fit="cover"
			:highlightWhenSensitive="prefer.s.highlightSensitiveMedia"
			:large="true"
			:class="$style.file"
		/>
		<div v-if="isTimeline" :class="$style.bottom">
			<MkAvatar v-if="!prefer.s.hideAvatarsInNote" :class="$style.avatar" :user="note.user" link preview noteClick/>
			<div style="white-space: nowrap;">
				<MkA v-user-preview="note.user.id" :class="$style.name" :to="userPage(note.user)" noteClick>
					<MkUserName :user="note.user"/>
				</MkA>
				<div :class="$style.username"><MkAcct :user="note.user"/></div>
			</div>
		</div>
		<div :class="[$style.time, { [$style.isTimeline]: isTimeline }]">
			<MkTime :time="note.createdAt" :mode="prefer.s.enableAbsoluteTime ? 'absolute' : 'relative'" colored/>
		</div>
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
import { userPage } from '@/filters/user.js';

defineProps<{
	note: Misskey.entities.Note;
	square?: boolean;
	isTimeline?: boolean;
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
	border-radius: calc(var(--MI-radius) / 2);
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

.bottom {
	display: inline-flex;
	position: absolute;
	bottom: 10px;
	left: 10px;
	//opacity: .7;
	gap: 6px;
	z-index: 1;

	&::before {
		content: '';
		position: absolute;
		bottom: -10px;
		left: -10px;
		right: -300px;
		height: 80px;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.7) 0%,
			rgba(0, 0, 0, 0.4) 40%,
			rgba(0, 0, 0, 0) 100%
		);
		pointer-events: none;
		z-index: -1;
		border-radius: calc(var(--MI-radius) / 2);
	}
}

.avatar {
	flex-shrink: 0;
	display: block !important;
	position: sticky !important;
	margin: 0 3px 0 0;
	width: 36px;
	height: 36px;
	background: var(--MI_THEME-panel);
	filter: drop-shadow(0 0 1.5px #6060608a);
}

.name {
	flex-shrink: 1;
	display: block;
	padding: 0;
	overflow: hidden;
	overflow-wrap: anywhere;
	color: #fff;
	font-size: 1em;
	font-weight: bold;
	text-decoration: none;
	text-overflow: ellipsis;
	max-width: 180px;
	filter: drop-shadow(0 0 1.5px #6060608a);

	&::-webkit-scrollbar {
		display: none;
	}

	&:hover {
		color: var(--MI_THEME-nameHover);
		text-decoration: none;
	}
}

.username {
	flex-shrink: 9999999;
	overflow: hidden;
	color: #fff;
	text-overflow: ellipsis;
	font-size: .95em;
	max-width: 180px;
	filter: drop-shadow(0 0 1.5px #6060608a);

	&::-webkit-scrollbar {
		display: none;
	}
}

.time {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	bottom: 5px;
	right: 8px;
	color: #fff;
	text-decoration: none;
	font-size: 1em;
	z-index: 1;
	filter: drop-shadow(0 0 1.5px #6060608a);

	&.isTimeline {
		bottom: 48px;
		right: 10px;
	}

	&:hover {
		text-decoration: none;
	}
}

@container (max-width: 500px) {
	.bottom {
		bottom: 9px;
		left: 9px;
	}

	.avatar {
		width: 32px;
		height: 32px;
	}

	.name {
		font-size: .9em;
	}

	.username {
		font-size: .8em;
	}

	.name, .username {
		max-width: 200px;
	}

	.time {
		font-size: .8em;

		&.isTimeline {
			bottom: 38px;
			right: 9px;
		}
	}
}

@container (max-width: 450px) {
	.bottom {
		display: initial;
		bottom: 7.5px;
		left: 7.5px;
	}

	.avatar {
		width: 24px;
		height: 24px;
	}

	.name {
		font-size: .85em;
	}

	.username {
		font-size: .75em;
	}

	.name, .username {
		max-width: 150px;
	}

	.time {
		font-size: .75em;

		&.isTimeline {
			bottom: 34px;
			right: 7.5px;
		}
	}
}
</style>
