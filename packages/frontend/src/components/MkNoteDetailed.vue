<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	v-if="!muted"
	v-show="!isDeleted"
	ref="el"
	v-hotkey="keymap"
	:class="$style.root"
>
	<div v-if="appearNote.reply && appearNote.reply.replyId && !conversationLoaded" style="padding: 16px">
		<MkButton style="margin: 0 auto;" primary rounded @click="loadConversation">{{ i18n.ts.loadConversation }}</MkButton>
	</div>
	<div v-if="isRenote" :class="$style.renote">
		<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="$style.renoteAvatar" :user="note.user" link preview/>
		<MkA v-user-preview="note.userId" :class="$style.renoteName" :to="userPage(note.user)"/>
		<i class="ti ti-repeat" style="margin-right: 4px;"></i>
		<span :class="$style.renoteText">
			<I18n :src="i18n.ts.renotedBy" tag="span">
				<template #user>
					<MkUserName :class="$style.renoteName" :user="note.user"/>
				</template>
			</I18n>
		</span>
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
			<span :class="$style.renoteTime">
				<button ref="renoteTime" class="_button">
					<i class="ti ti-dots" :class="$style.renoteMenu" @click="showRenoteMenu()"></i>
				</button>
				<MkTime :time="note.createdAt" :mode="defaultStore.state.enableAbsoluteTime ? 'absolute' : 'relative'"/>
			</span>
		</div>
	</div>
	<template v-if="appearNote.reply && appearNote.reply.replyId"><MkNoteSub v-for="note in conversation" :key="note.id" :class="$style.replyToMore" :note="note"/></template>
	<MkNoteSub v-if="appearNote.reply" :note="appearNote.reply" :class="$style.replyTo"/>
	<article :class="$style.note" @contextmenu.stop="onContextmenu">
		<header :class="$style.noteHeader">
			<MkAvatar v-if="!defaultStore.state.hideAvatarsInNote" :class="$style.noteHeaderAvatar" :user="appearNote.user" indicator link preview/>
			<div style="display: flex; align-items: center; white-space: nowrap; overflow: hidden;">
				<div :class="$style.noteHeaderBody">
					<div :class="$style.noteHeaderName">
						<MkA v-user-preview="appearNote.user.id" :class="$style.noteHeaderName" :to="userPage(appearNote.user)">
							<MkUserName :nowrap="true" :user="appearNote.user"/>
						</MkA>
						<span v-if="appearNote.user.isBot" :class="$style.isBot">bot</span>
						<span v-if="appearNote.user.badgeRoles" :class="$style.badgeRoles">
							<img v-for="role in appearNote.user.badgeRoles" :key="role.id" v-tooltip="role.name" :class="$style.badgeRole" :src="role.iconUrl"/>
						</span>
					</div>
					<div :class="$style.noteHeaderUsername"><MkAcct :user="appearNote.user"/></div>
				</div>
			</div>
			<div style="display: flex; align-items: flex-end; margin-left: auto;">
				<div :class="$style.noteHeaderBody">
					<div :class="$style.noteHeaderInfo">
						<span v-if="appearNote.visibility !== 'public'" style="margin-left: 0.5em;">
							<i v-if="appearNote.visibility === 'home'" v-tooltip="i18n.ts._visibility[appearNote.visibility]" class="ti ti-home"></i>
							<i v-else-if="appearNote.visibility === 'followers'" v-tooltip="i18n.ts._visibility[appearNote.visibility]" class="ti ti-lock"></i>
							<i v-else-if="appearNote.visibility === 'specified'" ref="specified" v-tooltip="i18n.ts._visibility[appearNote.visibility]" class="ti ti-mail"></i>
						</span>
						<span v-if="note.reactionAcceptance != null" style="margin-left: 0.5em;" :class="{ [$style.danger]: ['nonSensitiveOnly', 'nonSensitiveOnlyForLocalLikeOnlyForRemote', 'likeOnly'].includes(<string>note.reactionAcceptance) }" :title="i18n.ts.reactionAcceptance">
							<i v-if="note.reactionAcceptance === 'likeOnlyForRemote'" v-tooltip="i18n.ts.likeOnlyForRemote" class="ti ti-heart-plus"></i>
							<i v-else-if="note.reactionAcceptance === 'nonSensitiveOnly'" v-tooltip="i18n.ts.nonSensitiveOnly" class="ti ti-icons"></i>
							<i v-else-if="note.reactionAcceptance === 'nonSensitiveOnlyForLocalLikeOnlyForRemote'" v-tooltip="i18n.ts.nonSensitiveOnlyForLocalLikeOnlyForRemote" class="ti ti-heart-plus"></i>
							<i v-else-if="note.reactionAcceptance === 'likeOnly'" v-tooltip="i18n.ts.likeOnly" class="ti ti-heart"></i>
						</span>
						<span v-if="appearNote.localOnly" style="margin-left: 0.5em;"><i v-tooltip="i18n.ts._visibility['disableFederation']" class="ti ti-rocket-off"></i></span>
					</div>
					<MkInstanceTicker v-if="showTicker" :instance="appearNote.user.instance"/>
				</div>
			</div>
		</header>
		<div :class="$style.noteContent">
			<MkEvent v-if="appearNote.event" :note="appearNote"/>
			<p v-if="appearNote.cw != null" :class="$style.cw">
				<Mfm v-if="appearNote.cw != ''" style="margin-right: 8px;" :text="appearNote.cw" :author="appearNote.user" :nyaize="noNyaize ? false : 'respect'"/>
				<MkCwButton v-model="showContent" :text="appearNote.text" :files="appearNote.files" :poll="appearNote.poll"/>
			</p>
			<div v-show="appearNote.cw == null || showContent">
				<span v-if="appearNote.isHidden" style="opacity: 0.5">({{ i18n.ts._ffVisibility.private }})</span>
				<MkA v-if="appearNote.replyId" :class="$style.noteReplyTarget" :to="`/notes/${appearNote.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
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
				<a v-if="appearNote.renote != null" :class="$style.rn">RN:</a>
				<div v-if="defaultStore.state.showTranslateButtonInNote && instance.translatorAvailable && $i && appearNote.text && isForeignLanguage" style="padding-top: 5px; color: var(--accent);">
					<button v-if="!(translating || translation)" ref="translateButton" class="_button" @mousedown="translate()">{{ i18n.ts.translateNote }}</button>
					<button v-else class="_button" @mousedown="translation = null">{{ i18n.ts.close }}</button>
				</div>
				<div v-if="translating || translation" :class="$style.translation">
					<MkLoading v-if="translating" mini/>
					<div v-else>
						<b>{{ i18n.t('translatedFrom', { x: translation.sourceLang }) }}:</b><hr style="margin: 10px 0;">
						<Mfm :text="translation.text" :author="appearNote.user" :nyaize="noNyaize ? false : 'respect'" :emojiUrls="appearNote.emojis"/>
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
				<div v-if="appearNote.files.length > 0">
					<MkMediaList v-if="appearNote.disableRightClick" :mediaList="appearNote.files" @contextmenu.prevent/>
					<MkMediaList v-else :mediaList="appearNote.files"/>
				</div>
				<MkPoll v-if="appearNote.poll" ref="pollViewer" :note="appearNote" :class="$style.poll"/>
				<MkUrlPreview v-for="url in urls" :key="url" :url="url" :compact="true" :detail="true" style="margin-top: 6px;"/>
				<div v-if="appearNote.renote" :class="$style.quote"><MkNoteSimple :note="appearNote.renote" :class="$style.quoteNote"/></div>
			</div>
			<MkA v-if="appearNote.channel && !inChannel" :class="$style.channel" :to="`/channels/${appearNote.channel.id}`"><i class="ti ti-device-tv"></i> {{ appearNote.channel.name }}</MkA>
		</div>
		<footer>
			<div :class="$style.noteFooterInfo">
				<div v-if="appearNote.updatedAt">
					{{ i18n.ts.edited }}: <MkTime :class="$style.time" :time="appearNote.updatedAt" mode="detail" colored/>
				</div>
				<MkA :to="notePage(appearNote)">
					<MkTime :class="$style.time" :time="appearNote.createdAt" mode="detail" colored/>
				</MkA>
			</div>
			<MkReactionsViewer ref="reactionsViewer" :note="appearNote"/>
			<button v-if="!note.isHidden" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.reply" class="_button" :class="$style.noteFooterButton" @click="reply()">
				<i class="ti ti-arrow-back-up"></i>
				<p v-if="appearNote.repliesCount > 0" :class="$style.noteFooterButtonCount">{{ appearNote.repliesCount }}</p>
			</button>
			<button v-else class="_button" :class="$style.noteFooterButton" disabled>
				<i class="ti ti-ban"></i>
			</button>
			<button
				v-if="canRenote"
				ref="renoteButton"
				v-vibrate="defaultStore.state.vibrateSystem ? [30, 30, 60] : []"
				v-tooltip="i18n.ts.renote"
				class="_button"
				:class="$style.noteFooterButton"
				@mousedown="defaultStore.state.renoteQuoteButtonSeparation ? renoteOnly() : renote()"
			>
				<i class="ti ti-repeat"></i>
				<p v-if="appearNote.renoteCount > 0" :class="$style.noteFooterButtonCount">{{ appearNote.renoteCount }}</p>
			</button>
			<button v-else class="_button" :class="$style.noteFooterButton" disabled>
				<i class="ti ti-ban"></i>
			</button>
			<button v-if="appearNote.myReaction == null" ref="heartReactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" v-tooltip="i18n.ts.like" :class="$style.noteFooterButton" class="_button" @mousedown="heartReact()">
				<i class="ti ti-heart"></i>
			</button>
			<button v-if="appearNote.reactionAcceptance !== 'likeOnly'" ref="reactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" :class="$style.noteFooterButton" class="_button" @mousedown="react()">
				<i v-if="appearNote.myReaction == null" v-tooltip="i18n.ts.reaction" class="ti ti-mood-plus"></i>
				<i v-else v-tooltip="i18n.ts.editReaction" class="ti ti-mood-edit"></i>
			</button>
			<button v-if="appearNote.myReaction != null && appearNote.reactionAcceptance == 'likeOnly'" ref="reactButton" v-vibrate="defaultStore.state.vibrateSystem ? [30, 50, 50] : []" v-tooltip="i18n.ts.removeReaction" :class="[$style.noteFooterButton, $style.reacted]" class="_button" @click="undoReact(appearNote)">
				<i class="ti ti-heart-minus"></i>
			</button>
			<button v-if="canRenote && defaultStore.state.renoteQuoteButtonSeparation" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.quote" class="_button" :class="$style.noteFooterButton" @click="quote()">
				<i class="ti ti-quote"></i>
			</button>
			<button v-if="defaultStore.state.showClipButtonInNoteFooter" ref="clipButton" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.clip" class="_button" :class="$style.noteFooterButton" @mousedown="clip()">
				<i class="ti ti-paperclip"></i>
			</button>
			<button ref="menuButton" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip="i18n.ts.more" class="_button" :class="$style.noteFooterButton" @mousedown="menu()">
				<i class="ti ti-dots"></i>
			</button>
		</footer>
	</article>
	<div :class="$style.tabs">
		<button class="_button" :class="[$style.tab, { [$style.tabActive]: tab === 'replies' }]" @click="tab = 'replies'"><i class="ti ti-arrow-back-up"></i> {{ i18n.ts.replies }}</button>
		<button class="_button" :class="[$style.tab, { [$style.tabActive]: tab === 'renotes' }]" @click="tab = 'renotes'"><i class="ti ti-repeat"></i> {{ i18n.ts.renotes }}</button>
		<button class="_button" :class="[$style.tab, { [$style.tabActive]: tab === 'reactions' }]" @click="tab = 'reactions'"><i class="ti ti-icons"></i> {{ i18n.ts.reactions }}</button>
		<button class="_button" :class="[$style.tab, { [$style.tabActive]: tab === 'history' }]" @click="tab = 'history'"><i class="ti ti-pencil"></i> {{ i18n.ts.edited }}</button>
	</div>
	<div>
		<div v-if="tab === 'replies'" :class="$style.tab_replies">
			<MkPostForm v-if="!note.isHidden && !isMobile && defaultStore.state.showFixedPostFormInReplies" class="post-form _panel" fixed :reply="appearNote"></MkPostForm>
			<MkNoteSub v-for="note in replies" :key="note.id" :note="note" :class="$style.reply" :detail="true"/>
			<div v-if="replies.length > 2 && !repliesLoaded" style="padding: 16px">
				<MkButton style="margin: 0 auto;" primary rounded @click="loadReplies">{{ i18n.ts.loadMore }}</MkButton>
			</div>
		</div>
		<div v-else-if="tab === 'renotes'" :class="$style.tab_renotes">
			<MkPagination :pagination="renotesPagination" :disableAutoLoad="true">
				<template #default="{ items }">
					<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); grid-gap: 12px;">
						<MkA v-for="item in items" :key="item.id" :to="userPage(item.user)">
							<MkUserCardMini :user="item.user" :withChart="false"/>
						</MkA>
					</div>
				</template>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'reactions'" :class="$style.tab_reactions">
			<div :class="$style.reactionTabs">
				<button v-for="reaction in Object.keys(appearNote.reactions)" :key="reaction" :class="[$style.reactionTab, { [$style.reactionTabActive]: reactionTabType === reaction }]" class="_button" @click="reactionTabType = reaction">
					<MkReactionIcon :reaction="reaction"/>
					<span style="margin-left: 4px;">{{ appearNote.reactions[reaction] }}</span>
				</button>
			</div>
			<MkPagination v-if="reactionTabType" :key="reactionTabType" :pagination="reactionsPagination" :disableAutoLoad="true">
				<template #default="{ items }">
					<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); grid-gap: 12px;">
						<MkA v-for="item in items" :key="item.id" :to="userPage(item.user)">
							<MkUserCardMini :user="item.user" :withChart="false"/>
						</MkA>
					</div>
				</template>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'history'" :class="$style.tab_history">
			<div style="display: grid;">
				<div v-for="(text, index) in appearNote.noteEditHistory" :key="text" :class="$style.historyRoot">
					<MkAvatar :class="$style.avatar" :user="appearNote.user" link preview/>
					<div :class="$style.historyMain">
						<div :class="$style.historyHeader">
							<MkUserName :user="appearNote.user" :nowrap="true"/>
							<MkTime :class="$style.updatedAt" :time="appearNote.updatedAtHistory![index]" :mode="defaultStore.state.enableAbsoluteTime ? 'absolute' : 'relative'" colored/>
						</div>
						<div>
							<div>
								<Mfm :text="text.trim()" :author="appearNote.user"/>
							</div>
							<CodeDiff
								:oldString="appearNote.noteEditHistory[index - 1] || ''"
								:newString="text"
								:trim="true"
								:hideHeader="true"
								diffStyle="char"
							/>
						</div>
					</div>
				</div>
				<div v-if="appearNote.noteEditHistory == null" class="_fullinfo">
					<img :src="infoImageUrl" class="_ghost"/>
					<div>{{ i18n.ts.nothing }}</div>
				</div>
			</div>
		</div>
	</div>
