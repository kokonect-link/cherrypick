<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	v-if="!hardMuted && !muted"
	v-show="!isDeleted"
	ref="el"
	v-hotkey="keymap"
	v-vibrate="defaultStore.state.vibrateSystem ? 5 : []"
	:class="[$style.root, { [$style.showActionsOnlyHover]: defaultStore.state.showNoteActionsOnlyHover, [$style.radius]: defaultStore.state.showGapBetweenNotesInTimeline && mainRouter.currentRoute.value.name === 'my-notifications' }]"
	:tabindex="!isDeleted ? '-1' : undefined"
>
	<div v-if="pinned" :class="$style.tip"><i class="ti ti-pin"></i> {{ i18n.ts.pinnedNote }}</div>
	<!--<div v-if="appearNote._prId_" class="tip"><i class="ti ti-speakerphone"></i> {{ i18n.ts.promotion }}<button class="_textButton hide" @click="readPromo()">{{ i18n.ts.hideThisNote }} <i class="ti ti-x"></i></button></div>-->
	<!--<div v-if="appearNote._featuredId_" class="tip"><i class="ti ti-bolt"></i> {{ i18n.ts.featured }}</div>-->
	<div v-if="isRenote" :class="$style.renote">
		<div v-if="note.channel" :class="$style.colorBar" :style="{ background: note.channel.color }"></div>
		<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="$style.renoteAvatar" :user="note.user" link preview/>
		<i class="ti ti-repeat" style="margin-right: 4px;"></i>
		<I18n :src="i18n.ts.renotedBy" tag="span" :class="$style.renoteText">
			<template #user>
				<MkA v-user-preview="note.userId" :class="$style.renoteUserName" :to="userPage(note.user)">
					<MkUserName :user="note.user"/>
				</MkA>
			</template>
		</I18n>
		<div :class="$style.renoteInfo">
			<span v-if="note.visibility !== 'public'" style="margin-right: 0.5em;">
				<i v-if="note.visibility === 'home'" v-tooltip="i18n.ts._visibility[note.visibility]" class="ti ti-home"></i>
				<i v-else-if="note.visibility === 'followers'" v-tooltip="i18n.ts._visibility[note.visibility]" class="ti ti-lock"></i>
				<i v-else-if="note.visibility === 'specified'" ref="specified" v-tooltip="i18n.ts._visibility[note.visibility]" class="ti ti-mail"></i>
			</span>
			<span v-if="note.reactionAcceptance != null" style="margin-right: 0.5em;" :class="{ [$style.danger]: ['nonSensitiveOnly', 'nonSensitiveOnlyForLocalLikeOnlyForRemote', 'likeOnly'].includes(<string>note.reactionAcceptance) }" :title="i18n.ts.reactionAcceptance">
				<i v-if="note.reactionAcceptance === 'likeOnlyForRemote'" v-tooltip="i18n.ts.likeOnlyForRemote" class="ti ti-heart-plus"></i>
				<i v-else-if="note.reactionAcceptance === 'nonSensitiveOnly'" v-tooltip="i18n.ts.nonSensitiveOnly" class="ti ti-icons"></i>
				<i v-else-if="note.reactionAcceptance === 'nonSensitiveOnlyForLocalLikeOnlyForRemote'" v-tooltip="i18n.ts.nonSensitiveOnlyForLocalLikeOnlyForRemote" class="ti ti-heart-plus"></i>
				<i v-else-if="note.reactionAcceptance === 'likeOnly'" v-tooltip="i18n.ts.likeOnly" class="ti ti-heart"></i>
			</span>
			<span v-if="note.localOnly" style="margin-right: 0.5em;"><i v-tooltip="i18n.ts._visibility['disableFederation']" class="ti ti-rocket-off"></i></span>
			<span v-if="note.channel" style="margin-right: 0.5em;"><i v-tooltip="note.channel.name" class="ti ti-device-tv"></i></span>
			<span :class="$style.renoteTime">
				<button ref="renoteTime" class="_button">
					<i class="ti ti-dots" :class="$style.renoteMenu" @click="showRenoteMenu()"></i>
				</button>
				<MkA :to="notePage(note)">
					<MkTime :time="note.createdAt" :mode="defaultStore.state.enableAbsoluteTime ? 'absolute' : 'relative'"/>
				</MkA>
			</span>
		</div>
	</div>
	<MkNoteSub v-if="appearNote.reply && !renoteCollapsed && notification && defaultStore.state.showReplyInNotification" :note="appearNote.reply" :class="$style.replyTo"/>
	<MkNoteSub v-else-if="appearNote.reply && !renoteCollapsed && !notification" :note="appearNote.reply" :class="$style.replyTo"/>
	<div v-if="renoteCollapsed" :class="$style.collapsedRenoteTarget">
		<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="$style.collapsedRenoteTargetAvatar" :user="appearNote.user" link preview/>
		<Mfm :text="getNoteSummary(appearNote)" :plain="true" :nowrap="true" :author="appearNote.user" :nyaize="'respect'" :class="$style.collapsedRenoteTargetText" @click="renoteCollapsed = false"/>
	</div>
	<article v-else :class="$style.article" :style="{ cursor: expandOnNoteClick ? 'pointer' : '' }" @click="noteClick" @contextmenu.stop="onContextmenu">
		<div style="display: flex; padding-bottom: 10px;">
			<div v-if="appearNote.channel" :class="$style.colorBar" :style="{ background: appearNote.channel.color }"></div>
			<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="[$style.avatar, { [$style.avatarReplyTo]: appearNote.reply, [$style.showEl]: !appearNote.reply && (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name === 'index', [$style.showElTab]: !appearNote.reply && (showEl && ['hideHeaderOnly', 'hideHeaderFloatBtn', 'hide'].includes(<string>defaultStore.state.displayHeaderNavBarWhenScroll)) && mainRouter.currentRoute.value.name !== 'index' }]" :user="appearNote.user" :link="!mock" :preview="!mock"/>
			<div :class="$style.main">
				<MkNoteHeader :note="appearNote" :mini="true"/>
			</div>
		</div>
		<div style="container-type: inline-size;">
			<MkEvent v-if="appearNote.event" :note="appearNote"/>
			<p v-if="appearNote.cw != null" :class="$style.cw">
				<Mfm v-if="appearNote.cw != ''" :text="appearNote.cw" :author="appearNote.user" :nyaize="noNyaize ? false : 'respect'"/>
				<MkCwButton v-model="showContent" :text="appearNote.text" :files="appearNote.files" :poll="appearNote.poll" style="margin: 4px 0;" @click.stop/>
			</p>
			<div v-show="appearNote.cw == null || showContent" :class="[{ [$style.contentCollapsed]: collapsed }]">
				<div :class="$style.text">
					<span v-if="appearNote.isHidden" style="opacity: 0.5">({{ i18n.ts._ffVisibility.private }})</span>
					<MkA v-if="appearNote.replyId" :class="$style.replyIcon" :to="`/notes/${appearNote.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
					<Mfm
						v-if="appearNote.text"
						:parsedNodes="parsed"
						:text="appearNote.text"
						:author="appearNote.user"
						:nyaize="noNyaize ? false : 'respect'"
						:emojiUrls="appearNote.emojis"
						:enableEmojiMenu="true"
						:enableEmojiMenuReaction="true"
					/>
					<div v-if="defaultStore.state.showTranslateButtonInNote && instance.translatorAvailable && $i && appearNote.text && isForeignLanguage" style="padding-top: 5px; color: var(--accent);">
						<button v-if="!(translating || translation)" ref="translateButton" class="_button" @mousedown="translate()">{{ i18n.ts.translateNote }}</button>
						<button v-else class="_button" @mousedown="translation = null">{{ i18n.ts.close }}</button>
					</div>
					<div v-if="translating || translation" :class="$style.translation">
						<MkLoading v-if="translating" mini/>
						<div v-else>
							<b>{{ i18n.t('translatedFrom', { x: translation.sourceLang }) }}:</b><hr style="margin: 10px 0;">
							<Mfm :text="translation.text" :author="appearNote.user" :nyaize="noNyaize ? false : 'respect'" :emojiUrls="appearNote.emojis" @click.stop/>
							<div v-if="translation.translator == 'ctav3'" style="margin-top: 10px; padding: 0 0 15px;">
								<img v-if="!defaultStore.state.darkMode" src="/client-assets/color-short.svg" alt="" style="float: right;">
								<img v-else src="/client-assets/white-short.svg" alt="" style="float: right;"/>
							</div>
						</div>
					</div>
					<div v-if="viewTextSource">
						<hr style="margin: 10px 0;">
						<pre style="margin: initial;"><small>{{ appearNote.text }}</small></pre>
						<button class="_button" style="padding-top: 5px; color: var(--accent);" @mousedown="viewTextSource = false"><small>{{ i18n.ts.close }}</small></button>
					</div>
				</div>
				<div v-if="appearNote.files.length > 0">
					<MkMediaList v-if="appearNote.disableRightClick" :mediaList="appearNote.files" @click.stop @contextmenu.prevent/>
					<MkMediaList v-else :mediaList="appearNote.files" @click.stop/>
				</div>
				<MkPoll v-if="appearNote.poll" :note="appearNote" :class="$style.poll" @click.stop/>
				<MkUrlPreview v-for="url in urls" :key="url" :url="url" :compact="true" :detail="false" :class="$style.urlPreview"/>
				<button v-if="(isLong || (isMFM && defaultStore.state.collapseDefault) || (appearNote.files.length > 0 && defaultStore.state.allMediaNoteCollapse)) && collapsed" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" :class="$style.collapsed" class="_button" @click.stop="collapsed = false">
					<span :class="$style.collapsedLabel">
						{{ i18n.ts.showMore }}
						<span v-if="appearNote.files.length > 0" :class="$style.label">({{ collapseLabel }})</span>
					</span>
				</button>
				<button v-else-if="(isLong || (isMFM && defaultStore.state.collapseDefault) || (appearNote.files.length > 0 && defaultStore.state.allMediaNoteCollapse)) && !collapsed" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" :class="$style.showLess" class="_button" @click.stop="collapsed = true">
					<span :class="$style.showLessLabel">{{ i18n.ts.showLess }}</span>
				</button>
			</div>
			<MkA v-if="appearNote.channel && !inChannel" :class="$style.channel" :to="`/channels/${appearNote.channel.id}`"><i class="ti ti-device-tv"></i> {{ appearNote.channel.name }}</MkA>
		</div>
		<div v-if="appearNote.renote" :class="$style.quote"><MkNoteSimple :note="appearNote.renote" :class="$style.quoteNote"/></div>
		<div>
			<MkReactionsViewer :note="appearNote" :maxNumber="16" @click.stop @mockUpdateMyReaction="emitUpdReaction">
				<template #more>
					<div :class="$style.reactionOmitted">{{ i18n.ts.more }}</div>
				</template>
			</MkReactionsViewer>
			<footer :class="$style.footer">
				<button v-if="!note.isHidden" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.reply" :class="$style.footerButton" class="_button" @click.stop="reply()">
					<i class="ti ti-arrow-back-up"></i>
					<p v-if="appearNote.repliesCount > 0" :class="$style.footerButtonCount">{{ appearNote.repliesCount }}</p>
				</button>
				<button v-else :class="$style.footerButton" class="_button" disabled>
					<i class="ti ti-ban"></i>
				</button>
				<button
					v-if="canRenote"
					ref="renoteButton"
					v-vibrate="defaultStore.state.vibrateSystem ? [30, 30, 60] : []"
					v-tooltip="i18n.ts.renote"
					:class="$style.footerButton"
					class="_button"
					@mousedown="defaultStore.state.renoteQuoteButtonSeparation ? renoteOnly() : renote()"
				>
					<i class="ti ti-repeat"></i>
					<p v-if="appearNote.renoteCount > 0" :class="$style.footerButtonCount">{{ appearNote.renoteCount }}</p>
				</button>
				<button v-else :class="$style.footerButton" class="_button" disabled>
					<i class="ti ti-ban"></i>
				</button>
				<button v-if="appearNote.myReaction == null" ref="heartReactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" v-tooltip="i18n.ts.like" :class="$style.footerButton" class="_button" @mousedown="heartReact()">
					<i class="ti ti-heart"></i>
				</button>
				<button v-if="appearNote.reactionAcceptance !== 'likeOnly'" ref="reactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" :class="$style.footerButton" class="_button" @mousedown="react()">
					<i v-if="appearNote.myReaction == null" v-tooltip="i18n.ts.reaction" class="ti ti-mood-plus"></i>
					<i v-else v-tooltip="i18n.ts.editReaction" class="ti ti-mood-edit"></i>
				</button>
				<button v-if="appearNote.myReaction != null && appearNote.reactionAcceptance == 'likeOnly'" ref="reactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" v-tooltip="i18n.ts.removeReaction" :class="$style.footerButton" class="_button" @click.stop="undoReact(appearNote)">
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
	</article>
