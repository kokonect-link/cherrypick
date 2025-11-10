<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="rootEl" :class="[$style.root, { [$style.collapsed]: collapsed }]">
	<div>
		<span v-if="note.isHidden" style="opacity: 0.5">({{ i18n.ts.private }})</span>
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ i18n.ts.deletedNote }})</span>
		<MkA v-if="note.replyId" :class="$style.reply" :to="`/notes/${note.replyId}`" @click.stop><i class="ti ti-arrow-back-up"></i></MkA>
		<Mfm
			v-if="note.text"
			:parsedNodes="parsed"
			:text="note.text"
			:author="note.user"
			:nyaize="prefer.s.disableNyaize || noNyaize ? false : 'respect'"
			:emojiUrls="note.emojis"
			:enableEmojiMenu="!!$i"
			:enableEmojiMenuReaction="!!$i"
			class="_selectable"
		/>
		<MkA v-if="note.renoteId" :class="$style.rp" :to="`/notes/${note.renoteId}`">RN: ...</MkA>
		<div v-if="prefer.s.showTranslateButtonInNote && $i && (!prefer.s.useAutoTranslate || (!$i.policies.canUseAutoTranslate || (prefer.s.useAutoTranslate && (isLong || note.cw != null || !showContent)))) && instance.translatorAvailable && $i.policies.canUseTranslator && note.text && isForeignLanguage" style="padding: 5px 0; color: var(--MI_THEME-accent);">
			<button v-if="!(translating || translation)" ref="translateButton" class="_button" @click.stop="translate()">{{ i18n.ts.translateNote }}</button>
			<button v-else class="_button" @click.stop="translation = null">{{ i18n.ts.close }}</button>
		</div>
		<div v-if="translating || translation" :class="$style.translation">
			<MkLoading v-if="translating" mini/>
			<div v-else-if="translation">
				<b>{{ i18n.tsx.translatedFrom({ x: translation.sourceLang }) }}:</b><hr style="margin: 10px 0;">
				<Mfm
					:text="translation.text"
					:author="note.user"
					:nyaize="prefer.s.disableNyaize || noNyaize ? false : 'respect'"
					:emojiUrls="note.emojis"
					:enableEmojiMenu="!!$i"
					:enableEmojiMenuReaction="!!$i"
					class="_selectable"
					@click.stop
				/>
				<div v-if="note.poll">
					<MkPoll
						:noteId="note.id"
						:multiple="note.poll.multiple"
						:expiresAt="note.poll.expiresAt"
						:choices="note.poll.choices"
						:author="note.user"
						:emojiUrls="note.emojis"
						isTranslation
						@click.stop
					/>
				</div>
				<div v-if="'translator' in translation && translation.translator == 'ctav3'" style="margin-top: 10px; padding: 0 0 15px;">
					<img v-if="!store.s.darkMode" src="/client-assets/color-short.svg" alt="" style="float: right;">
					<img v-else src="/client-assets/white-short.svg" alt="" style="float: right;"/>
				</div>
			</div>
		</div>
		<div v-if="viewTextSource">
			<hr style="margin: 10px 0;">
			<pre style="margin: initial; white-space: pre-wrap; word-wrap: break-word;"><small>{{ note.text }}</small></pre>
			<button class="_button" style="padding: 5px 0; color: var(--MI_THEME-accent);" @click.stop="viewTextSource = false"><small>{{ i18n.ts.close }}</small></button>
		</div>
		<div v-show="showContent">
			<div v-if="note.files && note.files.length > 0">
				<MkMediaList :mediaList="note.files" :disableRightClick="note.disableRightClick" @click.stop @contextmenu="disableRightClickHandler"/>
			</div>
			<div v-if="note.poll">
				<MkPoll
					:noteId="note.id"
					:multiple="note.poll.multiple"
					:expiresAt="note.poll.expiresAt"
					:choices="note.poll.choices"
					:author="note.user"
					:emojiUrls="note.emojis"
					@click.stop
				/>
			</div>
		</div>
	</div>
	<button v-if="((isLong && prefer.s.collapseLongNoteContent) || (isMFM && prefer.s.collapseDefault) || (note.files && note.files.length > 0) || !!note.poll) && collapsed" :class="$style.fade" class="_button" @click.stop="collapsed = false">
		<span :class="$style.fadeLabel">
			{{ i18n.ts.showMore }}
			<span v-if="note.files && note.files.length > 0" :class="$style.label">({{ collapseLabel }})</span>
		</span>
	</button>
	<button v-else-if="((isLong && prefer.s.collapseLongNoteContent) || (isMFM && prefer.s.collapseDefault) || (note.files && note.files.length > 0) || note.poll) && !collapsed" :class="$style.showLess" class="_button" @click.stop="collapsed = true">
		<span :class="$style.showLessLabel">{{ i18n.ts.showLess }}</span>
	</button>
	<div v-if="showSubNoteFooterButton">
		<MkReactionsViewer
			v-if="note.reactionAcceptance !== 'likeOnly' || note.cw == null || showContent"
			style="margin-top: 6px;"
			:reactions="$note.reactions"
			:reactionEmojis="$note.reactionEmojis"
			:myReaction="$note.myReaction"
			:noteId="note.id"
			:note="note"
			:maxNumber="16"
			@click.stop
			@contextmenu.prevent.stop
			@mockUpdateMyReaction="emitUpdReaction"
		>
			<template #more>
				<MkA :to="`/notes/${note.id}/reactions`" :class="[$style.reactionOmitted]">{{ i18n.ts.more }}</MkA>
			</template>
		</MkReactionsViewer>
		<footer :class="$style.footer">
			<template v-if="prefer.s.showReplyButtonInNoteFooter">
				<button v-if="!note.isHidden" v-tooltip="i18n.ts.reply" :class="$style.footerButton" class="_button" @click.stop="reply()">
					<i class="ti ti-arrow-back-up"></i>
					<p v-if="note.repliesCount > 0" :class="$style.footerButtonCount">{{ note.repliesCount }}</p>
				</button>
				<button v-else-if="note.isHidden" :class="$style.footerButton" class="_button" disabled>
					<i class="ti ti-ban"></i>
				</button>
			</template>
			<template v-if="prefer.s.showRenoteButtonInNoteFooter">
				<button
					v-if="canRenote"
					ref="renoteButton"
					v-tooltip="i18n.ts.renote"
					:class="$style.footerButton"
					class="_button"
					@click.stop="prefer.s.renoteQuoteButtonSeparation && ((!prefer.s.renoteVisibilitySelection && !note.channel) || (note.channel && !note.channel.allowRenoteToExternal) || note.visibility === 'followers') ? renoteOnly() : renote()"
				>
					<i class="ti ti-repeat"></i>
					<p v-if="note.renoteCount > 0" :class="$style.footerButtonCount">{{ number(note.renoteCount) }}</p>
				</button>
				<button v-else-if="!canRenote" :class="$style.footerButton" class="_button" disabled>
					<i class="ti ti-ban"></i>
				</button>
			</template>
			<button v-if="note.reactionAcceptance !== 'likeOnly' && $note.myReaction == null && prefer.s.showLikeButtonInNoteFooter" ref="heartReactButton" v-tooltip="i18n.ts.like" :class="$style.footerButton" class="_button" @click.stop="heartReact()">
				<i class="ti ti-heart"></i>
			</button>
			<button v-if="prefer.s.showDoReactionButtonInNoteFooter" ref="reactButton" v-tooltip="note.reactionAcceptance === 'likeOnly' && $note.myReaction != null ? i18n.ts.unlike : $note.myReaction != null ? i18n.ts.editReaction : note.reactionAcceptance === 'likeOnly' ? i18n.ts.like : i18n.ts.doReaction" :class="$style.footerButton" class="_button" @click.stop="toggleReact()">
				<i v-if="note.reactionAcceptance === 'likeOnly' && $note.myReaction != null" class="ti ti-heart-filled" style="color: var(--MI_THEME-love);"></i>
				<i v-else-if="$note.myReaction != null" class="ti ti-mood-edit" style="color: var(--MI_THEME-accent);"></i>
				<i v-else-if="note.reactionAcceptance === 'likeOnly'" class="ti ti-heart"></i>
				<i v-else class="ti ti-mood-plus"></i>
				<p v-if="(note.reactionAcceptance === 'likeOnly' || prefer.s.showReactionsCount) && note.reactionCount > 0" :class="$style.footerButtonCount">{{ number(note.reactionCount) }}</p>
			</button>
			<button v-if="canRenote && prefer.s.renoteQuoteButtonSeparation && prefer.s.showQuoteButtonInNoteFooter" ref="quoteButton" v-tooltip="i18n.ts.quote" class="_button" :class="$style.footerButton" @click.stop="quote()">
				<i class="ti ti-quote"></i>
			</button>
			<button v-if="prefer.s.showClipButtonInNoteFooter" ref="clipButton" v-tooltip="i18n.ts.clip" :class="$style.footerButton" class="_button" @click.stop="clip()">
				<i class="ti ti-paperclip"></i>
			</button>
			<MkA v-if="prefer.s.infoButtonForNoteActionsEnabled && prefer.s.showNoteActionsOnlyHover" v-tooltip="i18n.ts.details" :to="notePage(note)" :class="$style.footerButton" style="text-decoration: none;" class="_button">
				<i class="ti ti-info-circle"></i>
			</MkA>
			<button v-if="prefer.s.showMoreButtonInNoteFooter" ref="menuButton" v-tooltip="i18n.ts.more" :class="$style.footerButton" class="_button" @click.stop="showMenu()">
				<i class="ti ti-dots"></i>
			</button>
		</footer>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, inject, provide, ref, useTemplateRef, watch } from 'vue';
