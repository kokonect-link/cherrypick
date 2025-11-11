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
						<span v-if="index === 0" :class="$style.time"> {{ i18n.ts.currentVersion }} </span>
						<span v-else :class="$style.time">{{ i18n.ts.edited }}: <MkTime :time="newNote.createdAt" mode="detail"/></span>
					</div>
				</div>
			</div>
			<div>
				<div v-if="newNote.cw != null" :class="$style.cw">
					<Mfm v-if="newNote.cw != ''" :text="newNote.cw" :author="originalNote.user" :nyaize="'respect'" :emojiUrls="newNote.emojis"/>
					<MkCwButton v-model="showContent" :text="newNote.text" :files="newNote.files" :poll="newNote.poll"/>
				</div>
				<div v-show="newNote.cw == null || showContent">
					<div v-if="newNote.text">
						<CodeDiff
							v-if="raw"
							:context="5"
							:hideHeader="true"
							:oldString="oldNote ? oldNote.text : null"
							:newString="newNote.text"
						/>
						<Mfm
							v-else
							:text="newNote.text"
							:author="originalNote.user"
							:nyaize="'respect'"
							:emojiUrls="newNote.emojis"
						/>
					</div>
					<div v-if="props.newNote.files && props.newNote.files.length > 0 && !raw" style="display: flex; justify-content: center;">
						<MkMediaList :mediaList="props.newNote.files" style="width: 70%;"/>
					</div>
					<div v-if="newNote.poll" style="margin-top: 8px;">
						<MkPoll
							:noteId="originalNote.id"
							:choices="newNote.poll.choices.map(text => ({ text, votes: 0, isVoted: false }))"
							:multiple="newNote.poll.multiple"
							:expiresAt="newNote.poll.expiresAt"
							:emojiUrls="newNote.emojis"
							readOnly
						/>
					</div>
					<div v-if="newNote.event" style="margin-top: 8px;">
						<MkEvent :note="{ ...originalNote, event: newNote.event }"/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import { CodeDiff } from 'v-code-diff';
import { userPage } from '@/filters/user.js';
import { i18n } from '@/i18n.js';
import MkMediaList from '@/components/MkMediaList.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkEvent from '@/components/MkEvent.vue';

const props = defineProps<{
	oldNote: Misskey.entities.NoteHistory | null;
	newNote: Misskey.entities.NoteHistory;
	originalNote: Misskey.entities.Note;
	detail?: boolean;
	raw: boolean;

	// 현재 표시하는 노트의 인덱스
	index: number;
}>();

const showContent = ref(false);
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

.cw {
	cursor: default;
	display: block;
	margin: 0 0 8px 0;
	padding: 0;
	overflow-wrap: break-word;
}

.reply {
	margin-right: 6px;
	color: var(--accent);
}

.rp {
	margin-left: 4px;
	font-style: oblique;
	color: var(--renote);
}

.name {
	flex-shrink: 1;
	display: block;
	margin: 0 .5em 0 10px;
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
</style>
