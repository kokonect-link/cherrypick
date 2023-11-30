<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="!muted" :class="[$style.root, { [$style.children]: depth > 1 }]">
	<div v-if="!defaultStore.state.hideAvatarsInNote && !hideLine" :class="$style.line"></div>
	<div :class="$style.main">
		<div v-if="note.channel" :class="$style.colorBar" :style="{ background: note.channel.color }"></div>
		<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="$style.avatar" :user="note.user" link preview/>
		<div :class="$style.body" :style="{ cursor: expandOnNoteClick ? 'pointer' : '' }" @click="noteClick">
			<MkNoteHeader :class="$style.header" :note="note" :mini="true"/>
			<div>
				<MkEvent v-if="note.event" :note="note"/>
				<p v-if="note.cw != null" :class="$style.cw">
					<Mfm v-if="note.cw != ''" style="margin-right: 8px;" :text="note.cw" :author="note.user" :nyaize="'respect'"/>
					<MkCwButton v-model="showContent" style="width: 100%" :text="note.text" :files="note.files" :poll="note.poll" @click.stop/>
				</p>
				<div v-show="note.cw == null || showContent">
					<MkSubNoteContent :class="$style.text" :note="note" :showSubNoteFooterButton="defaultStore.state.showSubNoteFooterButton"/>
				</div>
			</div>
		</div>
	</div>
	<template v-if="depth < 5">
		<MkNoteSub v-for="reply in replies" :key="reply.id" :note="reply" :class="$style.reply" :detail="true" :depth="depth + 1"/>
	</template>
	<div v-else :class="$style.more">
		<MkA class="_link" :to="notePage(note)">{{ i18n.ts.continueThread }} <i class="ti ti-chevron-double-right"></i></MkA>
	</div>
</div>
<div v-else :class="$style.muted" @click="muted = false">
	<I18n :src="i18n.ts.userSaysSomething" tag="small">
		<template #name>
			<MkA v-user-preview="note.userId" :to="userPage(note.user)">
				<MkUserName :user="note.user"/>
			</MkA>
		</template>
	</I18n>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNoteHeader from '@/components/MkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import MkEvent from '@/components/MkEvent.vue';
import { notePage } from '@/filters/note.js';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/account.js';
import { userPage } from '@/filters/user.js';
import { checkWordMute } from '@/scripts/check-word-mute.js';
import { defaultStore } from '@/store.js';
import { useRouter } from '@/router.js';

let hideLine = $ref(false);

const props = withDefaults(defineProps<{
	note: Misskey.entities.Note;
	detail?: boolean;

	// how many notes are in between this one and the note being viewed in detail
	depth?: number;
}>(), {
	depth: 1,
});

const muted = ref($i ? checkWordMute(props.note, $i, $i.mutedWords) : false);

const expandOnNoteClick = defaultStore.state.expandOnNoteClick;
const router = useRouter();

let showContent = $ref(false);
let replies: Misskey.entities.Note[] = $ref([]);

if (props.detail) {
	os.api('notes/children', {
		noteId: props.note.id,
		limit: 5,
	}).then(res => {
		replies = res;
		hideLine = true;
	});
}

function noteClick(ev: MouseEvent) {
	if (document.getSelection().type === 'Range' || !expandOnNoteClick) ev.stopPropagation();
	else router.push(notePage(props.note));
}
</script>

<style lang="scss" module>
.root {
	padding: 28px 32px;
	font-size: 0.9em;
	position: relative;

	&.children {
		padding: 10px 0 0 16px;
		font-size: 1em;
	}
}

.line {
	position: absolute;
	height: 100%;
	left: 60px;
	border-left: 2.5px dotted rgb(174, 174, 174);
}

.main {
	display: flex;
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
	margin: 0 14px 0 0;
	width: 58px;
	height: 58px;
	border-radius: 8px;
	background: var(--panel);
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
	display: grid;
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

@container (max-width: 580px) {
	.root {
		padding: 28px 26px 0;
	}

	.line {
		left: 50.5px;
	}

	.avatar {
		width: 50px;
		height: 50px;
	}
}

@container (max-width: 500px) {
	.root {
		padding: 23px 25px;
	}
}

@container (max-width: 480px) {
	.root {
		padding: 22px 24px;

		&.children {
			padding: 10px 0 0 8px;
		}
	}
}

@container (max-width: 450px) {
	.line {
		left: 46px;
	}

	.avatar {
		width: 46px;
		height: 46px;
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