import * as mfm from 'mfc-js';
import * as Misskey from 'cherrypick-js';
import { parseMfmCached } from '@/utility/mfm-cache.js';
import { shouldCollapsed, shouldMfmCollapsed } from '@@/js/collapsed.js';
import { concat } from '@@/js/array.js';
import { host } from '@@/js/config.js';
import type { Ref } from 'vue';
import type { OpenOnRemoteOptions } from '@/utility/please-login.js';
import * as os from '@/os.js';
import * as sound from '@/utility/sound.js';
import MkMediaList from '@/components/MkMediaList.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkUsersTooltip from '@/components/MkUsersTooltip.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import MkReactionsViewer from '@/components/MkReactionsViewer.vue';
import MkReactionsViewerDetails from '@/components/MkReactionsViewer.details.vue';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import { prefer } from '@/preferences.js';
import { miLocalStorage } from '@/local-storage.js';
import { instance } from '@/instance.js';
import { notePage } from '@/filters/note.js';
import { useTooltip } from '@/composables/use-tooltip.js';
import { pleaseLogin } from '@/utility/please-login.js';
import { showMovedDialog } from '@/utility/show-moved-dialog.js';
import { getNoteClipMenu, getNoteMenu, getRenoteMenu, getRenoteOnly, getQuoteMenu } from '@/utility/get-note-menu.js';
import { deepClone } from '@/utility/clone.js';
import { reactionPicker } from '@/utility/reaction-picker.js';
import { claimAchievement } from '@/utility/achievements.js';
import { noteEvents, useNoteCapture } from '@/composables/use-note-capture.js';
import { haptic, hapticConfirm } from '@/utility/haptic.js';
import { misskeyApi, misskeyApiGet } from '@/utility/misskey-api.js';
import { store } from '@/store.js';
import { DI } from '@/di.js';
import detectLanguage from '@/utility/detect-language.js';
import number from '@/filters/number.js';

