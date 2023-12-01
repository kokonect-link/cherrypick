/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import { miLocalStorage } from './local-storage.js';
import type { SoundType } from '@/scripts/sound.js';
import { Storage } from '@/pizzax.js';

interface PostFormAction {
	title: string,
	handler: <T>(form: T, update: (key: unknown, value: unknown) => void) => void;
}

interface UserAction {
	title: string,
	handler: (user: Misskey.entities.UserDetailed) => void;
}

interface NoteAction {
	title: string,
	handler: (note: Misskey.entities.Note) => void;
}

interface NoteViewInterruptor {
	handler: (note: Misskey.entities.Note) => unknown;
}

interface NotePostInterruptor {
	handler: (note: FIXME) => unknown;
}

interface PageViewInterruptor {
	handler: (page: Misskey.entities.Page) => unknown;
}

/** サウンド設定 */
export type SoundStore = {
	type: Exclude<SoundType, '_driveFile_'>;
	volume: number;
} | {
	type: '_driveFile_';

	/** ドライブのファイルID */
	fileId: string;

	/** ファイルURL（こちらが優先される） */
	fileUrl: string;

	volume: number;
}

export const postFormActions: PostFormAction[] = [];
export const userActions: UserAction[] = [];
export const noteActions: NoteAction[] = [];
export const noteViewInterruptors: NoteViewInterruptor[] = [];
export const notePostInterruptors: NotePostInterruptor[] = [];
export const pageViewInterruptors: PageViewInterruptor[] = [];

