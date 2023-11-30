<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="el" :class="[$style.root, { [$style.collapsed]: collapsed }]">
	<div>
		<span v-if="note.isHidden" style="opacity: 0.5">({{ i18n.ts._ffVisibility.private }})</span>
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ i18n.ts.deleted }})</span>
		<MkA v-if="note.replyId" :class="$style.reply" :to="`/notes/${note.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
		<Mfm
			v-if="note.text"
			:parsedNodes="parsed"
			:text="note.text"
			:author="note.user"
			:nyaize="noNyaize ? false : 'respect'"
			:emojiUrls="note.emojis"
			:enableEmojiMenu="true"
			:enableEmojiMenuReaction="true"
		/>
		<MkA v-if="note.renoteId" :class="$style.rp" :to="`/notes/${note.renoteId}`">RN: ...</MkA>
		<div v-if="defaultStore.state.showTranslateButtonInNote && instance.translatorAvailable && $i && note.text && isForeignLanguage" style="padding-top: 5px; color: var(--accent);">
			<button v-if="!(translating || translation)" ref="translateButton" class="_button" @mousedown="translate()">{{ i18n.ts.translateNote }}</button>
			<button v-else class="_button" @mousedown="translation = null">{{ i18n.ts.close }}</button>
		</div>
		<div v-if="translating || translation" :class="$style.translation">
			<MkLoading v-if="translating" mini/>
			<div v-else>
				<b>{{ i18n.t('translatedFrom', { x: translation.sourceLang }) }}:</b><hr style="margin: 10px 0;">
				<Mfm :text="translation.text" :author="note.user" :nyaize="noNyaize ? false : 'respect'" :emojiUrls="note.emojis" @click.stop/>
				<div v-if="translation.translator == 'ctav3'" style="margin-top: 10px; padding: 0 0 15px;">
					<img v-if="!defaultStore.state.darkMode" src="/client-assets/color-short.svg" alt="" style="float: right;">
					<img v-else src="/client-assets/white-short.svg" alt="" style="float: right;"/>
				</div>
			</div>
		</div>
		<div v-if="viewTextSource">
			<hr style="margin: 10px 0;">
			<pre style="margin: initial;"><small>{{ note.text }}</small></pre>
			<button class="_button" style="padding-top: 5px; color: var(--accent);" @mousedown="viewTextSource = false"><small>{{ i18n.ts.close }}</small></button>
		</div>
		<div v-show="showContent">
			<div v-if="note.files.length > 0">
				<MkMediaList v-if="note.disableRightClick" :mediaList="note.files" @click.stop @contextmenu.prevent/>
				<MkMediaList v-else :mediaList="note.files" @click.stop/>
			</div>
			<div v-if="note.poll">
				<MkPoll :note="note" @click.stop/>
			</div>
		</div>
	</div>
	<button v-if="(isLong || (isMFM && defaultStore.state.collapseDefault) || note.files.length > 0 || note.poll) && collapsed" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" :class="$style.fade" class="_button" @click.stop="collapsed = false;">
		<span :class="$style.fadeLabel">
			{{ i18n.ts.showMore }}
			<span v-if="note.files.length > 0" :class="$style.label">({{ collapseLabel }})</span>
		</span>
	</button>
	<button v-else-if="(isLong || (isMFM && defaultStore.state.collapseDefault) || note.files.length > 0 || note.poll) && !collapsed" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" :class="$style.showLess" class="_button" @click.stop="collapsed = true;">
		<span :class="$style.showLessLabel">{{ i18n.ts.showLess }}</span>
	</button>
	<div v-if="showSubNoteFooterButton">
		<MkReactionsViewer v-show="note.cw == null || showContent" :note="note" :maxNumber="16" @click.stop @mockUpdateMyReaction="emitUpdReaction">
			<template #more>
				<div :class="$style.reactionOmitted">{{ i18n.ts.more }}</div>
			</template>
		</MkReactionsViewer>
		<footer :class="$style.footer">
			<button v-if="!note.isHidden" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.reply" :class="$style.footerButton" class="_button" @click.stop="reply()">
				<i class="ti ti-arrow-back-up"></i>
				<p v-if="note.repliesCount > 0" :class="$style.footerButtonCount">{{ note.repliesCount }}</p>
			</button>
			<button v-else :class="$style.footerButton" class="_button" disabled>
				<i class="ti ti-ban"></i>
			</button>
			<button
				v-if="canRenote"
				ref="renoteButton"
				v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 60] : []"
				v-tooltip="i18n.ts.renote"
				:class="$style.footerButton"
				class="_button"
				@mousedown="defaultStore.state.renoteQuoteButtonSeparation ? renoteOnly() : renote()"
			>
				<i class="ti ti-repeat"></i>
				<p v-if="note.renoteCount > 0" :class="$style.footerButtonCount">{{ note.renoteCount }}</p>
			</button>
			<button v-else :class="$style.footerButton" class="_button" disabled>
				<i class="ti ti-ban"></i>
			</button>
			<button v-if="note.myReaction == null" ref="heartReactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" v-tooltip="i18n.ts.like" :class="$style.footerButton" class="_button" @mousedown="heartReact()">
				<i class="ti ti-heart"></i>
			</button>
			<button v-if="note.reactionAcceptance !== 'likeOnly'" ref="reactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" :class="$style.footerButton" class="_button" @mousedown="react()">
				<i v-if="note.myReaction == null" v-tooltip="i18n.ts.reaction" class="ti ti-mood-plus"></i>
				<i v-else v-tooltip="i18n.ts.editReaction" class="ti ti-mood-edit"></i>
			</button>
			<button v-if="note.myReaction != null && note.reactionAcceptance == 'likeOnly'" ref="reactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" v-tooltip="i18n.ts.removeReaction" :class="$style.footerButton" class="_button" @click.stop="undoReact(note)">
				<i class="ti ti-heart-minus"></i>
			</button>
			<button v-if="canRenote && defaultStore.state.renoteQuoteButtonSeparation" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.quote" class="_button" :class="$style.footerButton" @click.stop="quote()">
				<i class="ti ti-quote"></i>
			</button>
			<button v-if="defaultStore.state.showClipButtonInNoteFooter" ref="clipButton" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.clip" :class="$style.footerButton" class="_button" @mousedown="clip()">
				<i class="ti ti-paperclip"></i>
			</button>
			<MkA v-if="defaultStore.state.infoButtonForNoteActionsEnabled && defaultStore.state.showNoteActionsOnlyHover" v-tooltip="i18n.ts.details" :to="notePage(note)" :class="$style.footerButton" style="text-decoration: none;" class="_button">
				<i class="ti ti-info-circle"></i>
			</MkA>
			<button ref="menuButton" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.more" :class="$style.footerButton" class="_button" @mousedown="menu()">
				<i class="ti ti-dots"></i>
			</button>
		</footer>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, inject, provide, Ref, ref, shallowRef, watch } from 'vue';