</div>
<div v-else class="_panel" :class="$style.muted" @click="muted = false">
	<I18n :src="i18n.ts.userSaysSomething" tag="small">
		<template #name>
			<MkA v-user-preview="appearNote.userId" :to="userPage(appearNote.user)">
				<MkUserName :user="appearNote.user"/>
			</MkA>
		</template>
	</I18n>
</div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, provide, ref, shallowRef } from 'vue';
import * as mfm from 'cherrypick-mfm-js';
import * as Misskey from 'cherrypick-js';
import { CodeDiff } from 'v-code-diff';
import MkNoteSub from '@/components/MkNoteSub.vue';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkReactionsViewer from '@/components/MkReactionsViewer.vue';
import MkMediaList from '@/components/MkMediaList.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkUsersTooltip from '@/components/MkUsersTooltip.vue';
import MkUrlPreview from '@/components/MkUrlPreview.vue';
import MkInstanceTicker from '@/components/MkInstanceTicker.vue';
import MkEvent from '@/components/MkEvent.vue';
import { pleaseLogin } from '@/scripts/please-login.js';
import { checkWordMute } from '@/scripts/check-word-mute.js';
import { userPage } from '@/filters/user.js';
import { notePage } from '@/filters/note.js';
import * as os from '@/os.js';
import * as sound from '@/scripts/sound.js';
import { defaultStore, noteViewInterruptors } from '@/store.js';
import { reactionPicker } from '@/scripts/reaction-picker.js';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm.js';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';
import { getAbuseNoteMenu, getNoteClipMenu, getNoteMenu, getRenoteMenu, getRenoteOnly } from '@/scripts/get-note-menu.js';
import { useNoteCapture } from '@/scripts/use-note-capture.js';
import { deepClone } from '@/scripts/clone.js';
import { useTooltip } from '@/scripts/use-tooltip.js';
import { claimAchievement } from '@/scripts/achievements.js';
import { MenuItem } from '@/types/menu.js';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { showMovedDialog } from '@/scripts/show-moved-dialog.js';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import MkPagination, { Paging } from '@/components/MkPagination.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import MkButton from '@/components/MkButton.vue';
import { miLocalStorage } from '@/local-storage.js';
import { infoImageUrl, instance } from '@/instance.js';
import MkPostForm from '@/components/MkPostFormSimple.vue';
import { deviceKind } from '@/scripts/device-kind.js';
import { vibrate } from '@/scripts/vibrate.js';
import detectLanguage from '@/scripts/detect-language.js';