// TODO: それぞれいちいちwhereとかdefaultというキーを付けなきゃいけないの冗長なのでなんとかする(ただ型定義が面倒になりそう)
//       あと、現行の定義の仕方なら「whereが何であるかに関わらずキー名の重複不可」という制約を付けられるメリットもあるからそのメリットを引き継ぐ方法も考えないといけない
export const defaultStore = markRaw(new Storage('base', {
	accountSetupWizard: {
		where: 'account',
		default: 0,
	},
	timelineTutorials: {
		where: 'account',
		default: {
			home: false,
			local: false,
			social: false,
			global: false,
		},
	},
	keepCw: {
		where: 'account',
		default: true,
	},
	showFullAcct: {
		where: 'account',
		default: false,
	},
	collapseRenotes: {
		where: 'account',
		default: true,
	},
	rememberNoteVisibility: {
		where: 'account',
		default: false,
	},
	defaultNoteVisibility: {
		where: 'account',
		default: 'public',
	},
	defaultNoteLocalOnly: {
		where: 'account',
		default: false,
	},
	uploadFolder: {
		where: 'account',
		default: null as string | null,
	},
	pastedFileName: {
		where: 'account',
		default: 'yyyy-MM-dd HH-mm-ss [{{number}}]',
	},
	keepOriginalUploading: {
		where: 'account',
		default: false,
	},
	imageCompressionMode: {
		where: 'account',
		default: 'resizeCompressLossy' as 'resizeCompress' | 'noResizeCompress' | 'resizeCompressLossy' | 'noResizeCompressLossy' | null,
	},
	memo: {
		where: 'account',
		default: null,
	},
	reactions: {
		where: 'account',
		default: ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮'],
	},
	reactionAcceptance: {
		where: 'account',
		default: null as 'likeOnly' | 'likeOnlyForRemote' | 'nonSensitiveOnly' | 'nonSensitiveOnlyForLocalLikeOnlyForRemote' | null,
	},
	mutedAds: {
		where: 'account',
		default: [] as string[],
	},

	menu: {
		where: 'deviceAccount',
		default: [
			'notifications',
			'messaging',
			'favorites',
			'followRequests',
			'explore',
			'search',
			'announcements',
		],
	},
	visibility: {
		where: 'deviceAccount',
		default: 'public' as 'public' | 'home' | 'followers' | 'specified',
	},
	localOnly: {
		where: 'deviceAccount',
		default: false,
	},
	showPreview: {
		where: 'device',
		default: false,
	},
	showPreviewInReplies: {
		where: 'device',
		default: false,
	},
	showProfilePreview: {
		where: 'device',
		default: true,
	},
	statusbars: {
		where: 'deviceAccount',
		default: [] as {
			name: string;
			id: string;
			type: string;
			size: 'verySmall' | 'small' | 'medium' | 'large' | 'veryLarge';
			black: boolean;
			props: Record<string, any>;
		}[],
	},
	widgets: {
		where: 'account',
		default: [] as {
			name: string;
			id: string;
			place: string | null;
			data: Record<string, any>;
		}[],
	},
	tl: {
		where: 'deviceAccount',
		default: {
			src: 'home' as 'home' | 'local' | 'social' | 'global' | `list:${string}`,
			userList: null as Misskey.entities.UserList | null,
		},
	},
	pinnedUserLists: {
		where: 'deviceAccount',
		default: [] as Misskey.entities.UserList[],
	},

	overridedDeviceKind: {
		where: 'device',
		default: null as null | 'smartphone' | 'tablet' | 'desktop',
	},
	serverDisconnectedBehavior: {
		where: 'device',
		default: 'quiet' as 'quiet' | 'reload' | 'dialog' | 'none',
	},
	nsfw: {
		where: 'device',
		default: 'respect' as 'respect' | 'force' | 'ignore',
	},
	highlightSensitiveMedia: {
		where: 'device',
		default: false,
	},
	animation: {
		where: 'device',
		default: !window.matchMedia('(prefers-reduced-motion)').matches,
	},
	animatedMfm: {
		where: 'device',
		default: true,
	},
	advancedMfm: {
		where: 'device',
		default: true,
	},
	loadRawImages: {
		where: 'device',
		default: false,
	},
	imageNewTab: {
		where: 'device',
		default: false,
	},
	disableShowingAnimatedImages: {
		where: 'device',
		default: window.matchMedia('(prefers-reduced-motion)').matches,
	},
	showingAnimatedImages: {
		where: 'device',
		default: /mobile|iphone|android/.test(navigator.userAgent.toLowerCase()) ? 'inactive' : 'always' as 'always' | 'interaction' | 'inactive',
	},
	emojiStyle: {
		where: 'device',
		default: 'twemoji', // twemoji / fluentEmoji / native
	},
	disableDrawer: {
		where: 'device',
		default: false,
	},
	useBlurEffectForModal: {
		where: 'device',
		default: !/mobile|iphone|android/.test(navigator.userAgent.toLowerCase()), // 循環参照するのでdevice-kind.tsは参照できない
	},
	useBlurEffect: {
		where: 'device',
		default: !/mobile|iphone|android/.test(navigator.userAgent.toLowerCase()), // 循環参照するのでdevice-kind.tsは参照できない
	},
	removeModalBgColorForBlur: {
		where: 'device',
		default: !/mobile|iphone|android/.test(navigator.userAgent.toLowerCase()), // 循環参照するのでdevice-kind.tsは参照できない
	},
	showFixedPostForm: {
		where: 'device',
		default: false,
	},
	showFixedPostFormInChannel: {
		where: 'device',
		default: false,
	},
	enableInfiniteScroll: {
		where: 'device',
		default: true,
	},
	useReactionPickerForContextMenu: {
		where: 'device',
		default: false,
	},
	showGapBetweenNotesInTimeline: {
		where: 'device',
		default: true,
	},
	darkMode: {
		where: 'device',
		default: false,
	},
	instanceTicker: {
		where: 'device',
		default: 'remote' as 'always' | 'remote' | 'none',
	},
	reactionPickerSize: {
		where: 'device',
		default: 3,
	},
	reactionPickerWidth: {
		where: 'device',
		default: 2,
	},
	reactionPickerHeight: {
		where: 'device',
		default: 3,
	},
	reactionPickerUseDrawerForMobile: {
		where: 'device',
		default: true,
	},
	recentlyUsedEmojis: {
		where: 'device',
		default: [] as string[],
	},
	recentlyUsedUsers: {
		where: 'device',
		default: [] as string[],
	},
	defaultSideView: {
		where: 'device',
		default: false,
	},
	menuDisplay: {
		where: 'device',
		default: 'sideFull' as 'sideFull' | 'sideIcon' | 'top',
	},
	reportError: {
		where: 'device',
		default: false,
	},
	squareAvatars: {
		where: 'device',
		default: true,
	},
	showAvatarDecorations: {
		where: 'device',
		default: true,
	},
	postFormWithHashtags: {
		where: 'device',
		default: false,
	},
	postFormHashtags: {
		where: 'device',
		default: '',
	},
	themeInitial: {
		where: 'device',
		default: true,
	},
	numberOfPageCache: {
		where: 'device',
		default: 3,
	},
	showNoteActionsOnlyHover: {
		where: 'device',
		default: false,
	},
	showClipButtonInNoteFooter: {
		where: 'device',
		default: false,
	},
	reactionsDisplaySize: {
		where: 'device',
		default: 'small' as 'small' | 'medium' | 'large',
	},
	limitWidthOfReaction: {
		where: 'device',
		default: true,
	},
	forceShowAds: {
		where: 'device',
		default: true,
	},
	aiChanMode: {
		where: 'device',
		default: false,
	},
	devMode: {
		where: 'device',
		default: false,
	},
	mediaListWithOneImageAppearance: {
		where: 'device',
		default: 'expand' as 'expand' | '16_9' | '1_1' | '2_3',
	},
	notificationPosition: {
		where: 'device',
		default: 'rightBottom' as 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom',
	},
	notificationStackAxis: {
		where: 'device',
		default: 'vertical' as 'vertical' | 'horizontal',
	},
	enableCondensedLineForAcct: {
		where: 'device',
		default: false,
	},
	additionalUnicodeEmojiIndexes: {
		where: 'device',
		default: {} as Record<string, Record<string, string[]>>,
	},
	keepScreenOn: {
		where: 'device',
		default: false,
	},
	tlWithReplies: {
		where: 'device',
		default: false,
	},
	defaultWithReplies: {
		where: 'account',
		default: true,
	},
	disableStreamingTimeline: {
		where: 'device',
		default: false,
	},
	useGroupedNotifications: {
		where: 'device',
		default: true,
	},
	showUnreadNotificationsCount: {
		where: 'deviceAccount',
		default: false,
	},
	dataSaver: {
		where: 'device',
		default: {
			media: false,
			avatar: false,
			urlPreview: false,
			code: false,
		} as Record<string, boolean>,
	},

	sound_masterVolume: {
		where: 'device',
		default: 0.3,
	},
	sound_notUseSound: {
		where: 'device',
		default: false,
	},
	sound_useSoundOnlyWhenActive: {
		where: 'device',
		default: false,
	},
	sound_note: {
		where: 'device',
		default: { type: 'syuilo/n-aec', volume: 1 } as SoundStore,
	},
	sound_noteMy: {
		where: 'device',
		default: { type: 'syuilo/n-cea-4va', volume: 1 } as SoundStore,
	},
	sound_noteEdited: {
		where: 'device',
		default: { type: 'syuilo/n-eca', volume: 1 } as SoundStore,
	},
	sound_notification: {
		where: 'device',
		default: { type: 'syuilo/n-ea', volume: 1 } as SoundStore,
	},
	sound_chat: {
		where: 'device',
		default: { type: 'syuilo/pope1', volume: 1 } as SoundStore,
	},
	sound_chatBg: {
		where: 'device',
		default: { type: 'syuilo/waon', volume: 1 } as SoundStore,
	},
	sound_antenna: {
		where: 'device',
		default: { type: 'syuilo/triple', volume: 1 } as SoundStore,
	},
	sound_channel: {
		where: 'device',
		default: { type: 'syuilo/square-pico', volume: 1 } as SoundStore,
	},
	sound_reaction: {
		where: 'device',
		default: { type: 'syuilo/bubble2', volume: 1 } as SoundStore,
	},

	// #region CherryPick
	// - Settings/General
	newNoteReceivedNotificationBehavior: {
		where: 'device',
		default: 'count' as 'default' | 'count' | 'none',
	},
	fontSize: {
		where: 'device',
		default: 8,
	},
	collapseDefault: {
		where: 'account',
		default: true,
	},
	requireRefreshBehavior: {
		where: 'device',
		default: 'dialog' as 'quiet' | 'dialog',
	},
	bannerDisplay: {
		where: 'device',
		default: 'topBottom' as 'all' | 'topBottom' | 'top' | 'bottom' | 'bg' | 'hide',
	},
	hideAvatarsInNote: {
		where: 'device',
		default: false,
	},
	showTranslateButtonInNote: {
		where: 'device',
		default: true,
	},
	enableAbsoluteTime: {
		where: 'device',
		default: false,
	},
	enableMarkByDate: {
		where: 'device',
		default: false,
	},
	showSubNoteFooterButton: {
		where: 'device',
		default: true,
	},
	infoButtonForNoteActionsEnabled: {
		where: 'account',
		default: true,
	},
	showReplyInNotification: {
		where: 'device',
		default: false,
	},
	renoteQuoteButtonSeparation: {
		where: 'device',
		default: true,
	},
	showFixedPostFormInReplies: {
		where: 'device',
		default: true,
	},
	allMediaNoteCollapse: {
		where: 'device',
		default: false,
	},
	nsfwOpenBehavior: {
		where: 'device',
		default: 'click' as 'click' | 'doubleClick',
	},

	// - Settings/Timeline
	enableHomeTimeline: {
		where: 'device',
		default: true,
	},
	enableLocalTimeline: {
		where: 'device',
		default: true,
	},
	enableSocialTimeline: {
		where: 'device',
		default: true,
	},
	enableGlobalTimeline: {
		where: 'device',
		default: true,
	},
	enableListTimeline: {
		where: 'device',
		default: true,
	},
	enableAntennaTimeline: {
		where: 'device',
		default: true,
	},
	enableChannelTimeline: {
		where: 'device',
		default: true,
	},

	// - Settings/Sounds & Vibrations
	vibrate: {
		where: 'device',
		default: !/ipad|iphone/.test(navigator.userAgent.toLowerCase()) && window.navigator.vibrate,
	},
	vibrateNote: {
		where: 'device',
		default: true,
	},
	vibrateNotification: {
		where: 'device',
		default: true,
	},
	vibrateChat: {
		where: 'device',
		default: true,
	},
	vibrateChatBg: {
		where: 'device',
		default: true,
	},
	vibrateSystem: {
		where: 'device',
		default: true,
	},

	// - Settings/CherryPick
	nicknameEnabled: {
		where: 'account',
		default: true,
	},
	nicknameMap: {
		where: 'account',
		default: {} as Record<string, string>,
	},
	useEnterToSend: {
		where: 'device',
		default: false,
	},
	postFormVisibilityHotkey: {
		where: 'device',
		default: true,
	},
	showRenoteConfirmPopup: {
		where: 'device',
		default: true,
	},
	expandOnNoteClick: {
		where: 'device',
		default: true,
	},
	displayHeaderNavBarWhenScroll: {
		where: 'device',
		default: 'hideHeaderFloatBtn' as 'all' | 'hideHeaderOnly' | 'hideHeaderFloatBtn' | 'hideFloatBtnOnly' | 'hideFloatBtnNavBar' | 'hide',
	},
	reactableRemoteReactionEnabled: {
		where: 'account',
		default: true,
	},
	showFollowingMessageInsteadOfButtonEnabled: {
		where: 'account',
		default: true,
	},
	mobileHeaderChange: {
		where: 'device',
		default: false,
	},
	renameTheButtonInPostFormToNya: {
		where: 'account',
		default: false,
	},
	renameTheButtonInPostFormToNyaManualSet: {
		where: 'account',
		default: false,
	},
	enableLongPressOpenAccountMenu: {
		where: 'device',
		default: true,
	},
	friendlyShowAvatarDecorationsInNavBtn: {
		where: 'device',
		default: false,
	},

	// - etc
	friendlyEnableNotifications: {
		where: 'device',
		default: true,
	},
	friendlyEnableWidgets: {
		where: 'device',
		default: true,
	},
	// #endregion
}));

