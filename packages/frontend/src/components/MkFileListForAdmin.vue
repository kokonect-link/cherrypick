<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MkPagination v-slot="{ items }" :paginator="paginator">
		<div :class="[$style.fileList, { [$style.grid]: viewMode === 'grid', [$style.list]: viewMode === 'list', '_gaps_s': viewMode === 'list' }]">
			<MkA
				v-for="file in items"
				:key="file.id"
				v-tooltip.mfm="`${file.type}\n${bytes(file.size)}\n${dateString(file.createdAt)}\nby ${file.user ? '@' + Misskey.acct.toString(file.user) : 'system'}`"
				:to="`/admin/file/${file.id}`"
				:class="[$style.file, '_button']"
			>
				<!-- <div v-if="file.isSensitive" :class="$style.sensitiveLabel">{{ i18n.ts.sensitive }}</div> -->
				<div :class="$style.indicators">
					<div v-if="['image/gif'].includes(file.type)" :class="$style.indicator">GIF</div>
					<div v-if="['image/apng'].includes(file.type)" :class="$style.indicator">APNG</div>
					<div v-if="file.comment" :class="$style.indicator">ALT</div>
					<div v-if="file.isSensitive" :class="$style.indicator" style="color: var(--MI_THEME-warn);" :title="i18n.ts.sensitive"><i class="ti ti-eye-exclamation"></i></div>
				</div>
				<MkDriveFileThumbnail :class="$style.thumbnail" :file="file" fit="contain" :highlightWhenSensitive="true"/>
				<div v-if="viewMode === 'list'" :class="$style.body">
					<div>
						<small style="opacity: 0.7;">{{ file.name }}</small>
					</div>
					<div>
						<MkAcct v-if="file.user" :user="file.user"/>
						<div v-else>{{ i18n.ts.system }}</div>
					</div>
					<div>
						<span style="margin-right: 1em;">{{ file.type }}</span>
						<span>{{ bytes(file.size) }}</span>
					</div>
					<div>
						<span>{{ i18n.ts.registeredDate }}: <MkTime :time="file.createdAt" mode="detail"/></span>
					</div>
				</div>
			</MkA>
		</div>
	</MkPagination>
</div>
</template>

<script lang="ts" setup>
import * as Misskey from 'cherrypick-js';
import type { Paginator } from '@/utility/paginator.js';
import MkPagination from '@/components/MkPagination.vue';
import MkDriveFileThumbnail from '@/components/MkDriveFileThumbnail.vue';
import bytes from '@/filters/bytes.js';
import { i18n } from '@/i18n.js';
import { dateString } from '@/filters/date.js';

defineProps<{
	paginator: Paginator<'admin/drive/files'>;
	viewMode: 'grid' | 'list';
}>();
</script>

<style lang="scss" module>
@keyframes sensitive-blink {
	0% { opacity: 1; }
	50% { opacity: 0; }
}

.list {
	> .file {
		display: flex;
		width: 100%;
		height: auto;
		box-sizing: border-box;
		text-align: left;
		align-items: center;
	}

	> .file:hover {
		color: var(--MI_THEME-accent);
	}

	> .file > .thumbnail {
		width: 128px;
		height: 128px;
	}

	> .file > .body {
		margin-left: 0.3em;
		padding: 8px;
		flex: 1;

		@media (max-width: 500px) {
			font-size: 14px;
		}
	}
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
	grid-gap: 12px;

	> .file {
		position: relative;
		aspect-ratio: 1;
	}

	.thumbnail {
		width: 100%;
		height: 100%;
	}
}

.sensitiveLabel {
	position: absolute;
	z-index: 10;
	top: 8px;
	left: 8px;
	padding: 2px 4px;
	background: #ff0000bf;
	color: #fff;
	border-radius: 4px;
	font-size: 85%;
	animation: sensitive-blink 1s infinite;
}

.indicators {
	position: absolute;
	z-index: 10;
	top: 4px;
	left: 4px;
	display: inline-flex;
	margin: 3px 0 0 3px;
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