const props = withDefaults(defineProps<{
	note: Misskey.entities.Note;
	mock?: boolean;
	showSubNoteFooterButton?: boolean;
}>(), {
	mock: false,
});

provide(DI.mock, props.mock);

const emit = defineEmits<{
	(ev: 'reaction', emoji: string): void;
	(ev: 'removeReaction', emoji: string): void;
}>();

let note = deepClone(props.note);

const { $note: $note, subscribe: subscribeManuallyToNoteCapture } = useNoteCapture({
	note: props.note,
	parentNote: note,
	mock: props.mock,
});

const rootEl = useTemplateRef('rootEl');
const menuButton = useTemplateRef('menuButton');
const renoteButton = useTemplateRef('renoteButton');
const reactButton = useTemplateRef('reactButton');
const heartReactButton = useTemplateRef('heartReactButton');
const quoteButton = useTemplateRef('quoteButton');
const clipButton = useTemplateRef('clipButton');
const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || (props.note.visibility === 'followers' && $i && props.note.userId === $i.id));
const currentClip = inject<Ref<Misskey.entities.Clip> | null>('currentClip', null);

const showContent = ref(true);
const translation = ref<Misskey.entities.NotesTranslateResponse | null>(null);
const translating = ref(false);

const viewTextSource = ref(false);
const noNyaize = ref(false);

