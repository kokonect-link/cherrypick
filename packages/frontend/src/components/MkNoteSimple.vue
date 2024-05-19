<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root" :style="{ cursor: expandOnNoteClick && enableNoteClick ? 'pointer' : '' }" @click.stop="noteClick" @dblclick.stop="noteDblClick">
	<div style="display: flex; padding-bottom: 10px;">
		<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="[$style.avatar, { [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name === 'index', [$style.showElTab]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name !== 'index' }]" :user="note.user" link preview noteClick/>
		<div :class="$style.main">
			<MkNoteHeader :class="$style.header" :note="note" :mini="true"/>
		</div>
	</div>
	<div>
		<MkEvent v-if="note.event" :note="note"/>
		<p v-if="note.cw != null" :class="$style.cw">
			<Mfm v-if="note.cw != ''" :text="note.cw" :author="note.user" :nyaize="'respect'" style="margin-right: 8px;"/>
			<MkCwButton v-model="showContent" :text="note.text" :renote="note.renote" :files="note.files" :poll="note.poll" @click.stop/>
		</p>
		<div v-show="note.cw == null || showContent">
			<MkSubNoteContent :class="$style.text" :note="note" :showSubNoteFooterButton="false"/>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNoteHeader from '@/components/MkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import MkEvent from '@/components/MkEvent.vue';
import { globalEvents } from '@/events.js';
import { mainRouter } from '@/router/main.js';
import { useRouter } from '@/router/supplier.js';
import { defaultStore } from '@/store.js';
import { notePage } from '@/filters/note.js';

const props = withDefaults(defineProps<{
	note: Misskey.entities.Note;
	enableNoteClick?: boolean,
}>(), {
	enableNoteClick: true,
});

const showEl = ref(false);

const showContent = ref(false);
const expandOnNoteClick = defaultStore.state.expandOnNoteClick;
const router = useRouter();

onMounted(() => {
	globalEvents.on('showEl', (showEl_receive) => {
		showEl.value = showEl_receive;
	});
});

function noteClick(ev: MouseEvent) {
	if (!expandOnNoteClick || window.getSelection().toString() !== '' || defaultStore.state.expandOnNoteClickBehavior === 'doubleClick') ev.stopPropagation();
	else router.push(notePage(props.note));
}

function noteDblClick(ev: MouseEvent) {
	if (!expandOnNoteClick || window.getSelection().toString() !== '' || defaultStore.state.expandOnNoteClickBehavior === 'click') ev.stopPropagation();
	else router.push(notePage(props.note));
}
</script>

<style lang="scss" module>
.root {
	margin: 0;
	padding: 0;
	font-size: 0.95em;
	-webkit-tap-highlight-color: transparent;
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
	// cursor: default;
	display: grid;
	margin: 0;
	padding: 0;
	overflow-wrap: break-word;
}

.text {
	// cursor: default;
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