</div>
<div v-else-if="!hardMuted" :class="$style.muted" @click="muted = false">
	<I18n :src="i18n.ts.userSaysSomething" tag="small">
		<template #name>
			<MkA v-user-preview="appearNote.userId" :to="userPage(appearNote.user)">
				<MkUserName :user="appearNote.user"/>
			</MkA>
		</template>
	</I18n>
</div>
<div v-else>
	<!--
		MkDateSeparatedList uses TransitionGroup which requires single element in the child elements
		so MkNote create empty div instead of no elements
	-->
</div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, shallowRef, Ref, defineAsyncComponent, watch, provide } from 'vue';
import * as mfm from 'cherrypick-mfm-js';
import * as Misskey from 'cherrypick-js';
import MkNoteSub from '@/components/MkNoteSub.vue';
import MkNoteHeader from '@/components/MkNoteHeader.vue';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkReactionsViewer from '@/components/MkReactionsViewer.vue';
import MkMediaList from '@/components/MkMediaList.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkUsersTooltip from '@/components/MkUsersTooltip.vue';
import MkUrlPreview from '@/components/MkUrlPreview.vue';
import MkEvent from '@/components/MkEvent.vue';
import { pleaseLogin } from '@/scripts/please-login.js';
import { focusPrev, focusNext } from '@/scripts/focus.js';
import { checkWordMute } from '@/scripts/check-word-mute.js';
import { userPage } from '@/filters/user.js';
import * as os from '@/os.js';
import * as sound from '@/scripts/sound.js';
import { defaultStore, noteViewInterruptors } from '@/store.js';
import { reactionPicker } from '@/scripts/reaction-picker.js';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm.js';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';
import { getAbuseNoteMenu, getCopyNoteLinkMenu, getNoteClipMenu, getNoteMenu, getRenoteMenu, getRenoteOnly } from '@/scripts/get-note-menu.js';
import { useNoteCapture } from '@/scripts/use-note-capture.js';
import { deepClone } from '@/scripts/clone.js';
import { useTooltip } from '@/scripts/use-tooltip.js';
import { claimAchievement } from '@/scripts/achievements.js';
import { getNoteSummary } from '@/scripts/get-note-summary.js';
import { MenuItem } from '@/types/menu.js';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { showMovedDialog } from '@/scripts/show-moved-dialog.js';
import { shouldCollapsed, shouldMfmCollapsed } from '@/scripts/collapsed.js';
import { globalEvents } from '@/events.js';
import { mainRouter, useRouter } from '@/router.js';
import { notePage } from '@/filters/note.js';
import { miLocalStorage } from '@/local-storage.js';
import { instance } from '@/instance.js';
import { concat } from '@/scripts/array.js';
import { vibrate } from '@/scripts/vibrate.js';
import detectLanguage from '@/scripts/detect-language.js';

