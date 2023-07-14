<template>
<div ref="el" :class="[$style.root, { [$style.collapsed]: collapsed }]">
	<div>
		<span v-if="note.isHidden" style="opacity: 0.5">({{ i18n.ts.private }})</span>
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ i18n.ts.deleted }})</span>
		<MkA v-if="note.replyId" :class="$style.reply" :to="`/notes/${note.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
		<Mfm v-if="note.text" :text="note.text" :author="note.user" :i="$i" :emojiUrls="note.emojis"/>
		<MkA v-if="note.renoteId" :class="$style.rp" :to="`/notes/${note.renoteId}`">RN: ...</MkA>
		<div v-if="defaultStore.state.showTranslateButtonInNote && instance.translatorAvailable && note.text" style="padding-top: 5px; color: var(--accent);">
			<button v-if="!(translating || translation)" ref="translateButton" class="_button" @mousedown="translate()">{{ i18n.ts.translateNote }}</button>
			<button v-else class="_button" @mousedown="translation = null">{{ i18n.ts.close }}</button>
		</div>
		<div v-if="translating || translation" :class="$style.translation">
			<MkLoading v-if="translating" mini/>
			<div v-else>
				<b>{{ i18n.t('translatedFrom', { x: translation.sourceLang }) }}:</b><hr style="margin: 10px 0;">
				<Mfm :text="translation.text" :author="note.user" :i="$i" :emojiUrls="note.emojis"/>
				<div v-if="translation.translator == 'ctav3'" style="margin-top: 10px; padding: 0 0 15px;">
					<img v-if="!defaultStore.state.darkMode" src="/client-assets/color-short.svg" alt="" style="float: right;">
					<img v-else src="/client-assets/white-short.svg" alt="" style="float: right;"/>
				</div>
			</div>
		</div>
		<MkDetailsButton v-if="note.files.length > 0 || note.poll" v-model="showContent" style="width: 100%" :note="note"/>
		<div v-show="showContent">
			<div v-if="note.files.length > 0">
				<MkMediaList v-if="note.disableRightClick" :mediaList="note.files" @contextmenu.prevent/>
				<MkMediaList v-else :mediaList="note.files"/>
			</div>
			<div v-if="note.poll">
				<MkPoll :note="note"/>
			</div>
		</div>
	</div>
	<button v-if="isLong && collapsed" :class="$style.fade" class="_button" @click="collapsed = false">
		<span :class="$style.fadeLabel">{{ i18n.ts.showMore }}</span>
	</button>
	<button v-else-if="isLong && !collapsed" :class="$style.showLess" class="_button" @click="collapsed = true">
		<span :class="$style.showLessLabel">{{ i18n.ts.showLess }}</span>
	</button>
	<div v-if="showSubNoteFooterButton">
		<MkReactionsViewer :note="note" :maxNumber="16">
			<template #more>
				<button class="_button" :class="$style.reactionDetailsButton" @click="showReactions">
					{{ i18n.ts.more }}
				</button>
			</template>
		</MkReactionsViewer>
		<footer :class="$style.footer">
			<button v-tooltip="i18n.ts.reply" :class="$style.footerButton" class="_button" @click="reply()">
				<i class="ti ti-arrow-back-up"></i>
				<p v-if="note.repliesCount > 0" :class="$style.footerButtonCount">{{ note.repliesCount }}</p>
			</button>
			<button
				v-if="canRenote"
				ref="renoteButton"
				v-tooltip="i18n.ts.renote"
				:class="$style.footerButton"
				class="_button"
				@mousedown="renote()"
			>
				<i class="ti ti-repeat"></i>
				<p v-if="note.renoteCount > 0" :class="$style.footerButtonCount">{{ note.renoteCount }}</p>
			</button>
			<button v-else :class="$style.footerButton" class="_button" disabled>
				<i class="ti ti-ban"></i>
			</button>
			<button v-if="note.myReaction == null" ref="heartReactButton" v-tooltip="i18n.ts.like" :class="$style.footerButton" class="_button" @mousedown="heartReact()">
				<i class="ti ti-heart"></i>
			</button>
			<button v-if="note.myReaction == null && note.reactionAcceptance !== 'likeOnly'" ref="reactButton" v-tooltip="i18n.ts.reaction" :class="$style.footerButton" class="_button" @mousedown="react()">
				<i class="ti ti-mood-plus"></i>
			</button>
			<button v-if="note.myReaction != null" ref="reactButton" :class="$style.footerButton" class="_button" @click="undoReact(note)">
				<i class="ti ti-mood-minus"></i>
			</button>
			<button v-if="canRenote" v-tooltip="i18n.ts.quote" class="_button" :class="$style.footerButton" @mousedown="quote()"><i class="ti ti-quote"></i></button>
			<button v-if="defaultStore.state.showClipButtonInNoteFooter" ref="clipButton" v-tooltip="i18n.ts.clip" :class="$style.footerButton" class="_button" @mousedown="clip()">
				<i class="ti ti-paperclip"></i>
			</button>
			<MkA v-if="defaultStore.state.infoButtonForNoteActionsEnabled && defaultStore.state.showNoteActionsOnlyHover" v-tooltip="i18n.ts.details" :to="notePage(note)" :class="$style.footerButton" style="text-decoration: none;" class="_button">
				<i class="ti ti-info-circle"></i>
			</MkA>
			<button ref="menuButton" v-tooltip="i18n.ts.more" :class="$style.footerButton" class="_button" @mousedown="menu()">
				<i class="ti ti-dots"></i>
			</button>
		</footer>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, inject, Ref, ref, shallowRef } from 'vue';
