<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MkPagination v-slot="{items}" :pagination="pagination" class="urempief" :class="{ grid: viewMode === 'grid' }">
		<MkA
			v-for="file in (items as Misskey.entities.DriveFile[])"
			:key="file.id"
			v-tooltip.mfm="`${file.type}\n${bytes(file.size)}\n${dateString(file.createdAt)}\nby ${file.user ? '@' + Misskey.acct.toString(file.user) : 'system'}`"
			:to="`/admin/file/${file.id}`"
			class="file _button"
		>
			<!-- <div v-if="file.isSensitive" class="sensitive-label">{{ i18n.ts.sensitive }}</div> -->
			<div class="indicators">
				<div v-if="['image/gif'].includes(file.type)" class="indicator">GIF</div>
				<div v-if="['image/apng'].includes(file.type)" class="indicator">APNG</div>
				<div v-if="file.comment" class="indicator">ALT</div>
				<div v-if="file.isSensitive" class="indicator" style="color: var(--MI_THEME-warn);" :title="i18n.ts.sensitive"><i class="ti ti-eye-exclamation"></i></div>
			</div>
			<MkDriveFileThumbnail class="thumbnail" :file="file" fit="contain" :highlightWhenSensitive="true"/>
			<div v-if="viewMode === 'list'" class="body">
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
	</MkPagination>
</div>
</template>

<script lang="ts" setup>
import * as Misskey from 'cherrypick-js';
import MkPagination from '@/components/MkPagination.vue';
import MkDriveFileThumbnail from '@/components/MkDriveFileThumbnail.vue';
import bytes from '@/filters/bytes.js';
import { i18n } from '@/i18n.js';
import { dateString } from '@/filters/date.js';

const props = defineProps<{
	pagination: any;
	viewMode: 'grid' | 'list';
}>();
</script>

<style lang="scss" scoped>
@keyframes sensitive-blink {
	0% { opacity: 1; }
	50% { opacity: 0; }
}

.urempief {
	&.list {
		> .file {
			display: flex;
			width: 100%;
			box-sizing: border-box;
			text-align: left;
			align-items: center;

			&:hover {
				color: var(--MI_THEME-accent);
			}

			> .thumbnail {
				width: 128px;
				height: 128px;
			}

			> .body {
				margin-left: 0.3em;
				padding: 8px;
				flex: 1;

				@media (max-width: 500px) {
					font-size: 14px;
				}
			}
		}
	}

	&.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		grid-gap: 12px;

		> .file {
			position: relative;
			aspect-ratio: 1;

			> .thumbnail {
				width: 100%;
				height: 100%;
			}

			> .sensitive-label {
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

			> .indicators {
				position: absolute;
				z-index: 10;
				top: 4px;
				left: 4px;
				display: inline-flex;
				margin: 3px 0 0 3px;
				pointer-events: none;
				opacity: .5;
				gap: 6px;

				> .indicator {
					/* Hardcode to black because either --MI_THEME-bg or --MI_THEME-fg makes it hard to read in dark/light mode */
					background-color: black;
					border-radius: 6px;
					color: hsl(from var(--MI_THEME-accent) h s calc(l + 10));
					display: inline-block;
					font-weight: bold;
					font-size: 0.8em;
					padding: 2px 5px;
				}
			}
		}
	}
}
</style>