const parsed = props.note.text ? parseMfmCached(props.note.text) : null;

const isLong = shouldCollapsed(props.note, []);
const isMFM = shouldMfmCollapsed(props.note);

const collapsed = ref((isLong && prefer.s.collapseLongNoteContent) || (isMFM && prefer.s.collapseDefault) || (props.note.files && props.note.files.length > 0) || !!props.note.poll);

const pleaseLoginContext = computed<OpenOnRemoteOptions>(() => ({
	type: 'lookup',
	url: `https://${host}/notes/${props.note.id}`,
}));

const collapseLabel = computed(() => {
	return concat([
		props.note.files && props.note.files.length !== 0 ? [i18n.tsx._cw.files({ count: props.note.files.length })] : [],
	] as string[][]).join(' / ');
});

const disableRightClickHandler = (event: Event) => {
	if (props.note.disableRightClick) event.preventDefault();
};

provide(DI.mfmEmojiReactCallback, (reaction) => {
	sound.playMisskeySfx('reaction');
	misskeyApi('notes/reactions/create', {
		noteId: props.note.id,
		reaction: reaction,
	}).then(() => {
		noteEvents.emit(`reacted:${props.note.id}`, {
			userId: $i!.id,
			reaction: reaction,
		});
	});
});

if (!props.mock) {
	useTooltip(renoteButton, async (showing) => {
		const renotes = await misskeyApi('notes/renotes', {
			noteId: props.note.id,
			limit: 11,
		});

		const users = renotes.map(x => x.user);

		if (users.length < 1 || renoteButton.value == null) return;

		const { dispose } = os.popup(MkUsersTooltip, {
			showing,
			users,
			count: props.note.renoteCount,
			anchorElement: renoteButton.value,
		}, {
			closed: () => dispose(),
		});
	});

	if (props.note.reactionAcceptance === 'likeOnly') {
		useTooltip(reactButton, async (showing) => {
			const reactions = await misskeyApiGet('notes/reactions', {
				noteId: props.note.id,
				limit: 10,
				_cacheKey_: $note.reactionCount,
			});

			const users = reactions.map(x => x.user);

			if (users.length < 1) return;

			const { dispose } = os.popup(MkReactionsViewerDetails, {
				showing,
				reaction: '❤️',
				users,
				count: $note.reactionCount,
				anchorElement: reactButton.value!,
			}, {
				closed: () => dispose(),
			});
		});
	}
}

if (prefer.s.alwaysShowCw) showContent.value = true;

watch(() => viewTextSource.value, () => {
	collapsed.value = false;
});

async function renote() {
	haptic();

	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();

	const { menu } = await getRenoteMenu({ note: note, renoteButton, mock: props.mock });
	os.popupMenu(menu, renoteButton.value);

	subscribeManuallyToNoteCapture();
}

async function renoteOnly() {
	haptic();

	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();

	await getRenoteOnly({ note: note, renoteButton, mock: props.mock });
}

