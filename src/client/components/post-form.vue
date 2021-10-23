<template>
<div class="gafaadew" :class="{ modal, _popup: modal, isMobile }"
	v-size="{ max: [310, 500] }"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<header>
		<button v-if="!fixed" class="cancel _button" @click="cancel"><i class="fas fa-times"></i></button>
		<div>
			<button class="_button" @click="insert('> ')" v-tooltip="$ts._mfmpad.quote"><i class="fas fa-quote-right"/></button>
			<button class="_button" @click="link" v-tooltip="$ts._mfmpad.link"><i class="fas fa-link"/></button>
			<button class="_button function" @click="insertFunction" v-tooltip="$ts._mfmpad.functions"><code style="font-weight: bold">[]</code></button>
			<button class="_button" @click="insertMention" v-tooltip="$ts.mention"><i class="fas fa-at"></i></button>
			<button class="_button" @click="withHashtags = !withHashtags" :class="{ active: withHashtags }" v-tooltip="$ts.hashtags"><i class="fas fa-hashtag"></i></button>
			<button class="_button" @click="insertEmoji" v-tooltip="$ts.emoji"><i class="fas fa-laugh-squint"></i></button>
			<div class="divider"></div>
			<!-- <button class="_button help" v-tooltip="$ts.help" @click="help"><i class="fas fa-question-circle"/></button> -->
			<span class="local-only" v-if="localOnly"><i class="fas fa-network-wired"></i></span>
			<span class="local-only" v-if="remoteFollowersOnly"><i class="fas fa-heartbeat"></i></span>
			<button class="_button visibility" @click="setVisibility" ref="visibilityButton" v-tooltip="$ts.visibility" :disabled="channel != null">
				<span v-if="visibility === 'public'"><i class="fas fa-globe"></i></span>
				<span v-if="visibility === 'home'"><i class="fas fa-home"></i></span>
				<span v-if="visibility === 'followers'"><i class="fas fa-unlock"></i></span>
				<span v-if="visibility === 'specified'"><i class="fas fa-envelope"></i></span>
			</button>
		</div>
	</header>

	<MkTab v-model="tab" style="display: initial !important;">
		<option value="edit">{{ $ts.edit }}</option>
		<option value="preview">{{ $ts.preview }}</option>
	</MkTab>

	<div class="form" :class="{ fixed }" v-if="tab === 'edit'">
		<XNoteSimple class="preview" v-if="reply" :note="reply"/>
		<XNoteSimple class="preview" v-if="renote" :note="renote"/>
		<div class="with-quote" v-if="quoteId"><i class="fas fa-quote-left"></i> {{ $ts.quoteAttached }}<button @click="quoteId = null"><i class="fas fa-times"></i></button></div>
		<div v-if="visibility === 'specified'" class="to-specified">
			<span style="margin-right: 8px;">{{ $ts.recipient }}</span>
			<div class="visibleUsers">
				<span v-for="u in visibleUsers" :key="u.id">
					<MkAcct :user="u"/>
					<button class="_button" @click="removeVisibleUser(u)"><i class="fas fa-times"></i></button>
				</span>
				<button @click="addVisibleUser" class="_buttonPrimary"><i class="fas fa-plus fa-fw"></i></button>
			</div>
		</div>
		<MkInfo warn v-if="hasNotSpecifiedMentions" class="hasNotSpecifiedMentions">{{ $ts.notSpecifiedMentionWarning }} - <button class="_textButton" @click="addMissingMention()">{{ $ts.add }}</button></MkInfo>
		<input v-show="useCw" ref="cw" class="cw" v-model="cw" :placeholder="$ts.annotation" @keydown="onKeydown">
		<textarea v-model="text" class="text" :class="{ withCw: useCw }" ref="text" :disabled="posting" :placeholder="placeholder" @keydown="onKeydown" @paste="onPaste" @compositionupdate="onCompositionUpdate" @compositionend="onCompositionEnd" data-cy-post-form-text/>
		<input v-show="withHashtags" ref="hashtags" class="hashtags" v-model="hashtags" :placeholder="$ts.hashtags" list="hashtags">
		<div class="text-func">
			<button class="_button" @click="insert('<b></b>')" v-tooltip="$ts._mfm.bold"><i class="fas fa-bold"/></button>
			<button class="_button" @click="insert('<s></s>')" v-tooltip="$ts._mfm.strikethrough"><i class="fas fa-strikethrough"/></button>
			<button class="_button" @click="insert('<small></small>')" v-tooltip="$ts._mfm.small"><i class="fas fa-text-height"/></button>
			<button class="_button" @click="insert('<center></center>')" v-tooltip="$ts._mfm.center"><i class="fas fa-align-center"/></button>
			<button class="_button" @click="insert(' search')" v-tooltip="$ts._mfm.search"><i class="fas fa-search"/></button>
			<button class="_button" @click="insert('`')" v-tooltip="$ts._mfm.inlineCode"><i class="fas fa-code"/></button>
			<button class="_button" @click="insert('```')" v-tooltip="$ts._mfm.blockCode"><i class="fas fa-file-code"/></button>
			<span class="text-count" :class="{ over: textLength > max }">{{ max - textLength }}</span>
		</div>
		<input v-show="useBroadcast" ref="broadcastText" class="broadcastText" v-model="broadcastText" :placeholder="$ts.broadcastTextDescription" @keydown="onKeydown">
		<XPostFormAttaches class="attaches" :files="files" @updated="updateFiles" @detach="detachFile" @changeSensitive="updateFileSensitive" @changeName="updateFileName"/>
		<XPollEditor v-if="poll" :poll="poll" @destroyed="poll = null" @updated="onPollUpdate"/>
		<footer>
			<button :disabled="!currentAccountIsMyself" class="_button" @click="chooseFileFrom" v-tooltip="$ts.attachFile"><i class="fas fa-photo-video"></i></button>
			<button class="_button" @click="togglePoll" :class="{ active: poll }" v-tooltip="$ts.poll"><i class="fas fa-poll-h"></i></button>
			<button class="_button" @click="useCw = !useCw" :class="{ active: useCw }" v-tooltip="$ts.useCw"><i class="fas fa-eye-slash"></i></button>
			<button class="_button" @click="useBroadcast = !useBroadcast" :class="{ active: useBroadcast }" v-tooltip="$ts.broadcastMode"><i class="fas fa-bullhorn"/></button>
			<button class="_button" @click="disableRightClick = !disableRightClick" :class="{ active: disableRightClick }" v-tooltip="$ts.disableRightClick"><i class="fas fa-mouse"></i></button>
			<button class="_button" @click="insertFace" v-tooltip="$ts.gacha"><i class="fas fa-fish"/></button>
			<button v-if="currentAccount && accounts.length > 1" class="_button switch-user" @click="switchUser" v-tooltip="$ts.switchUser">
				<MkAvatar class="avatar" :user="currentAccount" disable-link disable-preview />
			</button>
			<button class="_button" @click="showActions" v-tooltip="$ts.plugin" v-if="postFormActions.length > 0"><i class="fas fa-plug"></i></button>
		</footer>
		<footer>
			<div style="height: 50px;"></div>
			<button class="submit _buttonPrimary" :disabled="!canPost" @click="postAsk" data-cy-open-post-form-submit>{{ submitText }}<i :class="reply ? 'fas fa-reply' : renote ? 'fas fa-quote-right' : 'fas fa-paper-plane'"></i></button>
		</footer>
		<datalist id="hashtags">
			<option v-for="hashtag in recentHashtags" :value="hashtag" :key="hashtag"/>
		</datalist>
	</div>

	<div class="form" v-else-if="tab === 'preview'">
		<XNoteSimple class="preview" :note="previewNote"/>
		<footer>
			<div style="height: 40px;"></div>
			<button class="submit _buttonPrimary" :disabled="!canPost" @click="postAsk" data-cy-open-post-form-submit>{{ submitText }}<i :class="reply ? 'fas fa-reply' : renote ? 'fas fa-quote-right' : 'fas fa-paper-plane'"></i></button>
		</footer>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { toASCII } from 'punycode/';
