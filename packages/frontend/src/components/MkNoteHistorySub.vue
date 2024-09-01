<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<div :class="$style.main">
		<div :class="$style.body">
			<div :class="$style.noteHeader">
				<MkAvatar :class="$style.avatar" :user="originalNote.user" indicator link preview/>
				<div>
					<MkA v-user-preview="originalNote.user.id" :class="$style.name" :to="userPage(originalNote.user)">
						<MkUserName :user="originalNote.user"/>
					</MkA>
					<div :class="$style.username">
						<span><MkAcct :user="originalNote.user"/></span>
					</div>
					<div>
						<span :class="$style.time">{{ i18n.ts.edited }}: <MkTime :time="history.createdAt" mode="detail"/>
						</span>
					</div>
				</div>
			</div>
			<MkNoteHistorySubContent :class="$style.body" :history="history" :originalNote="originalNote"/>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNoteHeader from '@/components/MkNoteHeader.vue';
import MkNoteHistorySubContent from '@/components/MkNoteHistorySubContent.vue';
import { userPage } from '@/filters/user.js';
import { i18n } from '@/i18n.js';

const props = withDefaults(defineProps<{
	history: Misskey.entities.NoteHistory;
	originalNote: Misskey.entities.Note;
	detail?: boolean;

	// how many notes are in between this one and the note being viewed in detail
	index?: number;
}>(), {
	index: 0,
});

</script>

<style lang="scss" module>
.root {
	padding: 12px 8px;
	font-size: 0.9em;
	position: relative;

	&.children {
		padding: 10px 0 0 16px;
		font-size: 1em;
	}
}

.main {
	display: flex;
	padding: 16px;
	border: dashed 1px var(--renote);
	border-radius: 8px;
	overflow: clip;
}
.name {
	flex-shrink: 1;
	display: block;
	margin-left: 10px;
	padding: 0;
	overflow: hidden;
	font-size: 1em;
	font-weight: bold;
	text-decoration: none;
	text-overflow: ellipsis;

	&:hover {
		text-decoration: underline;
	}
}

.time {
	margin-left: 10px;
	font-size: 0.8em;
	color: var(--accent);
}

.noteHeader {
	display: flex;
	position: relative;
	margin-bottom: 16px;
	align-items: center;
}

.noteHeaderAvatar {
	display: block;
	flex-shrink: 0;
	width: 3em;
	height: 3em;
}
.username {
	flex-shrink: 9999999;
	margin-left: 10px;
	overflow: hidden;
	text-overflow: ellipsis;
}

.colorBar {
	position: absolute;
	top: 8px;
	left: 8px;
	width: 5px;
	height: calc(100% - 8px);
	border-radius: 999px;
	pointer-events: none;
}

.avatar {
	flex-shrink: 0;
	display: block;
	margin-right: 4px;
	width: 50px;
	height: 50px;
	border-radius: 8px;
}

.body {
	flex: 1;
	min-width: 0;
}

.header {
	margin-bottom: 2px;
}

.cw {
	cursor: default;
	display: block;
	margin: 0;
	padding: 0;
	overflow-wrap: break-word;
}

.text {
	margin: 0;
	padding: 0;
}

.reply, .more {
	border-left: solid 0.5px var(--divider);
	margin-top: 10px;
}

.more {
	padding: 10px 0 0 16px;
}

@container (max-width: 450px) {
	.root {
		padding: 14px 16px;

		&.children {
			padding: 10px 0 0 8px;
		}
	}
}

.muted {
	text-align: center;
	padding: 8px !important;
	border: 1px solid var(--divider);
	margin: 8px 8px 0 8px;
	border-radius: 8px;
}
</style>