const MOBILE_THRESHOLD = 500;
const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);

const props = defineProps<{
	note: Misskey.entities.Note;
}>();

const inChannel = inject('inChannel', null);

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
const isDeleted = ref(false);
const muted = ref($i ? checkWordMute(appearNote, $i, $i.mutedWords) : false);
const translation = ref(null);
const translating = ref(false);
const viewTextSource = ref(false);
const noNyaize = ref(false);
const parsed = appearNote.text ? mfm.parse(appearNote.text) : null;
const urls = parsed ? extractUrlFromMfm(parsed) : null;
const showTicker = (defaultStore.state.instanceTicker === 'always') || (defaultStore.state.instanceTicker === 'remote' && appearNote.user.instance);
const conversation = ref<Misskey.entities.Note[]>([]);
const replies = ref<Misskey.entities.Note[]>([]);
const canRenote = computed(() => ['public', 'home'].includes(appearNote.visibility) || appearNote.userId === $i.id);

const keymap = {
	'r': () => reply(true),
	'e|a|plus': () => react(true),
	'q': () => renoteButton.value.renote(true),
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

let tab = $ref('replies');
let reactionTabType = $ref(null);

const renotesPagination = $computed(() => ({
	endpoint: 'notes/renotes',
	limit: 10,
	params: {
		noteId: appearNote.id,
	},
}));

const reactionsPagination = $computed(() => ({
	endpoint: 'notes/reactions',
	limit: 10,
	params: {
		noteId: appearNote.id,
		type: reactionTabType,
	},
}));

useNoteCapture({
	rootEl: el,
	note: $$(appearNote),
	pureNote: $$(note),
	isDeletedRef: isDeleted,
});

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

function renote(viaKeyboard = false) {
	pleaseLogin();
	showMovedDialog();

	const { menu } = getRenoteMenu({ note: note, renoteButton });
	os.popupMenu(menu, renoteButton.value, {
		viaKeyboard,
	});
}

async function renoteOnly() {
	pleaseLogin();
	showMovedDialog();

	await getRenoteOnly({ note: note, renoteButton });
}

function quote(viaKeyboard = false): void {
	pleaseLogin();
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
	showMovedDialog();
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
	os.api('notes/reactions/delete', {
		noteId: note.id,
	});
}

function onContextmenu(ev: MouseEvent): void {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === 'A') return true;
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
		const { menu, cleanup } = getNoteMenu({ note: note, translating, translation, viewTextSource, noNyaize, menuButton, isDeleted });
		os.contextMenu(menu, ev).then(focus).finally(cleanup);
	}
}