let showEl = $ref(false);

const props = withDefaults(defineProps<{
	note: Misskey.entities.Note;
	pinned?: boolean;
	mock?: boolean;
	withHardMute?: boolean;
  notification?: boolean;
}>(), {
	mock: false,
	notification: false,
});

provide('mock', props.mock);

const emit = defineEmits<{
  (ev: 'reaction', emoji: string): void;
  (ev: 'removeReaction', emoji: string): void;
}>();

const inChannel = inject('inChannel', null);
const currentClip = inject<Ref<Misskey.entities.Clip> | null>('currentClip', null);

let note = $ref(deepClone(props.note));

// plugin
if (noteViewInterruptors.length > 0) {
	onMounted(async () => {
		let result: Misskey.entities.Note | null = deepClone(note);
		for (const interruptor of noteViewInterruptors) {
			try {
				result = await interruptor.handler(result);
				if (result === null) {
					isDeleted.value = true;
					return;
				}
			} catch (err) {
				console.error(err);
			}
		}
		note = result;
	});
}

const isRenote = (
	note.renote != null &&
	note.text == null &&
	note.fileIds.length === 0 &&
	note.poll == null
);

const el = shallowRef<HTMLElement>();
const menuButton = shallowRef<HTMLElement>();
const renoteButton = shallowRef<HTMLElement>();
const renoteTime = shallowRef<HTMLElement>();
const reactButton = shallowRef<HTMLElement>();
const heartReactButton = shallowRef<HTMLElement>();
const clipButton = shallowRef<HTMLElement>();
let appearNote = $computed(() => isRenote ? note.renote as Misskey.entities.Note : note);
const isMyRenote = $i && ($i.id === note.userId);
const showContent = ref(false);
const parsed = $computed(() => appearNote.text ? mfm.parse(appearNote.text) : null);
const urls = $computed(() => parsed ? extractUrlFromMfm(parsed) : null);
const isLong = shouldCollapsed(appearNote, urls ?? []);
const isMFM = shouldMfmCollapsed(appearNote);
const collapsed = ref(appearNote.cw == null && (isLong || (isMFM && defaultStore.state.collapseDefault) || defaultStore.state.allMediaNoteCollapse));
const isDeleted = ref(false);
const muted = ref(checkMute(appearNote, $i?.mutedWords));
const hardMuted = ref(props.withHardMute && checkMute(appearNote, $i?.hardMutedWords));
const translation = ref<any>(null);
const translating = ref(false);
const viewTextSource = ref(false);
const noNyaize = ref(false);
const canRenote = computed(() => ['public', 'home'].includes(appearNote.visibility) || (appearNote.visibility === 'followers' && appearNote.userId === $i.id));
const expandOnNoteClick = defaultStore.state.expandOnNoteClick;
const router = useRouter();
let renoteCollapsed = $ref(defaultStore.state.collapseRenotes && isRenote && (($i && ($i.id === note.userId || $i.id === appearNote.userId)) || (appearNote.myReaction != null)));