import * as mfm from 'cherrypick-mfm-js';
import * as Misskey from 'cherrypick-js';
import * as os from '@/os.js';
import * as sound from '@/scripts/sound.js';
import MkMediaList from '@/components/MkMediaList.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkUsersTooltip from '@/components/MkUsersTooltip.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import MkReactionsViewer from '@/components/MkReactionsViewer.vue';
import { i18n } from '@/i18n.js';
import { $i } from '@/account.js';
import { shouldCollapsed, shouldMfmCollapsed } from '@/scripts/collapsed.js';
import { defaultStore } from '@/store.js';
import { miLocalStorage } from '@/local-storage.js';
import { instance } from '@/instance.js';
import { notePage } from '@/filters/note.js';
import { useTooltip } from '@/scripts/use-tooltip.js';
import { pleaseLogin } from '@/scripts/please-login.js';
import { showMovedDialog } from '@/scripts/show-moved-dialog.js';
import { getNoteClipMenu, getNoteMenu, getRenoteMenu, getRenoteOnly } from '@/scripts/get-note-menu.js';
import { deepClone } from '@/scripts/clone.js';
import { reactionPicker } from '@/scripts/reaction-picker.js';
import { claimAchievement } from '@/scripts/achievements.js';
import { useNoteCapture } from '@/scripts/use-note-capture.js';
import { concat } from '@/scripts/array.js';
import { vibrate } from '@/scripts/vibrate.js';
import detectLanguage from '@/scripts/detect-language.js';

const props = withDefaults(defineProps<{
  note: Misskey.entities.Note;
  mock?: boolean;
  showSubNoteFooterButton: boolean;
}>(), {
	mock: false,
});

provide('mock', props.mock);

const emit = defineEmits<{
  (ev: 'reaction', emoji: string): void;
  (ev: 'removeReaction', emoji: string): void;
}>();

let note = $ref(deepClone(props.note));