import XNoteSimple from './note-simple.vue';
import XNotePreview from './note-preview.vue';
import * as mfm from 'mfm-js';
import { host, url } from '@client/config';
import { erase, unique } from '@/prelude/array';
import { extractMentions } from '@/misc/extract-mentions';
import { getAcct } from '@/misc/acct';
import { formatTimeString } from '@/misc/format-time-string';
import { Autocomplete } from '@client/scripts/autocomplete';
import { noteVisibilities } from '@/types';
import * as os from '@client/os';
import { selectFile } from '@client/scripts/select-file';
import { FormItem } from '../scripts/form';
import { defaultStore, notePostInterruptors, postFormActions } from '@client/store';
import { isMobile } from '@client/scripts/is-mobile';
import { throttle } from 'throttle-debounce';
import MkInfo from '@client/components/ui/info.vue';
import MkSwitch from '@client/components/form/switch.vue';
import MkTab from '@client/components/tab-post-form.vue';
import { defaultStore } from '@client/store';
import Preview from "@client/pages/preview.vue";

const MOBILE_THRESHOLD = 600;

export default defineComponent({
	components: {
		XNoteSimple,
		Preview,
		XNotePreview,
		XPostFormAttaches: defineAsyncComponent(() => import('./post-form-attaches.vue')),
		XPollEditor: defineAsyncComponent(() => import('./poll-editor.vue')),
		MkInfo,
		MkSwitch,
		MkTab
	},

	inject: ['modal'],

	props: {
		reply: {
			type: Object,
			required: false
		},
		renote: {
			type: Object,
			required: false
		},
		channel: {
			type: Object,
			required: false
		},
		mention: {
			type: Object,
			required: false
		},
		specified: {
			type: Object,
			required: false
		},
		initialText: {
			type: String,
			required: false
		},
		initialVisibility: {
			type: String,
			required: false
		},
		initialFiles: {
			type: Array,
			required: false
		},
		initialLocalOnly: {
			type: Boolean,
			required: false
		},
		visibleUsers: {
			type: Array,
			required: false,
			default: () => []
		},
		initialNote: {
			type: Object,
			required: false
		},
		share: {
			type: Boolean,
			required: false,
			default: false
		},
		fixed: {
			type: Boolean,
			required: false,
			default: false
		},
		autofocus: {
			type: Boolean,
			required: false,
			default: true
		},
	},

	emits: ['posted', 'cancel', 'esc'],

	data() {
		return {
			posting: false,
			text: '',
			files: [],
			poll: null,
			useCw: false,
			showPreview: false,
			cw: null,
			localOnly: this.$store.state.rememberNoteVisibility ? this.$store.state.localOnly : this.$store.state.defaultNoteLocalOnly,
			remoteFollowersOnly: this.$store.state.rememberNoteVisibility ? this.$store.state.remoteFollowersOnly : this.$store.state.defaultNoteRemoteFollowersOnly,
			visibility: (this.$store.state.rememberNoteVisibility ? this.$store.state.visibility : this.$store.state.defaultNoteVisibility) as typeof noteVisibilities[number],
			visibleUsers: [],
			autocomplete: null,
			draghover: false,
			quoteId: null,
			hasNotSpecifiedMentions: false,
			recentHashtags: JSON.parse(localStorage.getItem('hashtags') || '[]'),
			imeText: '',
			typing: throttle(3000, () => {
				if (this.channel) {
					os.stream.send('typingOnChannel', { channel: this.channel.id });
				}
			}),
			postFormActions,
			currentAccount: {} as Record<string, unknown>,
			currentAccountRegistry: {} as Record<string, unknown>,
			accounts: [] as Record<string, unknown>[],
			accountRegistries: [] as Record<string, unknown>[],
			requiredConfirmation: this.$store.state.confirmBeforePost,
			useBroadcast: false,
			broadcastText: '',
			disableRightClick: false,
			isMobile: window.innerWidth <= MOBILE_THRESHOLD,
			tab: 'edit',
		};
	},

	computed: {
		draftKey(): string {
			let key = this.channel ? `channel:${this.channel.id}` : '';

			if (this.renote) {
				key += `renote:${this.renote.id}`;
			} else if (this.reply) {
				key += `reply:${this.reply.id}`;
			} else {
				key += 'note';
			}

			return key;
		},

		placeholder(): string {
			if (this.renote) {
				return this.$ts._postForm.quotePlaceholder;
			} else if (this.reply) {
				return this.$ts._postForm.replyPlaceholder;
			} else if (this.channel) {
				return this.$ts._postForm.channelPlaceholder;
			} else {
				const xs = [
					this.$ts._postForm._placeholders.a,
					this.$ts._postForm._placeholders.b,
					this.$ts._postForm._placeholders.c,
					this.$ts._postForm._placeholders.d,
					this.$ts._postForm._placeholders.e,
					this.$ts._postForm._placeholders.f
				];
				return xs[Math.floor(Math.random() * xs.length)];
			}
		},

		submitText(): string {
			return this.renote
				? this.$ts.quote
				: this.reply
					? this.$ts.reply
					: this.$ts.note;
		},

		textLength(): number {
			return length((this.text + this.imeText).trim());
		},

		canPost(): boolean {
			return !this.posting &&
				(1 <= this.textLength || 1 <= this.files.length || !!this.poll || !!this.renote) &&
				(this.textLength <= this.max) &&
				(!this.poll || this.poll.choices.length >= 2);
		},

		max(): number {
			return this.$instance ? this.$instance.maxNoteTextLength : 1000;
		},

		withHashtags: defaultStore.makeGetterSetter('postFormWithHashtags'),
		hashtags: defaultStore.makeGetterSetter('postFormHashtags'),

		previewNote() {
			return {
				id: '',
				createdAt: new Date(),
				text: this.text + (this.useBroadcast ? ' ' + this.broadcastText : ''),
				cw: this.useCw ? this.cw : undefined,
				visibility: this.visibility,
				user: this.currentAccount,
				localOnly: this.localOnly,
				remoteFollowersOnly: this.remoteFollowersOnly,
				files: [],
			};
		},

		isPreviewOpened: defaultStore.makeGetterSetter('showPostPreview'),

		currentAccountIsMyself(): boolean {
			return this.$i.id === this.currentAccount.id;
		},
	},

	watch: {
		text() {
			this.checkMissingMention();
		},
		visibleUsers: {
			handler() {
				this.checkMissingMention();
			},
			deep: true
		}
	},

	mounted() {
		this.currentAccount = this.$i;
		os.getAccounts().then(accts => {
			this.accounts = [
				this.currentAccount,
				...accts
			];
		});

		if (this.initialText) {
			this.text = this.initialText;
		}

		if (this.initialVisibility) {
			this.visibility = this.initialVisibility;
		}

		if (this.initialFiles) {
			this.files = this.initialFiles;
		}

		if (typeof this.initialLocalOnly === 'boolean') {
			this.localOnly = this.initialLocalOnly;
		}

		if (this.mention) {
			this.text = this.mention.host ? `@${this.mention.username}@${toASCII(this.mention.host)}` : `@${this.mention.username}`;
			this.text += ' ';
		}

		if (this.reply && this.reply.user.host != null) {
			this.text = `@${this.reply.user.username}@${toASCII(this.reply.user.host)} `;
		}

		if (this.reply && this.reply.text != null) {
			const ast = mfm.parse(this.reply.text);

			for (const x of extractMentions(ast)) {
				const mention = x.host ? `@${x.username}@${toASCII(x.host)}` : `@${x.username}`;

				// 自分は除外
				if (this.$i.username == x.username && x.host == null) continue;
				if (this.$i.username == x.username && x.host == host) continue;

				// 重複は除外
				if (this.text.indexOf(`${mention} `) != -1) continue;

				this.text += `${mention} `;
			}
		}

		if (this.channel) {
			this.visibility = 'public';
			this.localOnly = true; // TODO: チャンネルが連合するようになった折には消す
			this.remoteFollowersOnly = false;
		}

		// 公開以外へのリプライ時は元の公開範囲を引き継ぐ
		if (this.reply && ['home', 'followers', 'specified'].includes(this.reply.visibility)) {
			this.visibility = this.reply.visibility;
			if (this.reply.visibility === 'specified') {
				os.api('users/show', {
					userIds: this.reply.visibleUserIds.filter(uid => uid !== this.$i.id && uid !== this.reply.userId)
				}).then(users => {
					this.visibleUsers.push(...users);
				});

				if (this.reply.userId !== this.$i.id) {
					os.api('users/show', { userId: this.reply.userId }).then(user => {
						this.visibleUsers.push(user);
					});
				}
			}
		}

		if (this.specified) {
			this.visibility = 'specified';
			this.visibleUsers.push(this.specified);
		}

		// keep cw when reply
		if (this.$store.state.keepCw && this.reply && this.reply.cw) {
			this.useCw = true;
			this.cw = this.reply.cw;
		}

		if (this.autofocus) {
			this.focus();

			this.$nextTick(() => {
				this.focus();
			});
		}

		// TODO: detach when unmount
		new Autocomplete(this.$refs.text, this, { model: 'text' });
		new Autocomplete(this.$refs.cw, this, { model: 'cw' });
		new Autocomplete(this.$refs.hashtags, this, { model: 'hashtags' });

		this.$nextTick(() => {
			// 書きかけの投稿を復元
			if (!this.share && !this.mention && !this.specified) {
				const draft = JSON.parse(localStorage.getItem('drafts') || '{}')[this.draftKey];
				if (draft) {
					this.text = draft.data.text;
					this.useCw = draft.data.useCw;
					this.cw = draft.data.cw;
					this.disableRightClick = draft.data.disableRightClick;
					this.useBroadcast = draft.data.useBroadcast;
					this.broadcastText = draft.data.broadcastText;
					this.visibility = draft.data.visibility;
					this.localOnly = draft.data.localOnly;
					this.remoteFollowersOnly = draft.data.remoteFollowersOnly;
					this.files = (draft.data.files || []).filter(e => e);
					if (draft.data.poll) {
						this.poll = draft.data.poll;
					}
				}
			}

			// 削除して編集
			if (this.initialNote) {
				const init = this.initialNote;
				this.text = init.text ? init.text : '';
				this.files = init.files;
				this.cw = init.cw;
				this.useCw = init.cw != null;
				if (init.poll) {
					this.poll = {
						choices: init.poll.choices.map(x => x.text),
						multiple: init.poll.multiple,
						expiresAt: init.poll.expiresAt,
						expiredAfter: init.poll.expiredAfter,
					};
				}
				this.visibility = init.visibility;
				this.localOnly = init.localOnly;
				this.remoteFollowersOnly = init.remoteFollowersOnly;
				this.quoteId = init.renote ? init.renote.id : null;
				this.disableRightClick = init.disableRightClick != null;
			}

			this.$nextTick(() => this.watch());
		});
	},

	methods: {
		watch() {
			this.$watch('text', () => this.saveDraft());
			this.$watch('useCw', () => this.saveDraft());
			this.$watch('cw', () => this.saveDraft());
			this.$watch('disableRightClick', () => this.saveDraft());
			this.$watch('useBroadcast', this.saveDraft);
			this.$watch('broadcastText', this.saveDraft);
			this.$watch('poll', () => this.saveDraft());
			this.$watch('files', () => this.saveDraft(), { deep: true });
			this.$watch('visibility', () => this.saveDraft());
			this.$watch('localOnly', () => this.saveDraft());
			this.$watch('remoteFollowersOnly', this.saveDraft);
		},

		checkMissingMention() {
			if (this.visibility === 'specified') {
				const ast = mfm.parse(this.text);

				for (const x of extractMentions(ast)) {
					if (!this.visibleUsers.some(u => (u.username === x.username) && (u.host == x.host))) {
						this.hasNotSpecifiedMentions = true;
						return;
					}
				}
				this.hasNotSpecifiedMentions = false;
			}
		},

		addMissingMention() {
			const ast = mfm.parse(this.text);

			for (const x of extractMentions(ast)) {
				if (!this.visibleUsers.some(u => (u.username === x.username) && (u.host == x.host))) {
					os.api('users/show', { username: x.username, host: x.host }).then(user => {
						this.visibleUsers.push(user);
					});
				}
			}
		},

		togglePoll() {
			if (this.poll) {
				this.poll = null;
			} else {
				this.poll = {
					choices: ['', ''],
					multiple: false,
					expiresAt: null,
					expiredAfter: null,
				};
			}
		},

		addTag(tag: string) {
			insertTextAtCursor(this.$refs.text, ` #${tag} `);
		},

		focus() {
			(this.$refs.text as any).focus();
		},

		chooseFileFrom(ev) {
			selectFile(ev.currentTarget || ev.target, this.$ts.attachFile, true).then(files => {
				for (const file of files) {
					this.files.push(file);
				}
			});
		},

		detachFile(id) {
			this.files = this.files.filter(x => x.id != id);
		},

		updateFiles(files) {
			this.files = files;
		},

		updateFileSensitive(file, sensitive) {
			this.files[this.files.findIndex(x => x.id === file.id)].isSensitive = sensitive;
		},

		updateFileName(file, name) {
			this.files[this.files.findIndex(x => x.id === file.id)].name = name;
		},

		upload(file: File, name?: string) {
			os.upload(file, this.$store.state.uploadFolder, name).then(res => {
				this.files.push(res);
			});
		},

		onPollUpdate(poll) {
			this.poll = poll;
			this.saveDraft();
		},

		setVisibility() {
			if (this.channel) {
				// TODO: information dialog
				return;
			}

			os.popup(import('./visibility-picker.vue'), {
				currentVisibility: this.visibility,
				currentLocalOnly: this.localOnly,
				currentRemoteFollowersOnly: this.remoteFollowersOnly,
				src: this.$refs.visibilityButton
			}, {
				changeVisibility: visibility => {
					this.visibility = visibility;
					if (this.$store.state.rememberNoteVisibility) {
						this.$store.set('visibility', visibility);
					}
				},
				changeLocalOnly: localOnly => {
					this.localOnly = localOnly;
					if (this.$store.state.rememberNoteVisibility) {
						this.$store.set('localOnly', localOnly);
					}
				},
				changeRemoteFollowersOnly: remoteFollowersOnly => {
					this.remoteFollowersOnly = remoteFollowersOnly;
					if (this.$store.state.rememberNoteVisibility) {
						this.$store.set('remoteFollowersOnly', remoteFollowersOnly);
					}
				}
			}, 'closed');
		},

		addVisibleUser() {
			os.selectUser().then(user => {
				this.visibleUsers.push(user);
			});
		},

		removeVisibleUser(user) {
			this.visibleUsers = erase(user, this.visibleUsers);
		},

		clear() {
			this.text = '';
			this.files = [];
			this.poll = null;
			this.quoteId = null;
		},

		help() {
			this.cancel();
			this.$router.push('/docs/post')
		},

		onKeydown(e: KeyboardEvent) {
			if ((e.which === 10 || e.which === 13) && (e.ctrlKey || e.metaKey) && this.canPost) this.post();
			if (e.which === 27) this.$emit('esc');
			this.typing();
		},

		onCompositionUpdate(e: CompositionEvent) {
			this.imeText = e.data;
			this.typing();
		},

		onCompositionEnd(e: CompositionEvent) {
			this.imeText = '';
		},

		async onPaste(e: ClipboardEvent) {
			for (const { item, i } of Array.from(e.clipboardData.items).map((item, i) => ({item, i}))) {
				if (item.kind == 'file') {
					const file = item.getAsFile();
					const lio = file.name.lastIndexOf('.');
					const ext = lio >= 0 ? file.name.slice(lio) : '';
					const formatted = `${formatTimeString(new Date(file.lastModified), this.$store.state.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
					this.upload(file, formatted);
				}
			}

			const paste = e.clipboardData.getData('text');

			if (!this.renote && !this.quoteId && paste.startsWith(url + '/notes/')) {
				e.preventDefault();

				os.dialog({
					type: 'info',
					text: this.$ts.quoteQuestion,
					showCancelButton: true
				}).then(({ canceled }) => {
					if (canceled) {
						insertTextAtCursor(this.$refs.text, paste);
						return;
					}

					this.quoteId = paste.substr(url.length).match(/^\/notes\/(.+?)\/?$/)[1];
				});
			}
		},

		onDragover(e) {
			if (!e.dataTransfer.items[0]) return;
			const isFile = e.dataTransfer.items[0].kind == 'file';
			const isDriveFile = e.dataTransfer.types[0] == _DATA_TRANSFER_DRIVE_FILE_;
			if (isFile || isDriveFile) {
				e.preventDefault();
				this.draghover = true;
				e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed == 'all' ? 'copy' : 'move';
			}
		},

		onDragenter(e) {
			this.draghover = true;
		},

		onDragleave(e) {
			this.draghover = false;
		},

		onDrop(e): void {
			this.draghover = false;

			// ファイルだったら
			if (e.dataTransfer.files.length > 0) {
				e.preventDefault();
				for (const x of Array.from(e.dataTransfer.files)) this.upload(x);
				return;
			}

			//#region ドライブのファイル
			const driveFile = e.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
			if (driveFile != null && driveFile != '') {
				const file = JSON.parse(driveFile);
				this.files.push(file);
				e.preventDefault();
			}
			//#endregion
		},

		saveDraft() {
			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			data[this.draftKey] = {
				updatedAt: new Date(),
				data: {
					text: this.text,
					useCw: this.useCw,
					cw: this.cw,
					disableRightClick: this.disableRightClick,
					useBroadcast: this.useBroadcast,
					broadcastText: this.broadcastText,
					visibility: this.visibility,
					localOnly: this.localOnly,
					remoteFollowersOnly: this.remoteFollowersOnly,
					files: this.files,
					poll: this.poll
				}
			};

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		deleteDraft() {
			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			delete data[this.draftKey];

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		async postAsk() {
			if (this.requiredConfirmation) {
				const { canceled } = await os.dialog({
					type: 'info',
					text: this.$ts.confirmBeforePostLabel,
					showCancelButton: true
				});
				if (canceled) return;
				await this.post();
			} else {
				await this.post()
			}
		},

		async post() {
			let data = {
				text: this.text == '' ? undefined : this.text + (this.useBroadcast ? ' ' + this.broadcastText : ''),
				fileIds: this.files.length > 0 ? this.files.map(f => f.id) : undefined,
				replyId: this.reply ? this.reply.id : undefined,
				renoteId: this.renote ? this.renote.id : this.quoteId ? this.quoteId : undefined,
				channelId: this.channel ? this.channel.id : undefined,
				poll: this.poll,
				cw: this.useCw ? this.cw || '' : undefined,
				localOnly: this.localOnly,
				remoteFollowersOnly: this.remoteFollowersOnly,
				visibility: this.visibility,
				visibleUserIds: this.visibility == 'specified' ? this.visibleUsers.map(u => u.id) : undefined,
				viaMobile: isMobile,
				disableRightClick: this.disableRightClick,
			};

			if (this.withHashtags && this.hashtags && this.hashtags.trim() !== '') {
				const hashtags = this.hashtags.trim().split(' ').map(x => x.startsWith('#') ? x : '#' + x).join(' ');
				data.text = data.text ? `${data.text} ${hashtags}` : hashtags;
			}

			// plugin
			if (notePostInterruptors.length > 0) {
				for (const interruptor of notePostInterruptors) {
					data = await interruptor.handler(JSON.parse(JSON.stringify(data)));
				}
			}

			this.posting = true;
			os.api('notes/create', data).then(() => {
				this.clear();
				this.$nextTick(() => {
					this.deleteDraft();
					this.$emit('posted');
					if (data.text && data.text != '') {
						const hashtags = mfm.parse(data.text).filter(x => x.type === 'hashtag').map(x => x.props.hashtag);
						const history = JSON.parse(localStorage.getItem('hashtags') || '[]') as string[];
						localStorage.setItem('hashtags', JSON.stringify(unique(hashtags.concat(history))));
					}
					this.posting = false;
				});
			}).catch(err => {
				this.posting = false;
				os.dialog({
					type: 'error',
					text: err.message + '\n' + (err as any).id,
				});
			});
		},

		cancel() {
			this.$emit('cancel');
		},

		insertFace() {
			const faces = this.$store.state.faces;
			this.insert(faces.length > 0 ? faces[Math.floor(Math.random() * faces.length)] : '');
		},

		insertMention() {
			os.selectUser().then(user => {
				insertTextAtCursor(this.$refs.text, '@' + getAcct(user) + ' ');
			});
		},

		async insertEmoji(ev) {
			// os.openEmojiPicker(ev.currentTarget || ev.target, {}, this.$refs.text);
			os.pickEmoji(ev.currentTarget || ev.target).then(emoji => {
				this.insert(emoji);
			});
		},

		insert(text: string) {
			insertTextAtCursor(this.$refs.text, text);
		},

		async link() {
			const form: Record<string, FormItem> = {
				url: {
					type: 'string',
					default: 'https://',
					label: 'URL',
				},
				desc: {
					type: 'string',
					default: '',
					label: this.$ts.description.toString(),
				},
				noUrlPreview: {
					type: 'boolean',
					default: false,
					label: this.$ts._mfmpad.noUrlPreview.toString(),
					description: this.$ts._mfmpad.noUrlPreviewDesc.toString(),
				},
			};
			const { canceled, result } = await os.form(this.$ts._mfmpad.setInsertLink, form);
			if (canceled) return;
			this.insert(`${result.noUrlPreview ? '?' : ''}[${result.desc}](${result.url})`);
		},

		async switchUser(ev) {
			const accountItems = this.accounts.map(account => ({
				type: 'user',
				user: account,
				action: () => {
					this.currentAccount = account;
					if (this.currentAccountIsMyself) {
						this.requiredConfirmation = this.$store.state.confirmBeforePost;
					} else {
						os.api('i/registry/get-all', {
							scope: ['client', 'base'],
						}, this.currentAccount.token)
							.then((dat) => this.requiredConfirmation = dat.confirmBeforePost);
					}

				},
			}));

			os.popupMenu(accountItems, ev.currentTarget || ev.target, { align: 'left' });
		},

		showActions(ev) {
			os.popupMenu(postFormActions.map(action => ({
				text: action.title,
				action: () => {
					action.handler({
						text: this.text
					}, (key, value) => {
						if (key === 'text') { this.text = value; }
					});
				}
			})), ev.currentTarget || ev.target);
		},

		insertFunction() {
			os.popup(import('./function-builder-window.vue'), {
			}, { done: this.insert }, 'closed');
		},
	}
});
</script>

<style lang="scss" scoped>
.gafaadew {
	position: relative;

	&.modal {
		width: 100%;
		max-width: 520px;
	}

	&.isMobile {
		margin: initial !important;
		padding: initial !important;
		border-radius: initial !important;
	}

	> header {
		z-index: 1000;
		height: 66px;
		position: relative;

		> .cancel {
			padding: 0;
			font-size: 20px;
			width: 64px;
			line-height: 66px;
		}

		> div {
			display: flex;
			position: absolute;
			top: 0;
			right: 0;
			padding-right: 8px;
			height: 100%;

			> button {
				font-size: 16px;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 8px;
				margin: auto 0;
				width: 32px;
				height: 32px;
				border-radius: 4px;

				&:hover {
					background: var(--X5);
				}

				&.active {
					color: var(--accent);
				}

				&:not(:last-child) {
					margin-right: 4px;
				}

				&:nth-child(6) {
					margin-right: 0;
				}
			}

			> .spacer {
				width: 8px;
			}

			> .divider {
				height: 32px;
				width: 1px;
				margin: auto 8px;
				background: var(--divider);
			}

			> .visibility {
				min-width: 32px;
				width: auto;

				& + .localOnly {
					margin-left: 8px;
				}
			}

			> .local-only {
				display: flex;
				align-items: center;
				padding: 5px 10px 5px 5px;
				margin: auto 0;
				opacity: 0.7;
			}
		}
	}

	> .form {
		margin-top: 16px;

		> .preview {
			padding: 16px;
		}

		> .with-quote {
			margin: 0 0 8px 0;
			color: var(--accent);

			> button {
				padding: 4px 8px;
				color: var(--accentAlpha04);

				&:hover {
					color: var(--accentAlpha06);
				}

				&:active {
					color: var(--accentDarken30);
				}
			}
		}

		> .to-specified {
			padding: 6px 24px;
			margin-bottom: 8px;
			overflow: auto;
			white-space: nowrap;

			> .visibleUsers {
				display: inline;
				top: -1px;
				font-size: 14px;

				> button {
					padding: 4px;
					border-radius: 8px;
				}

				> span {
					margin-right: 14px;
					padding: 8px 0 8px 8px;
					border-radius: 8px;
					background: var(--X4);

					> button {
						padding: 4px 8px;
					}
				}
			}
		}

		> .hasNotSpecifiedMentions {
			margin: 0 20px 16px 20px;
		}

		> .cw,
		> .hashtags,
		> .text,
		> .broadcastText {
			display: block;
			box-sizing: border-box;
			padding: 0 24px;
			margin: 0;
			width: 100%;
			font-size: 16px;
			border: none;
			border-radius: 0;
			background: transparent;
			color: var(--fg);
			font-family: inherit;

			&:focus-visible {
				outline: none;
			}

			&:disabled {
				opacity: 0.5;
			}
		}

		> .cw {
			z-index: 1;
			padding-bottom: 8px;
			border-bottom: solid 0.5px var(--divider);
		}

		> .broadcastText {
			z-index: 1;
			padding: 8px 24px;
			border-bottom: solid 1px var(--divider);
		}

		> .hashtags {
			z-index: 1;
			padding-top: 8px;
			padding-bottom: 8px;
			border-top: solid 0.5px var(--divider);
		}

		> .text {
			max-width: 100%;
			min-width: 100%;
			min-height: 90px;

			&.withCw {
				padding-top: 8px;
			}
		}

		> .text-func {
			display: flex;
			position: relative;
			padding: 0 16px;
			border-top: .5px solid var(--divider);
			align-items: center;

			> button {
				font-size: 14px;
				justify-content: center;
				align-items: center;
				width: 32px;
				height: 32px;
				border-radius: 4px;

				&:hover {
					background: var(--X5);
				}
			}

			> .spacer {
				width: 8px;
			}

			> .divider {
				height: 32px;
				width: 1px;
				margin: auto 8px;
				background: var(--divider);
			}

			> .text-count {
				margin: 0 5px 0 auto;
				opacity: 0.7;
				line-height: 50px;
			}
		}

		> footer {
			display: flex;
			padding: 0 16px;
			align-items: center;

			> .switch-user {
				> .avatar {
					width: 24px;
					height: 24px;
				}
			}

			> button {
				display: block;
				padding: 0;
				margin: 0;
				font-size: 16px;
				width: 32px;
				height: 32px;
				border-radius: 4px;

				&:not(:first-child) {
					margin-left: 8px;
				}

				&:hover {
					background: var(--X5);
				}

				&.active {
					color: var(--accent);
				}
			}

			> .submit {
				padding: 0 16px;
				font-weight: bold;
				border-radius: 999px;
				width: auto;
				position: absolute;
				right: 15px;
				bottom: 15px;

				&:disabled {
					opacity: 0.7;
				}

				&:hover {
					background: var(--accentLighten);
				}

				@media (max-width: 600px) {
					bottom: initial;
				}

				> i {
					margin-left: 6px;
				}
			}
		}
	}

	&.max-width_500px {
		> header {
			height: 50px;

			> .cancel {
				width: 50px;
				line-height: 50px;
			}

			> div {
				> .text-count {
					line-height: 50px;
				}

				> .submit {
					margin: 8px;
				}
			}
		}

		> .form {
			> .to-specified {
				padding: 6px 16px;
			}

			> .cw,
			> .hashtags,
			> .text {
				padding: 0 16px;
			}

			> .hashtags {
				padding: 8px 16px;
			}

			> .text {
				min-height: 80px;
			}

			> footer {
				padding: 0 8px 8px 8px;
			}
		}
	}

	&.max-width_310px {
		> .form {
			> footer {
				> button {
					font-size: 14px;
					width: 44px;
				height: 44px;
				}
			}
		}
	}
}
</style>