const collapseLabel = computed(() => {
	return concat([
		appearNote.files && appearNote.files.length !== 0 ? [i18n.t('_cw.files', { count: appearNote.files.length })] : [],
	] as string[][]).join(' / ');
});

function checkMute(note: Misskey.entities.Note, mutedWords: Array<string | string[]> | undefined | null): boolean {
	if (mutedWords == null) return false;

	if (checkWordMute(note, $i, mutedWords)) return true;
	if (note.reply && checkWordMute(note.reply, $i, mutedWords)) return true;
	if (note.renote && checkWordMute(note.renote, $i, mutedWords)) return true;
	return false;
}

const keymap = {
	'r': () => reply(true),
	'e|a|plus': () => react(true),
	'q': () => renoteButton.value.renote(true),
	'up|k|shift+tab': focusBefore,
	'down|j|tab': focusAfter,
	'esc': blur,
	'm|o': () => menu(true),
	's': () => showContent.value !== showContent.value,
};

provide('react', (reaction: string) => {
	os.api('notes/reactions/create', {
		noteId: appearNote.id,
		reaction: reaction,
	});
});

onMounted(() => {
	globalEvents.on('showEl', (showEl_receive) => {
		showEl = showEl_receive;
	});
});

if (props.mock) {
	watch(() => props.note, (to) => {
		note = deepClone(to);
	}, { deep: true });
} else {
	useNoteCapture({
		rootEl: el,
		note: $$(appearNote),
		pureNote: $$(note),
		isDeletedRef: isDeleted,
	});
}