// TODO: 他のタブと永続化されたstateを同期

const PREFIX = 'miux:' as const;

export type Plugin = {
	id: string;
	name: string;
	active: boolean;
	config?: Record<string, { default: any }>;
	configData: Record<string, any>;
	token: string;
	src: string | null;
	version: string;
	ast: any[];
	author?: string;
	description?: string;
	permissions?: string[];
};

interface Watcher {
	key: string;
	callback: (value: unknown) => void;
}

/**
 * 常にメモリにロードしておく必要がないような設定情報を保管するストレージ(非リアクティブ)
 */
import lightTheme from '@/themes/l-cherrypick.json5';
import darkTheme from '@/themes/d-cherrypick.json5';

export class ColdDeviceStorage {
	public static default = {
		lightTheme,
		darkTheme,
		syncDeviceDarkMode: true,
		plugins: [] as Plugin[],
	};

	public static watchers: Watcher[] = [];

	public static get<T extends keyof typeof ColdDeviceStorage.default>(key: T): typeof ColdDeviceStorage.default[T] {
		// TODO: indexedDBにする
		//       ただしその際はnullチェックではなくキー存在チェックにしないとダメ
		//       (indexedDBはnullを保存できるため、ユーザーが意図してnullを格納した可能性がある)
		const value = miLocalStorage.getItem(`${PREFIX}${key}`);
		if (value == null) {
			return ColdDeviceStorage.default[key];
		} else {
			return JSON.parse(value);
		}
	}