function quote(): void {
	haptic();

	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	if (!$i) return;
	if (props.mock) {
		return;
	}
	if (props.note.channel) {
		if (props.note.channel.allowRenoteToExternal) {
			const { menu } = getQuoteMenu({ note: note, mock: props.mock });
			os.popupMenu(menu, quoteButton.value);
		} else {
			os.post({
				renote: props.note,
				channel: props.note.channel,
			}).then(() => {
				focus();
			});
		}
	} else {
		os.post({
			renote: props.note,
		}).then(() => {
			focus();
		});
	}
}

function reply(): void {
	haptic();

	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	if (!$i) return;
	if (props.mock) {
		return;
	}
	os.post({
		reply: props.note,
		channel: props.note.channel,
	}).then(() => {
		focus();
	});
}

function react(): void {
	haptic();

	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();
	if (props.note.reactionAcceptance === 'likeOnly') {
		sound.playMisskeySfx('reaction');

		if (props.mock) {
			return;
		}
		misskeyApi('notes/reactions/create', {
			noteId: props.note.id,
			reaction: '❤️',
		}).then(() => {
			noteEvents.emit(`reacted:${props.note.id}`, {
				userId: $i!.id,
				reaction: '❤️',
			});
		});
		const el = reactButton.value;
		if (el && prefer.s.animation) {
			const rect = el.getBoundingClientRect();
			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);
			const { dispose } = os.popup(MkRippleEffect, { x, y }, {
				end: () => dispose(),
			});
		}
	} else {
		blur();
		reactionPicker.show(reactButton.value ?? null, note, async (reaction) => {
			if (prefer.s.confirmOnReact) {
				const confirm = await os.confirm({
					type: 'question',
					text: i18n.tsx.reactAreYouSure({ emoji: reaction.replace('@.', '') }),
				});

				if (confirm.canceled) return;
			}

			if (props.mock) {
				emit('reaction', reaction);
				$note.reactions[reaction] = 1;
				$note.reactionCount++;
				$note.myReaction = reaction;
				return;
			}

			await toggleReaction(reaction);
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

		sound.playMisskeySfx('reaction');

		misskeyApi('notes/reactions/delete', {
			noteId: note.id,
		}).then(() => {
			if (oldReaction !== reaction) {
				misskeyApi('notes/reactions/create', {
					noteId: note.id,
					reaction: reaction,
				});
			}
		});
	} else {
		sound.playMisskeySfx('reaction');

		misskeyApi('notes/reactions/create', {
			noteId: note.id,
			reaction: reaction,
		}).then(() => {
			noteEvents.emit(`reacted:${note.id}`, {
				userId: $i!.id,
				reaction: reaction,
			});
		});
	}
	if (note.text && note.text.length > 100 && (Date.now() - new Date(note.createdAt).getTime() < 1000 * 3)) {
		claimAchievement('reactWithoutRead');
	}
}

function heartReact(): void {
	haptic();

	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();

	sound.playMisskeySfx('reaction');

	if (props.mock) {
		return;
	}

	misskeyApi('notes/reactions/create', {
		noteId: props.note.id,
		reaction: prefer.s.selectReaction,
	});
	if (props.note.text && props.note.text.length > 100 && (Date.now() - new Date(props.note.createdAt).getTime() < 1000 * 3)) {
		claimAchievement('reactWithoutRead');
	}
	const el = heartReactButton.value;
	if (el && prefer.s.animation) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		const { dispose } = os.popup(MkRippleEffect, { x, y }, {
			end: () => dispose(),
		});
	}
}

function undoReact(): void {
	const oldReaction = $note.myReaction;
	if (!oldReaction) return;

	if (props.mock) {
		emit('removeReaction', oldReaction);
		return;
	}

	misskeyApi('notes/reactions/delete', {
		noteId: props.note.id,
	}).then(() => {
		noteEvents.emit(`unreacted:${props.note.id}`, {
			userId: $i!.id,
			reaction: oldReaction,
		});
	});
}

function toggleReact() {
	haptic();

	if ($note.myReaction != null && note.reactionAcceptance === 'likeOnly') {
		undoReact();
	} else {
		react();
	}
}