const el = shallowRef<HTMLElement>();
const menuButton = shallowRef<HTMLElement>();
const renoteButton = shallowRef<HTMLElement>();
const reactButton = shallowRef<HTMLElement>();
const heartReactButton = shallowRef<HTMLElement>();
const clipButton = shallowRef<HTMLElement>();
const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || props.note.userId === $i.id);
const isDeleted = ref(false);
const currentClip = inject<Ref<Misskey.entities.Clip> | null>('currentClip', null);

const showContent = ref(true);
const translation = ref<any>(null);
const translating = ref(false);

const viewTextSource = ref(false);
const noNyaize = ref(false);

const parsed = props.note.text ? mfm.parse(props.note.text) : null;

const isLong = shouldCollapsed(props.note, []);
const isMFM = shouldMfmCollapsed(props.note);

const collapsed = $ref(isLong || (isMFM && defaultStore.state.collapseDefault) || props.note.files.length > 0 || props.note.poll);

const collapseLabel = computed(() => {
	return concat([
		props.note.files && props.note.files.length !== 0 ? [i18n.t('_cw.files', { count: props.note.files.length })] : [],
	] as string[][]).join(' / ');
});

if (props.mock) {
	watch(() => props.note, (to) => {
		note = deepClone(to);
	}, { deep: true });
} else {
	useNoteCapture({
		rootEl: el,
		note: $$(note),
		pureNote: $$(note),
		isDeletedRef: isDeleted,
	});
}

if (!props.mock) {
	useTooltip(renoteButton, async (showing) => {
		const renotes = await os.api('notes/renotes', {
			noteId: props.note.id,
			limit: 11,
		});

		const users = renotes.map(x => x.user);

		if (users.length < 1) return;

		os.popup(MkUsersTooltip, {
			showing,
			users,
			count: props.note.renoteCount,
			targetElement: renoteButton.value,
		}, {}, 'closed');
	});
}

function renote(viaKeyboard = false) {
	pleaseLogin();
	showMovedDialog();

	const { menu } = getRenoteMenu({ note: note, renoteButton, mock: props.mock });
	os.popupMenu(menu, renoteButton.value, {
		viaKeyboard,
	});
}

async function renoteOnly() {
	pleaseLogin();
	showMovedDialog();

	await getRenoteOnly({ note: note, renoteButton, mock: props.mock });
}

function quote(viaKeyboard = false): void {
	pleaseLogin();
	if (props.mock) {
		return;
	}
	if (props.note.channel) {
		os.post({
			renote: props.note,
			channel: props.note.channel,
			animation: !viaKeyboard,
		}, () => {
			focus();
		});
	}
	os.post({
		renote: props.note,
	}, () => {
		focus();
	});
}

function reply(viaKeyboard = false): void {
	pleaseLogin();
	if (props.mock) {
		return;
	}
	os.post({
		reply: props.note,
		channel: props.note.channel,
		animation: !viaKeyboard,
	}, () => {
		focus();
	});
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	showMovedDialog();
	if (props.note.reactionAcceptance === 'likeOnly') {
		sound.play('reaction');

		if (props.mock) {
			return;
		}
		os.api('notes/reactions/create', {
			noteId: props.note.id,
			reaction: '❤️',
		});
		const el = reactButton.value as HTMLElement | null | undefined;
		if (el) {
			const rect = el.getBoundingClientRect();
			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);
			os.popup(MkRippleEffect, { x, y }, {}, 'end');
		}
	} else {
		blur();
		reactionPicker.show(reactButton.value, reaction => {
			if (props.mock) {
				emit('reaction', reaction);
				return;
			}
			toggleReaction(reaction);
		}, () => {
			focus();
		});
	}
}

async function toggleReaction(reaction) {
	const oldReaction = note.myReaction;
	if (oldReaction) {
		const confirm = await os.confirm({
			type: 'warning',
			text: oldReaction !== reaction ? i18n.ts.changeReactionConfirm : i18n.ts.cancelReactionConfirm,
		});
		if (confirm.canceled) return;

		sound.play('reaction');

		os.api('notes/reactions/delete', {
			noteId: note.id,
		}).then(() => {
			if (oldReaction !== reaction) {
				os.api('notes/reactions/create', {
					noteId: note.id,
					reaction: reaction,
				});
			}
		});
	} else {
		sound.play('reaction');

		os.api('notes/reactions/create', {
			noteId: note.id,
			reaction: reaction,
		});
	}
	if (note.text && note.text.length > 100 && (Date.now() - new Date(note.createdAt).getTime() < 1000 * 3)) {
		claimAchievement('reactWithoutRead');
	}
}