	public static getAll(): Partial<typeof this.default> {
		return (Object.keys(this.default) as (keyof typeof this.default)[]).reduce((acc, key) => {
			const value = localStorage.getItem(PREFIX + key);
			if (value != null) {
				acc[key] = JSON.parse(value);
			}
			return acc;
		}, {} as any);
	}

	public static set<T extends keyof typeof ColdDeviceStorage.default>(key: T, value: typeof ColdDeviceStorage.default[T]): void {
		// 呼び出し側のバグ等で undefined が来ることがある
		// undefined を文字列として miLocalStorage に入れると参照する際の JSON.parse でコケて不具合の元になるため無視
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (value === undefined) {
			console.error(`attempt to store undefined value for key '${key}'`);
			return;
		}

		miLocalStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));

		for (const watcher of this.watchers) {
			if (watcher.key === key) watcher.callback(value);
		}
	}

	public static watch(key, callback) {
		this.watchers.push({ key, callback });
	}

	// TODO: VueのcustomRef使うと良い感じになるかも
	public static ref<T extends keyof typeof ColdDeviceStorage.default>(key: T) {
		const v = ColdDeviceStorage.get(key);
		const r = ref(v);
		// TODO: このままではwatcherがリークするので開放する方法を考える
		this.watch(key, v => {
			r.value = v;
		});
		return r;
	}

	/**
	 * 特定のキーの、簡易的なgetter/setterを作ります
	 * 主にvue場で設定コントロールのmodelとして使う用
	 */
	public static makeGetterSetter<K extends keyof typeof ColdDeviceStorage.default>(key: K) {
		// TODO: VueのcustomRef使うと良い感じになるかも
		const valueRef = ColdDeviceStorage.ref(key);
		return {
			get: () => {
				return valueRef.value;
			},
			set: (value: unknown) => {
				const val = value;
				ColdDeviceStorage.set(key, val);
			},
		};
	}
}