import * as misskey from 'cherrypick-js';
import * as os from '@/os';
import MkMediaList from '@/components/MkMediaList.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkDetailsButton from '@/components/MkDetailsButton.vue';
import MkUsersTooltip from '@/components/MkUsersTooltip.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import MkReactionsViewer from "@/components/MkReactionsViewer.vue";
import { i18n } from '@/i18n';
import { $i } from '@/account';
import { defaultStore } from '@/store';
import { miLocalStorage } from '@/local-storage';
import { instance } from '@/instance';
import { notePage } from '@/filters/note';
import { useTooltip } from '@/scripts/use-tooltip';
import { pleaseLogin } from '@/scripts/please-login';
import { showMovedDialog } from '@/scripts/show-moved-dialog';
import { getNoteClipMenu, getNoteMenu } from '@/scripts/get-note-menu';
import { deepClone } from '@/scripts/clone';
import { reactionPicker } from '@/scripts/reaction-picker';
import { claimAchievement } from '@/scripts/achievements';
import { useNoteCapture } from '@/scripts/use-note-capture';

const el = shallowRef<HTMLElement>();
const menuButton = shallowRef<HTMLElement>();
const renoteButton = shallowRef<HTMLElement>();
const reactButton = shallowRef<HTMLElement>();
const heartReactButton = shallowRef<HTMLElement>();
const clipButton = shallowRef<HTMLElement>();
const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || props.note.userId === $i.id);
const isDeleted = ref(false);
const currentClip = inject<Ref<misskey.entities.Clip> | null>('currentClip', null);

const showContent = ref(false);
const translation = ref<any>(null);
const translating = ref(false);

const props = defineProps<{
	note: misskey.entities.Note;
	showSubNoteFooterButton: boolean;
}>();

let note = $ref(deepClone(props.note));

const isLong =
	props.note.cw == null && props.note.text != null && (
		(props.note.text.split('\n').length > 9) ||
		(props.note.text.length > 500)
	);

const collapsed = $ref(isLong);

useNoteCapture({
	rootEl: el,
	note: $$(note),
	isDeletedRef: isDeleted,
});

function menu(viaKeyboard = false): void {
	os.popupMenu(getNoteMenu({ note: note, translating, translation, menuButton, isDeleted, currentClip: currentClip?.value }), menuButton.value, {
		viaKeyboard,
	}).then(focus);
}

async function clip() {
	os.popupMenu(await getNoteClipMenu({ note: note, isDeleted, currentClip: currentClip?.value }), clipButton.value).then(focus);
}

async function translate(): Promise<void> {
	if (translation.value != null) return;
	translating.value = true;
	const res = await os.api('notes/translate', {
		noteId: props.note.id,
		targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
	});
	translating.value = false;
	translation.value = res;
}

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

async function renote() {
	pleaseLogin();
	showMovedDialog();

	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.renoteConfirm,
	});
	if (canceled) return;

	if (props.note.channel) {
		const el = renoteButton.value as HTMLElement | null | undefined;
		if (el) {
			const rect = el.getBoundingClientRect();
			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);
			os.popup(MkRippleEffect, { x, y }, {}, 'end');
		}

		os.api('notes/create', {
			renoteId: props.note.id,
			channelId: props.note.channelId,
		}).then(() => {
			os.noteToast(i18n.ts.renoted);
		});
	}

	const el = renoteButton.value as HTMLElement | null | undefined;
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(MkRippleEffect, { x, y }, {}, 'end');
	}

	os.api('notes/create', {
		renoteId: props.note.id,
	}).then(() => {
		os.noteToast(i18n.ts.renoted);
	});
}

function quote() {
	pleaseLogin();
	showMovedDialog();

	if (props.note.channel) {
		os.post({
			renote: props.note,
			channel: props.note.channel,
		});
	}

	os.post({
		renote: props.note,
	});
}

function reply(viaKeyboard = false): void {
	pleaseLogin();
	os.post({
		reply: props.note,
		animation: !viaKeyboard,
	}, () => {
		focus();
	});
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	showMovedDialog();
	if (props.note.reactionAcceptance === 'likeOnly') {
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
			os.api('notes/reactions/create', {
				noteId: props.note.id,
				reaction: reaction,
			});
			if (props.note.text && props.note.text.length > 100 && (Date.now() - new Date(props.note.createdAt).getTime() < 1000 * 3)) {
				claimAchievement('reactWithoutRead');
			}
		}, () => {
			focus();
		});
	}
}

function heartReact(): void {
	pleaseLogin();
	showMovedDialog();
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
	os.api('notes/reactions/delete', {
		noteId: note.id,
	});
}

function showReactions(): void {
	os.popup(defineAsyncComponent(() => import('@/components/MkReactedUsersDialog.vue')), {
		noteId: props.note.id,
	}, {}, 'closed');
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
			height: 64px;
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