function showMenu(): void {
	haptic();

	if (props.mock) {
		return;
	}

	const { menu, cleanup } = getNoteMenu({ note: note, collapsed, translation, translating, viewTextSource, noNyaize, currentClip: currentClip?.value });
	os.popupMenu(menu, menuButton.value).then(focus).finally(cleanup);
}

async function clip(): Promise<void> {
	haptic();

	if (props.mock) {
		return;
	}

	os.popupMenu(await getNoteClipMenu({ note: note, currentClip: currentClip?.value }), clipButton.value).then(focus);
}

const isForeignLanguage: boolean = note.text != null && (() => {
	const targetLang = (miLocalStorage.getItem('lang') ?? navigator.language).slice(0, 2);
	const postLang = detectLanguage(note.text);
	const choicesLang = note.poll?.choices.map((choice) => choice.text).join(' ') ?? '';
	const pollLang = detectLanguage(choicesLang);
	return postLang !== '' && (postLang !== targetLang || pollLang !== targetLang);
})();

if (prefer.s.useAutoTranslate && instance.translatorAvailable && $i && $i.policies.canUseTranslator && $i.policies.canUseAutoTranslate && !isLong && (note.cw == null || showContent.value) && note.text && isForeignLanguage) translate();

async function translate(): Promise<void> {
	if (translation.value != null) return;
	collapsed.value = false;
	translating.value = true;

	haptic();

	if (props.mock) {
		return;
	}

	const res = await misskeyApi('notes/translate', {
		noteId: props.note.id,
		targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
	});
	translating.value = false;
	translation.value = res;

	hapticConfirm();
}

function focus() {
	rootEl.value?.focus();
}

function blur() {
	rootEl.value?.blur();
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
		min-height: 4.5em;
		max-height: 9em;
		overflow: clip;

		> .fade {
			display: block;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 74px;
			background: linear-gradient(0deg, var(--MI_THEME-panel), color(from var(--MI_THEME-panel) srgb r g b / 0));
			z-index: 2;

			> .fadeLabel {
				display: inline-block;
				background: var(--MI_THEME-panel);
				padding: 6px 10px;
				font-size: 0.8em;
				border-radius: 999px;
				box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
			}

			&:hover {
				> .fadeLabel {
					background: var(--MI_THEME-panelHighlight);
				}
			}
		}
	}

	.footer {
		position: relative;
		z-index: 1;
	}

	&:hover > .article > .main > .footer > .footerButton {
		color: var(--MI_THEME-fg);
	}
}

.reply {
	margin-right: 6px;
	color: var(--MI_THEME-accent);
}

.rp {
	margin-left: 4px;
	font-style: oblique;
	color: var(--MI_THEME-renote);
}

.translation {
	border: solid 0.5px var(--MI_THEME-divider);
	border-radius: var(--MI-radius);
	padding: 12px;
	margin-bottom: 8px;
}

.footer {
	margin: 7px 0 -14px;
}

.footerButton {
	margin: 0;
	padding: 8px;
	color: color-mix(in srgb, var(--MI_THEME-panel), var(--MI_THEME-fg) 70%); // opacityなど不透明度で表現するとレンダリングパフォーマンスに影響するので通常の色の混合で代用

	&:not(:last-child) {
		margin-right: 10px;
	}

	&:hover {
		color: var(--MI_THEME-fgHighlighted);
	}
}

.footerButtonCount {
	display: inline;
	margin: 0 0 0 8px;
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
	border: dashed 1px var(--MI_THEME-divider);
	border-radius: 4px;
	background: transparent;
	opacity: .8;

	&:hover {
		background: light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
	}
}

.showLess {
	width: 100%;
	margin-top: 14px;
	position: sticky;
	bottom: calc(var(--MI-stickyBottom, 0px) + 14px);
}

.showLessLabel {
	display: inline-block;
	background: var(--MI_THEME-popup);
	padding: 6px 10px;
	font-size: 0.8em;
	border-radius: 999px;
	box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
}

.reactionOmitted {
	display: inline-block;
	margin-left: 8px;
	opacity: .8;
	font-size: 95%;
}
</style>