function menu(viaKeyboard = false): void {
	const { menu, cleanup } = getNoteMenu({ note: note, translating, translation, viewTextSource, noNyaize, menuButton, isDeleted });
	os.popupMenu(menu, menuButton.value, {
		viaKeyboard,
	}).then(focus).finally(cleanup);
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

	const res = await os.api('notes/translate', {
		noteId: appearNote.id,
		targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
	});
	translating.value = false;
	translation.value = res;

	vibrate(defaultStore.state.vibrateSystem ? [5, 5, 10] : []);
}

async function clip() {
	os.popupMenu(await getNoteClipMenu({ note: note, isDeleted }), clipButton.value).then(focus);
}

function showRenoteMenu(viaKeyboard = false): void {
	if (isMyRenote) {
		pleaseLogin();
		os.popupMenu([{
			text: i18n.ts.unrenote,
			icon: 'ti ti-trash',
			danger: true,
			action: () => {
				os.api('notes/delete', {
					noteId: note.id,
				});
				isDeleted.value = true;
			},
		}], renoteTime.value, {
			viaKeyboard: viaKeyboard,
		});
	} else {
		os.popupMenu([getAbuseNoteMenu(note, i18n.ts.reportAbuseRenote)], renoteTime.value, {
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

function loadRepliesSimple() {
	os.api('notes/children', {
		noteId: appearNote.id,
		limit: 3,
	}).then(res => {
		replies.value = res;
	});
}

const repliesLoaded = ref(false);

function loadReplies() {
	repliesLoaded.value = true;
	os.api('notes/children', {
		noteId: appearNote.id,
		limit: 30,
	}).then(res => {
		replies.value = res;
	});
}

const conversationLoaded = ref(false);

function loadConversation() {
	conversationLoaded.value = true;
	os.api('notes/conversation', {
		noteId: appearNote.replyId,
	}).then(res => {
		conversation.value = res.reverse();
	});
}

onMounted(() => {
	loadRepliesSimple();
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	transition: box-shadow 0.1s ease;
	overflow: clip;
	contain: content;
}

.replyTo {
	opacity: 0.7;
	padding-bottom: 0;
}

.replyToMore {
	opacity: 0.7;
}

.renote {
	display: flex;
	align-items: center;
	padding: 16px 32px 8px 32px;
	line-height: 28px;
	white-space: pre;
	color: var(--renote);
}

.renoteAvatar {
	flex-shrink: 0;
	display: inline-block;
	width: 28px;
	height: 28px;
	margin: 0 8px 0 0;
	border-radius: 6px;
	background: var(--panel);
}

.renoteText {
	overflow: hidden;
	flex-shrink: 1;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.renoteName {
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

.renote + .note {
	padding-top: 8px;
}

.note {
	padding: 32px;
	font-size: 1.2em;

	&:hover > .main > .footer > .button {
		opacity: 1;
	}
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
	width: 58px;
	height: 58px;
	background: var(--panel);
}

.noteHeaderBody {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding-left: 16px;
	font-size: 0.95em;
  max-width: 300px;
}

.noteHeaderName {
	font-weight: bold;
	line-height: 1.3;
	margin: 0 .5em 0 0;
  overflow: scroll;
  overflow-wrap: anywhere;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }

	&:hover {
		color: var(--nameHover);
		text-decoration: none;
	}
}

.isBot {
	display: inline-block;
	margin: 0 0.5em;
	padding: 4px 6px;
	font-size: 80%;
	line-height: 1;
	border: solid 0.5px var(--divider);
	border-radius: 4px;
}

.noteHeaderInfo {
	float: right;
	text-align: right;
}

.noteHeaderUsername {
	margin-bottom: 2px;
	line-height: 1.3;
	word-wrap: anywhere;
  overflow: scroll;
  overflow-wrap: anywhere;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
}

.noteContent {
	container-type: inline-size;
	overflow-wrap: break-word;
}

.cw {
	cursor: default;
	display: block;
	margin: 0;
	padding: 0;
	overflow-wrap: break-word;
}

.noteReplyTarget {
	color: var(--accent);
	margin-right: 0.5em;
}

.rn {
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

.poll {
	font-size: 80%;
}

.quote {
	padding: 16px 0;
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

.noteFooterInfo {
	margin: 16px 0;
	opacity: 0.7;
	font-size: 0.9em;
}

.noteFooterButton {
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

.noteFooterButtonCount {
	display: inline;
	margin: 0 0 0 8px;
	opacity: 0.7;

	&.reacted {
		color: var(--accent);
	}
}

.reply:not(:first-child) {
	border-top: solid 0.5px var(--divider);
}

.tabs {
	border-top: solid 0.5px var(--divider);
	border-bottom: solid 0.5px var(--divider);
	display: flex;
}

.tab {
	flex: 1;
	padding: 12px 8px;
	border-top: solid 2px transparent;
	border-bottom: solid 2px transparent;
}

.tabActive {
	border-bottom: solid 2px var(--accent);
}

.tab_renotes {
	padding: 16px;
}

.tab_reactions {
	padding: 16px;
}

.tab_history {
	padding: 16px;
}
.reactionTabs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	margin-bottom: 8px;
}

.reactionTab {
	padding: 0 12px;
	border: solid 1px var(--divider);
	border-radius: 999px;
	height: 30px;
}

.reactionTabActive {
	background: var(--accentedBg);
	color: var(--accent);
	box-shadow: 0 0 0 1px var(--accent) inset;
}

.time {
	text-decoration: none;

	&:hover {
		text-decoration: none;
	}
}

.danger {
	color: var(--accent);
}

@container (max-width: 500px) {
	.root {
		font-size: 0.9em;
	}

  .noteHeaderBody {
    max-width: 180px;
  }
}

@container (max-width: 480px) {
	.renote {
		padding: 8px 16px 0 16px;
	}

	.note {
		padding: 22px 24px;
	}

	.noteHeaderAvatar {
		width: 50px;
		height: 50px;
	}
}

@container (max-width: 300px) {
	.root {
		font-size: 0.825em;
	}

	.noteHeaderAvatar {
		width: 50px;
		height: 50px;
	}
}

.historyRoot {
	display: flex;
	margin: 0;
	padding: 10px;
	overflow: clip;
	font-size: 0.95em;
}

.historyMain {
	flex: 1;
	min-width: 0;
}

.historyHeader {
	display: flex;
	margin-bottom: 2px;
	font-weight: bold;
	width: 100%;
	overflow: clip;
	text-overflow: ellipsis;
}
.avatar {
	flex-shrink: 0 !important;
	display: block !important;
	margin: 0 10px 0 0 !important;
	width: 40px !important;
	height: 40px !important;
	border-radius: 8px !important;
	pointer-events: none !important;
}

.updatedAt {
	flex-shrink: 0;
	margin-left: auto;
	font-size: 0.9em;
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
}

.badgeRoles {
	margin: 0 .5em 0 0;
}

.badgeRole {
	height: 1.3em;
	vertical-align: -20%;

	& + .badgeRole {
		margin-left: 0.2em;
	}
}
</style>
