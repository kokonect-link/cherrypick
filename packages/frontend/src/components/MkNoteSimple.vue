<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="note" :class="$style.root" :style="{ cursor: expandOnNoteClick && enableNoteClick ? 'pointer' : '' }" @click.stop="noteClick" @dblclick.stop="noteDblClick">
	<div :style="prefer.s.showGapBodyOfTheNote ? null : 'padding-bottom: 10px;'" style="display: flex;">
		<MkAvatar v-if="!prefer.s.hideAvatarsInNote" :class="[$style.avatar, prefer.s.useStickyIcons ? $style.useSticky : null, { [$style.showEl]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name === 'index', [$style.showElTab]: (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name !== 'index' }]" :user="note.user" link preview noteClick/>
		<div :class="$style.main">
			<MkNoteHeader :class="$style.header" :note="note" :mini="true"/>
			<div v-if="prefer.s.showGapBodyOfTheNote" :style="prefer.s.showGapBodyOfTheNote ? 'margin-top: 4px;' : null">
				<MkInfo v-if="note.deleteAt != null" warn :class="$style.deleteAt">
					<I18n :src="i18n.ts.scheduledToDeleteOnX" tag="span">
						<template #x>
							<MkTime :time="note.deleteAt" :mode="'detail'" style="font-weight: bold;"/>
						</template>
					</I18n>
				</MkInfo>
				<MkEvent v-if="note.event" :note="note"/>
				<p v-if="note.cw != null" :class="$style.cw">
					<Mfm v-if="note.cw != ''" style="margin-right: 8px;" :text="note.cw" :author="note.user" :nyaize="'respect'" :emojiUrls="note.emojis"/>
					<MkCwButton v-model="showContent" :text="note.text" :renote="note.renote" :files="note.files" :poll="note.poll" @click.stop/>
				</p>
				<div v-show="note.cw == null || showContent">
					<MkSubNoteContent :class="$style.text" :note="note" :showSubNoteFooterButton="false"/>
				</div>
			</div>
		</div>
	</div>
	<div v-if="!prefer.s.showGapBodyOfTheNote">
		<MkInfo v-if="note.deleteAt != null" warn :class="$style.deleteAt">
			<I18n :src="i18n.ts.scheduledToDeleteOnX" tag="span">
				<template #x>
					<MkTime :time="note.deleteAt" :mode="'detail'" style="font-weight: bold;"/>
				</template>
			</I18n>
		</MkInfo>
		<MkEvent v-if="note.event" :note="note"/>
		<p v-if="note.cw != null" :class="$style.cw">
			<Mfm v-if="note.cw != ''" style="margin-right: 8px;" :text="note.cw" :author="note.user" :nyaize="'respect'" :emojiUrls="note.emojis"/>
			<MkCwButton v-model="showContent" :text="note.text" :renote="note.renote" :files="note.files" :poll="note.poll" @click.stop/>
		</p>
		<div v-show="note.cw == null || showContent">
			<MkSubNoteContent :class="$style.text" :note="note" :showSubNoteFooterButton="false"/>
		</div>
	</div>
</div>
<div v-else :class="$style.deleted">
	{{ i18n.ts.deletedNote }}
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNoteHeader from '@/components/MkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences.js';
import MkEvent from '@/components/MkEvent.vue';
import { mainRouter } from '@/router.js';
import { useRouter } from '@/router.js';
import { notePage } from '@/filters/note.js';
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';
import MkInfo from '@/components/MkInfo.vue';

const props = withDefaults(defineProps<{
	note: Misskey.entities.Note | null;
	enableNoteClick?: boolean,
}>(), {
	enableNoteClick: true,
});

const { showEl } = scrollToVisibility();

const showContent = ref(false);
const expandOnNoteClick = prefer.s.expandOnNoteClick;
const router = useRouter();

const isDeleted = ref(false);

if (prefer.s.alwaysShowCw) showContent.value = true;

function noteClick(ev: MouseEvent) {
	if (!expandOnNoteClick || window.getSelection()?.toString() !== '' || prefer.s.expandOnNoteClickBehavior === 'doubleClick') ev.stopPropagation();
	else router.pushByPath(notePage(props.note));
}

function noteDblClick(ev: MouseEvent) {
	if (!expandOnNoteClick || window.getSelection()?.toString() !== '' || prefer.s.expandOnNoteClickBehavior === 'click') ev.stopPropagation();
	else router.pushByPath(notePage(props.note));
}
</script>

<style lang="scss" module>
.root {
	margin: 0;
	padding: 0;
	font-size: 0.95em;
	-webkit-tap-highlight-color: transparent;
}

.button{
	margin-right: var(--MI-margin);
	margin-bottom: var(--MI-margin);
}

.avatar {
	flex-shrink: 0;
	display: block;
	margin: 0 10px 0 0;
	width: 34px;
	height: 34px;
	border-radius: 8px;
	position: sticky !important;
	top: calc(16px + var(--MI-stickyTop, 0px));
	left: 0;
	background: var(--MI_THEME-panel);

	&.useSticky {
		position: sticky !important;
		top: calc(16px + var(--MI-stickyTop, 0px));
		left: 0;
	}
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

.deleted {
	text-align: center;
	padding: 8px !important;
	margin: 8px 8px 0 8px;
	--color: light-dark(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.15));
	background-size: auto auto;
	background-image: repeating-linear-gradient(135deg, transparent, transparent 10px, var(--color) 4px, var(--color) 14px);
	border-radius: 8px;
}

.deleteAt {
	margin: 0 0 8px 0;
}
</style>