if (!props.mock) {
	useTooltip(renoteButton, async (showing) => {
		const renotes = await os.api('notes/renotes', {
			noteId: appearNote.id,
			limit: 11,
		});

		const users = renotes.map(x => x.user);

		if (users.length < 1) return;

		os.popup(MkUsersTooltip, {
			showing,
			users,
			count: appearNote.renoteCount,
			targetElement: renoteButton.value,
		}, {}, 'closed');
	});
}

function noteClick(ev: MouseEvent) {
	if (document.getSelection().type === 'Range' || !expandOnNoteClick) ev.stopPropagation();
	else router.push(notePage(appearNote));
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
	if (appearNote.channel) {
		os.post({
			renote: appearNote,
			channel: appearNote.channel,
			animation: !viaKeyboard,
		}, () => {
			focus();
		});
	}
	os.post({
		renote: appearNote,
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
		reply: appearNote,
		channel: appearNote.channel,
		animation: !viaKeyboard,
	}, () => {
		focus();
	});
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	showMovedDialog();
	if (appearNote.reactionAcceptance === 'likeOnly') {
		sound.play('reaction');

		if (props.mock) {
			return;
		}
		os.api('notes/reactions/create', {
			noteId: appearNote.id,
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
			noteId: appearNote.id,
			reaction: reaction,
		});
	}
	if (appearNote.text && appearNote.text.length > 100 && (Date.now() - new Date(appearNote.createdAt).getTime() < 1000 * 3)) {
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
		noteId: appearNote.id,
		reaction: '❤️',
	});
	if (appearNote.text && appearNote.text.length > 100 && (Date.now() - new Date(appearNote.createdAt).getTime() < 1000 * 3)) {
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

function onContextmenu(ev: MouseEvent): void {
	if (props.mock) {
		return;
	}

	const isLink = (el: HTMLElement) => {
		if (el.tagName === 'A') return true;
		// 再生速度の選択などのために、Audio要素のコンテキストメニューはブラウザデフォルトとする。
		if (el.tagName === 'AUDIO') return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (window.getSelection().toString() !== '') return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		const { menu, cleanup } = getNoteMenu({ note: note, translating, translation, viewTextSource, noNyaize, menuButton, isDeleted, currentClip: currentClip?.value });
		os.contextMenu(menu, ev).then(focus).finally(cleanup);
	}
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

const isForeignLanguage: boolean = appearNote.text != null && (() => {
	const targetLang = (miLocalStorage.getItem('lang') ?? navigator.language).slice(0, 2);
	const postLang = detectLanguage(appearNote.text);
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
		noteId: appearNote.id,
		targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
	});
	translating.value = false;
	translation.value = res;

	vibrate(defaultStore.state.vibrateSystem ? [5, 5, 10] : []);
}

function showRenoteMenu(viaKeyboard = false): void {
	if (props.mock) {
		return;
	}

	function getUnrenote(): MenuItem {
		return {
			text: i18n.ts.unrenote,
			icon: 'ti ti-trash',
			danger: true,
			action: () => {
				os.api('notes/delete', {
					noteId: note.id,
				});
				isDeleted.value = true;
			},
		};
	}

	if (isMyRenote) {
		pleaseLogin();
		os.popupMenu([
			getCopyNoteLinkMenu(note, i18n.ts.copyLinkRenote),
			null,
			getUnrenote(),
		], renoteTime.value, {
			viaKeyboard: viaKeyboard,
		});
	} else {
		os.popupMenu([
			getCopyNoteLinkMenu(note, i18n.ts.copyLinkRenote),
			null,
			getAbuseNoteMenu(note, i18n.ts.reportAbuseRenote),
			$i.isModerator || $i.isAdmin ? getUnrenote() : undefined,
		], renoteTime.value, {
			viaKeyboard: viaKeyboard,
		});
	}
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}

function focusBefore() {
	focusPrev(el.value);
}

function focusAfter() {
	focusNext(el.value);
}

function readPromo() {
	os.api('promo/read', {
		noteId: appearNote.id,
	});
	isDeleted.value = true;
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
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;
	background: var(--panel);

	// これらの指定はパフォーマンス向上には有効だが、ノートの高さは一定でないため、
	// 下の方までスクロールすると上のノートの高さがここで決め打ちされたものに変化し、表示しているノートの位置が変わってしまう
	// ノートがマウントされたときに自身の高さを取得し contain-intrinsic-size を設定しなおせばほぼ解決できそうだが、
	// 今度はその処理自体がパフォーマンス低下の原因にならないか懸念される。また、被リアクションでも高さは変化するため、やはり多少のズレは生じる
	// 一度レンダリングされた要素はブラウザがよしなにサイズを覚えておいてくれるような実装になるまで待った方が良さそう(なるのか？)
	//content-visibility: auto;
  //contain-intrinsic-size: 0 128px;

	&:focus-visible {
		outline: none;

		&:after {
			content: "";
			pointer-events: none;
			display: block;
			position: absolute;
			z-index: 10;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			width: calc(100% - 8px);
			height: calc(100% - 8px);
			border: dashed 1px var(--focus);
			border-radius: var(--radius);
			box-sizing: border-box;
		}
	}

	.footer {
		position: relative;
		z-index: 1;
	}

	&:hover > .article > .main > .footer > .footerButton {
		opacity: 1;
	}

	&.showActionsOnlyHover {
		.footer {
			visibility: hidden;
			position: absolute;
			top: 12px;
			right: 12px;
			padding: 0 4px;
			margin-bottom: 0 !important;
			background: var(--popup);
			border-radius: 8px;
			box-shadow: 0px 4px 32px var(--shadow);
		}

		.footerButton {
			font-size: 90%;

			&:not(:last-child) {
				margin-right: 0;
			}
		}
	}

	&.showActionsOnlyHover:hover {
		.footer {
			visibility: visible;
		}
	}

	&.radius {
		border-radius: var(--radius);
	}
}

.tip {
	display: flex;
	align-items: center;
	padding: 24px 38px 16px;
	line-height: 24px;
	font-size: 90%;
	white-space: pre;
	color: #d28a3f;
}

.tip + .article {
	padding-top: 8px;
}

.replyTo {
	opacity: 0.7;
	padding-bottom: 0;
}

.renote {
	position: relative;
	display: flex;
	align-items: center;
	padding: 24px 38px 16px;
	line-height: 28px;
	white-space: pre;
	color: var(--renote);

	& + .article {
		padding-top: 8px;
	}

	> .colorBar {
		height: calc(100% - 6px);
	}
}

.renoteAvatar {
	flex-shrink: 0;
	display: inline-block;
	width: 28px;
	height: 28px;
	margin: 0 8px 0 0;
	background: var(--panel);
}

.renoteText {
	overflow: hidden;
	flex-shrink: 1;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.renoteUserName {
	font-weight: bold;
	text-decoration: none;

	&:hover {
		color: var(--renoteHover);
		text-decoration: none;
	}
}

.renoteInfo {
	margin-left: auto;
	font-size: 0.9em;
}

.renoteTime {
	flex-shrink: 0;
	color: inherit;
}

.renoteMenu {
	margin-right: 4px;
}

.collapsedRenoteTarget {
	display: flex;
	align-items: center;
	line-height: 28px;
	white-space: pre;
	padding: 8px 38px 24px;
}

.collapsedRenoteTargetAvatar {
	flex-shrink: 0;
	display: inline-block;
	width: 28px;
	height: 28px;
	margin: 0 8px 0 0;
	background: var(--panel);
}

.collapsedRenoteTargetText {
	overflow: hidden;
	flex-shrink: 1;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 90%;
	opacity: 0.7;
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
}

.article {
	position: relative;
	padding: 28px 32px;
}

.colorBar {
	position: absolute;
	top: 8px;
	left: 8px;
	width: 5px;
	height: calc(100% - 16px);
	border-radius: 999px;
	pointer-events: none;
}

.avatar {
	flex-shrink: 0;
	display: block !important;
	position: sticky !important;
	margin: 0 14px 0 0;
	width: 58px;
	height: 58px;
	top: calc(22px + var(--stickyTop, 0px));
	left: 0;
	background: var(--panel);
	transition: top 0.5s;

	&.avatarReplyTo {
		position: relative !important;
		top: 0 !important;
	}
}

.main {
	flex: 1;
	min-width: 0;
}

.cw {
	cursor: default;
	display: grid;
	margin: 0;
	padding: 0;
	overflow-wrap: break-word;
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

.contentCollapsed {
	position: relative;
	max-height: 9em;
	overflow: clip;
}

.collapsed {
	display: block;
	position: absolute;
	bottom: 0;
	left: 0;
	z-index: 2;
	width: 100%;
	height: 64px;
	background: linear-gradient(0deg, var(--panel), var(--X15));

	&:hover > .collapsedLabel {
		background: var(--panelHighlight);
	}
}

.collapsedLabel {
	display: inline-block;
	background: var(--panel);
	padding: 6px 10px;
	font-size: 0.8em;
	border-radius: 999px;
	box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
}

.text {
	overflow-wrap: break-word;
}

.replyIcon {
	color: var(--accent);
	margin-right: 0.5em;
}

.translation {
	border: solid 0.5px var(--divider);
	border-radius: var(--radius);
	padding: 12px;
	margin-top: 8px;
}

.urlPreview {
	margin-top: 8px;
}

.poll {
	font-size: 80%;
}

.quote {
	padding: 8px 0;
}

.quoteNote {
	padding: 24px;
	border: solid 1px var(--renote);
	border-radius: 8px;
	overflow: clip;
}

.channel {
	opacity: 0.7;
	font-size: 80%;
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

.danger {
	color: var(--accent);
}

@container (max-width: 580px) {
	.root {
		font-size: 0.95em;
	}

	.renote {
		padding: 24px 28px 16px;
	}

	.collapsedRenoteTarget {
		padding: 8px 28px 24px;
	}

	.article {
		padding: 24px 26px;
	}

	.avatar {
		width: 50px;
		height: 50px;
	}
}

@container (max-width: 500px) {
	.root {
		font-size: 0.9em;
	}

	.article {
		padding: 23px 25px;
	}

	.avatar {
		&.showEl {
			top: 14px;
		}

		&.showElTab {
			top: 54px;
		}
	}

	.footer {
		margin-bottom: -8px;
	}
}

@container (max-width: 480px) {
	.renote {
		padding: 20px 24px 8px;
	}

	.tip {
		padding: 20px 24px 8px;
	}

	.collapsedRenoteTarget {
		padding: 8px 24px 20px;
		margin-top: 4px;
	}

	.article {
		padding: 22px 24px;
	}
}

@container (max-width: 450px) {
	.avatar {
		margin: 0 10px 0 0;
		width: 46px;
		height: 46px;
		top: calc(14px + var(--stickyTop, 0px));
	}
}

@container (max-width: 400px) {
	.root:not(.showActionsOnlyHover) {
		.footerButton {
			&:not(:last-child) {
				margin-right: 18px;
			}
		}
	}
}

@container (max-width: 350px) {
	.root:not(.showActionsOnlyHover) {
		.footerButton {
			&:not(:last-child) {
				margin-right: 12px;
			}
		}
	}

	.colorBar {
		top: 6px;
		left: 6px;
		width: 4px;
		height: calc(100% - 12px);
	}
}

@container (max-width: 300px) {
	.avatar {
		width: 44px;
		height: 44px;
	}

	.root:not(.showActionsOnlyHover) {
		.footerButton {
			&:not(:last-child) {
				margin-right: 8px;
			}
		}
	}
}

@container (max-width: 250px) {
	.quoteNote {
		padding: 12px;
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
}

.reactionOmitted {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	opacity: .8;
}
</style>