function heartReact(): void {
	pleaseLogin();
	showMovedDialog();

	sound.play('reaction');

	if (props.mock) {
		return;
	}

	os.api('notes/reactions/create', {
		noteId: props.note.id,
		reaction: '❤️',
	});
	if (props.note.text && props.note.text.length > 100 && (Date.now() - new Date(props.note.createdAt).getTime() < 1000 * 3)) {
		claimAchievement('reactWithoutRead');
	}
	const el = heartReactButton.value as HTMLElement | null | undefined;
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(MkRippleEffect, { x, y }, {}, 'end');
	}
}

function undoReact(note): void {
	const oldReaction = note.myReaction;
	if (!oldReaction) return;

	if (props.mock) {
		emit('removeReaction', oldReaction);
		return;
	}

	os.api('notes/reactions/delete', {
		noteId: note.id,
	});
}

function menu(viaKeyboard = false): void {
	if (props.mock) {
		return;
	}

	const { menu, cleanup } = getNoteMenu({ note: note, translating, translation, viewTextSource, noNyaize, menuButton, isDeleted, currentClip: currentClip?.value });
	os.popupMenu(menu, menuButton.value, {
		viaKeyboard,
	}).then(focus).finally(cleanup);
}

async function clip() {
	if (props.mock) {
		return;
	}

	os.popupMenu(await getNoteClipMenu({ note: note, isDeleted, currentClip: currentClip?.value }), clipButton.value).then(focus);
}

const isForeignLanguage: boolean = note.text != null && (() => {
	const targetLang = (miLocalStorage.getItem('lang') ?? navigator.language).slice(0, 2);
	const postLang = detectLanguage(note.text);
	return postLang !== '' && postLang !== targetLang;
})();

async function translate(): Promise<void> {
	if (translation.value != null) return;
	translating.value = true;

	vibrate(defaultStore.state.vibrateSystem ? 5 : []);

	if (props.mock) {
		return;
	}

	const res = await os.api('notes/translate', {
		noteId: props.note.id,
		targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
	});
	translating.value = false;
	translation.value = res;

	vibrate(defaultStore.state.vibrateSystem ? [5, 5, 10] : []);
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}

function emitUpdReaction(emoji: string, delta: number) {
	if (delta < 0) {
		emit('removeReaction', emoji);
	} else if (delta > 0) {
		emit('reaction', emoji);
	}
}
</script>

<style lang="scss" module>
.root {
	overflow-wrap: break-word;

	&.collapsed {
		position: relative;
		max-height: 9em;
		overflow: clip;

		> .fade {
			display: block;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 74px;
			background: linear-gradient(0deg, var(--panel), var(--X15));

			> .fadeLabel {
				display: inline-block;
				background: var(--panel);
				padding: 6px 10px;
				font-size: 0.8em;
				border-radius: 999px;
				box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
			}

			&:hover {
				> .fadeLabel {
					background: var(--panelHighlight);
				}
			}
		}
	}

	.footer {
		position: relative;
		z-index: 1;
	}

	&:hover > .article > .main > .footer > .footerButton {
		opacity: 1;
	}
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

.translation {
	border: solid 0.5px var(--divider);
	border-radius: var(--radius);
	padding: 12px;
	margin-top: 8px;
}

.footer {
	margin: 7px 0 -14px;
}

.footerButton {
	margin: 0;
	padding: 8px;
	opacity: 0.7;

	&:not(:last-child) {
		margin-right: 10px;
	}

	&:hover {
		color: var(--fgHighlighted);
	}
}

.footerButtonCount {
	display: inline;
	margin: 0 0 0 8px;
	opacity: 0.7;
}

@container (max-width: 500px) {
	.footer {
		margin-bottom: -8px;
	}
}

.reactionDetailsButton {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border: dashed 1px var(--divider);
	border-radius: 4px;
	background: transparent;
	opacity: .8;

	&:hover {
		background: var(--X5);
	}
}

.showLess {
	width: 100%;
	margin-top: 14px;
	position: sticky;
	bottom: calc(var(--stickyBottom, 0px) + 14px);
}

.showLessLabel {
	display: inline-block;
	background: var(--popup);
	padding: 6px 10px;
	font-size: 0.8em;
	border-radius: 999px;
	box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
}
</style>
