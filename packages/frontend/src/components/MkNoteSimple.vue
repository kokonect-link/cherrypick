<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<div style="display: flex; padding-bottom: 10px;">
		<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="[$style.avatar, { [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name === 'index', [$style.showElTab]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name !== 'index' }]" :user="note.user" link preview/>
		<div :class="$style.main">
			<MkNoteHeader :class="$style.header" :note="note" :mini="true"/>
		</div>
	</div>
	<div>
		<MkEvent v-if="note.event" :note="note"/>
		<p v-if="note.cw != null" :class="$style.cw">
			<Mfm v-if="note.cw != ''" style="margin-right: 8px;" :text="note.cw" :author="note.user" :nyaize="'respect'" :emojiUrls="note.emojis"/>
			<MkCwButton v-model="showContent" :text="note.text" :files="note.files" :poll="note.poll"/>
		</p>
		<div v-show="note.cw == null || showContent">
			<MkSubNoteContent :class="$style.text" :note="note"/>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNoteHeader from '@/components/MkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import MkEvent from '@/components/MkEvent.vue';
import { $i } from '@/account.js';
import { globalEvents } from '@/events.js';
import { mainRouter } from '@/router.js';
import { defaultStore } from '@/store.js';

let showEl = $ref(false);

const props = defineProps<{
	note: Misskey.entities.Note;
}>();

const showContent = $ref(false);

onMounted(() => {
	globalEvents.on('showEl', (showEl_receive) => {
		showEl = showEl_receive;
	});
});
</script>

<style lang="scss" module>
.root {
	margin: 0;
	padding: 0;
	font-size: 0.95em;
}

.avatar {
	flex-shrink: 0;
	display: block;
	margin: 0 10px 0 0;
	width: 34px;
	height: 34px;
	border-radius: 8px;
	position: sticky !important;
	top: calc(16px + var(--stickyTop, 0px));
	left: 0;
	background: var(--panel);
}

.main {
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
	cursor: default;
	margin: 0;
	padding: 0;
}

@container (max-width: 500px) {
	.avatar {
		&.showEl {
			top: 14px;
		}

		&.showElTab {
			top: 54px;
		}
	}
}

@container (min-width: 250px) {
	.avatar {
		margin: 0 10px 0 0;
		width: 40px;
		height: 40px;
	}
}

@container (min-width: 350px) {
	.avatar {
		margin: 0 10px 0 0;
		width: 44px;
		height: 44px;
	}
}

@container (min-width: 500px) {
	.avatar {
		margin: 0 12px 0 0;
		width: 48px;
		height: 48px;
	}
}
</style>
