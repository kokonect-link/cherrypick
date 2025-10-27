/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import lightTheme from '@@/themes/l-cherrypick.json5';
import darkTheme from '@@/themes/d-cherrypick.json5';
import { prefersReducedMotion } from '@@/js/config.js';
import { hemisphere } from '@@/js/intl-const.js';
import type { DeviceKind } from '@/utility/device-kind.js';
import type { Plugin } from '@/plugin.js';
import type { TIPS } from '@/tips.js';
import { miLocalStorage } from '@/local-storage.js';
import { Pizzax } from '@/lib/pizzax.js';
import { DEFAULT_DEVICE_KIND } from '@/utility/device-kind.js';
import { isFriendly } from '@/utility/is-friendly.js';

/**
 * 「状態」を管理するストア(not「設定」)
 */
export const store = markRaw(new Pizzax('base', {
	accountSetupWizard: {
		where: 'account',
		default: 0,
	},
	tips: {
		where: 'device',
		default: {} as Partial<Record<typeof TIPS[number], boolean>>, // true = 既読
	},
	memo: {
		where: 'account',
		default: null as string | null,
	},
	reactionAcceptance: {
		where: 'account',
		default: null as 'likeOnly' | 'likeOnlyForRemote' | 'nonSensitiveOnly' | 'nonSensitiveOnlyForLocalLikeOnlyForRemote' | null,
	},
	mutedAds: {
		where: 'account',
		default: [] as string[],
	},
	visibility: {
		where: 'deviceAccount',
		default: 'public' as (typeof Misskey.noteVisibilities)[number],
	},
	localOnly: {
		where: 'deviceAccount',
		default: false,
	},
	tl: {
		where: 'deviceAccount',
		default: {
			src: 'home' as 'home' | 'local' | 'social' | 'global' | `list:${string}`,
			userList: null as Misskey.entities.UserList | null,
			filter: {
				withReplies: false,
				withRenotes: true,
				withSensitive: true,
				onlyFiles: false,
				onlyCats: false,
			},
		},
	},
	darkMode: {
		where: 'device',
		default: false,
	},
	realtimeMode: {
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
	menuDisplay: {
		where: 'device',
		default: 'sideFull' as 'sideFull' | 'sideIcon' | 'top',
	},
	postFormWithHashtags: {
		where: 'device',
		default: false,
	},
	postFormHashtags: {
		where: 'device',
		default: '',
	},
	additionalUnicodeEmojiIndexes: {
		where: 'device',
		default: {} as Record<string, Record<string, string[]>>,
	},
	pluginTokens: {
		where: 'deviceAccount',
		default: {} as Record<string, string>, // plugin id, token
	},
	accountTokens: {
		where: 'device',
		default: {} as Record<string, string>, // host/userId, token
	},
	accountInfos: {
		where: 'device',
		default: {} as Record<string, Misskey.entities.MeDetailed>, // host/userId, user
	},

	enablePreferencesAutoCloudBackup: {
		where: 'device',
		default: false,
	},
	showPreferencesAutoCloudBackupSuggestion: {
		where: 'device',
		default: true,
	},

	//#region TODO: そのうち消す (preferに移行済み)
	defaultWithReplies: {
		where: 'account',
		default: true,
	},
	reactions: {
		where: 'account',
		default: ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮'],
	},
	pinnedEmojis: {
		where: 'account',
		default: [],
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
	overridedDeviceKind: {
		where: 'device',
		default: null as DeviceKind | null,
	},
	defaultSideView: {
		where: 'device',
		default: false,
	},
	defaultNoteVisibility: {
		where: 'account',
		default: 'public' as (typeof Misskey.noteVisibilities)[number],
	},
	defaultNoteLocalOnly: {
		where: 'account',
		default: false,
	},
	keepCw: {
		where: 'account',
		default: true,
	},
	collapseRenotes: {
		where: 'account',
		default: true,
	},
	rememberNoteVisibility: {
		where: 'account',
		default: false,
	},
	uploadFolder: {
		where: 'account',
		default: null as string | null,
	},
	keepOriginalUploading: {
		where: 'account',
		default: false,
	},
	menu: {
		where: 'deviceAccount',
		default: [
			'notifications',
			'chat',
			'favorites',
			'explore',
			'followRequests',
			'-',
			'announcements',
			'channels',
			'search',
			'-',
			'support',
		],
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
	pinnedUserLists: {
		where: 'deviceAccount',
		default: [] as Misskey.entities.UserList[],
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
		default: !prefersReducedMotion,
	},
	animatedMfm: {
		where: 'device',
		default: !prefersReducedMotion,
	},
	advancedMfm: {
		where: 'device',
		default: true,
	},
	showReactionsCount: {
		where: 'device',
		default: true,
	},
	enableQuickAddMfmFunction: {
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
		default: prefersReducedMotion,
	},
	emojiStyle: {
		where: 'device',
		default: 'twemoji', // twemoji / fluentEmoji / native
	},
	menuStyle: {
		where: 'device',
		default: 'auto' as 'auto' | 'popup' | 'drawer',
	},
	useBlurEffectForModal: {
		where: 'device',
		default: DEFAULT_DEVICE_KIND === 'desktop',
	},
	useBlurEffect: {
		where: 'device',
		default: DEFAULT_DEVICE_KIND === 'desktop',
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
	instanceTicker: {
		where: 'device',
		default: 'remote' as 'always' | 'remote' | 'none',
	},
	emojiPickerScale: {
		where: 'device',
		default: 3,
	},
	emojiPickerWidth: {
		where: 'device',
		default: 2,
	},
	emojiPickerHeight: {
		where: 'device',
		default: 3,
	},
	emojiPickerStyle: {
		where: 'device',
		default: 'auto' as 'auto' | 'popup' | 'drawer',
	},
	reportError: {
		where: 'device',
		default: false,
	},
	squareAvatars: {
		where: 'account',
		default: true,
	},
	showAvatarDecorations: {
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
	enableCondensedLine: {
		where: 'device',
		default: false,
	},
	keepScreenOn: {
		where: 'device',
		default: false,
	},
	useGroupedNotifications: {
		where: 'device',
		default: true,
	},
	dataSaver: {
		where: 'device',
		default: {
			media: false,
			avatar: false,
			urlPreview: false,
			code: false,
		},
	},
	enableSeasonalScreenEffect: {
		where: 'device',
		default: false,
	},
	enableHorizontalSwipe: {
		where: 'device',
		default: true,
	},
	useNativeUIForVideoAudioPlayer: {
		where: 'device',
		default: false,
	},
	keepOriginalFilename: {
		where: 'device',
		default: true,
	},
	alwaysConfirmFollow: {
		where: 'device',
		default: true,
	},
	confirmWhenRevealingSensitiveMedia: {
		where: 'device',
		default: false,
	},
	contextMenu: {
		where: 'device',
		default: 'app' as 'app' | 'appWithShift' | 'native',
	},
	skipNoteRender: {
		where: 'device',
		default: true,
	},
	showSoftWordMutedWord: {
		where: 'device',
		default: false,
	},
	confirmOnReact: {
		where: 'device',
		default: false,
	},
	hemisphere: {
		where: 'device',
		default: hemisphere as 'N' | 'S',
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
		default: { type: 'syuilo/n-aec', volume: 1 },
	},
	sound_noteMy: {
		where: 'device',
		default: { type: 'syuilo/n-cea-4va', volume: 1 },
	},
	sound_noteSchedulePost: {
		where: 'device',
		default: { type: 'syuilo/n-cea', volume: 1 },
	},
	sound_noteEdited: {
		where: 'device',
		default: { type: 'syuilo/n-eca', volume: 1 },
	},
	sound_notification: {
		where: 'device',
		default: { type: 'syuilo/n-ea', volume: 1 },
	},
	sound_reaction: {
		where: 'device',
		default: { type: 'syuilo/bubble2', volume: 1 },
	},
	dropAndFusion: {
		where: 'device',
		default: {
			bgmVolume: 0.25,
			sfxVolume: 1,
		},
	},

	// #region CherryPick
	// - Settings/Preferences
	forceCollapseAllRenotes: {
		where: 'account',
		default: false,
	},
	collapseReplies: {
		where: 'account',
		default: false,
	},
	collapseLongNoteContent: {
		where: 'account',
		default: true,
	},
	collapseDefault: {
		where: 'account',
		default: true,
	},
	allMediaNoteCollapse: {
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
	showTranslateButtonInNote: {
		where: 'device',
		default: true,
	},
	showGapBodyOfTheNote: {
		where: 'device',
		default: false,
	},
	showReplyButtonInNoteFooter: {
		where: 'device',
		default: true,
	},
	showRenoteButtonInNoteFooter: {
		where: 'device',
		default: true,
	},
	showLikeButtonInNoteFooter: {
		where: 'device',
		default: true,
	},
	showDoReactionButtonInNoteFooter: {
		where: 'device',
		default: true,
	},
	showQuoteButtonInNoteFooter: {
		where: 'device',
		default: true,
	},
	showMoreButtonInNoteFooter: {
		where: 'device',
		default: true,
	},
	selectReaction: {
		where: 'device',
		default: '❤️' as string,
	},
	showReplyInNotification: {
		where: 'device',
		default: false,
	},
	renoteQuoteButtonSeparation: {
		where: 'device',
		default: true,
	},
	renoteVisibilitySelection: {
		where: 'device',
		default: true,
	},
	forceRenoteVisibilitySelection: {
		where: 'device',
		default: 'none' as 'none' | 'public' | 'home' | 'followers',
	},
	showFixedPostFormInReplies: {
		where: 'device',
		default: true,
	},
	showNoAltTextWarning: {
		where: 'device',
		default: false,
	},
	alwaysShowCw: {
		where: 'device',
		default: false,
	},
	autoLoadMoreReplies: {
		where: 'device',
		default: false,
	},
	autoLoadMoreConversation: {
		where: 'device',
		default: false,
	},
	useAutoTranslate: {
		where: 'device',
		default: false,
	},
	welcomeBackToast: {
		where: 'device',
		default: true,
	},
	disableNyaize: {
		where: 'device',
		default: false,
	},
	requireRefreshBehavior: {
		where: 'device',
		default: 'dialog' as 'quiet' | 'dialog',
	},
	newNoteReceivedNotificationBehavior: {
		where: 'device',
		default: 'count' as 'default' | 'count' | 'none',
	},
	searchEngine: {
		where: 'device',
		default: 'google' as 'google' | 'bing' | 'yahoo' | 'baidu' | 'naver' | 'daum' | 'duckduckgo' | 'other',
	},
	searchEngineUrl: {
		where: 'device',
		default: 'https://www.ecosia.org/search?',
	},
	searchEngineUrlQuery: {
		where: 'device',
		default: 'q',
	},
	showUnreadNotificationsCount: {
		where: 'deviceAccount',
		default: false,
	},
	externalNavigationWarning: {
		where: 'device',
		default: true,
	},
	trustedDomains: {
		where: 'device',
		default: [] as string[],
	},
	showPreview: {
		where: 'device',
		default: false,
	},
	showProfilePreview: {
		where: 'device',
		default: true,
	},

	// - Settings/Appearance
	removeModalBgColorForBlur: {
		where: 'device',
		default: DEFAULT_DEVICE_KIND === 'desktop',
	},
	fontSize: {
		where: 'device',
		default: 8,
	},
	setFederationAvatarShape: {
		where: 'account',
		default: true,
	},
	filesGridLayoutInUserPage: {
		where: 'device',
		default: true,
	},
	hideAvatarsInNote: {
		where: 'device',
		default: false,
	},
	enableAbsoluteTime: {
		where: 'device',
		default: false,
	},
	enableMarkByDate: {
		where: 'device',
		default: false,
	},
	showReplyTargetNote: {
		where: 'device',
		default: true,
	},
	showReplyTargetNoteInSemiTransparent: {
		where: 'device',
		default: true,
	},
	nsfwOpenBehavior: {
		where: 'device',
		default: 'click' as 'click' | 'doubleClick',
	},

	// - Settings/Navigation bar
	bannerDisplay: {
		where: 'device',
		default: 'topBottom' as 'all' | 'topBottom' | 'top' | 'bottom' | 'bg' | 'hide',
	},
	showMenuButtonInNavbar: {
		where: 'device',
		default: !isFriendly().value,
	},
	showHomeButtonInNavbar: {
		where: 'device',
		default: true,
	},
	showExploreButtonInNavbar: {
		where: 'device',
		default: isFriendly().value,
	},
	showSearchButtonInNavbar: {
		where: 'device',
		default: false,
	},
	showNotificationButtonInNavbar: {
		where: 'device',
		default: true,
	},
	showChatButtonInNavbar: {
		where: 'device',
		default: isFriendly().value,
	},
	showWidgetButtonInNavbar: {
		where: 'device',
		default: true,
	},
	showPostButtonInNavbar: {
		where: 'device',
		default: !isFriendly().value,
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
	enableBubbleTimeline: {
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
	expandOnNoteClickBehavior: {
		where: 'device',
		default: 'click' as 'click' | 'doubleClick',
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
	enableWidgetsArea: {
		where: 'device',
		default: true,
	},
	friendlyUiEnableNotificationsArea: {
		where: 'device',
		default: true,
	},
	enableLongPressOpenAccountMenu: {
		where: 'device',
		default: true,
	},
	friendlyUiShowAvatarDecorationsInNavBtn: {
		where: 'device',
		default: false,
	},

	// - Settings/Accessibility
	showingAnimatedImages: {
		where: 'device',
		default: /mobile|ipad|iphone|android/.test(navigator.userAgent.toLowerCase()) ? 'inactive' : 'always' as 'always' | 'interaction' | 'inactive',
	},
	// #endregion
}));

// TODO: 他のタブと永続化されたstateを同期

const PREFIX = 'miux:' as const;

interface Watcher {
	key: string;
	callback: (value: unknown) => void;
}

// TODO: 消す(preferに移行済みのため)
/**
 * 常にメモリにロードしておく必要がないような設定情報を保管するストレージ(非リアクティブ)
 */
export class ColdDeviceStorage {
	public static default = {
		lightTheme, // TODO: 消す(preferに移行済みのため)
		darkTheme, // TODO: 消す(preferに移行済みのため)
		syncDeviceDarkMode: true, // TODO: 消す(preferに移行済みのため)
		plugins: [] as (Omit<Plugin, 'installId'> & { id: string })[], // TODO: 消す(preferに移行済みのため)
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
		return (Object.keys(this.default) as (keyof typeof this.default)[]).reduce<Partial<typeof this.default>>((acc, key) => {
			const value = localStorage.getItem(PREFIX + key);
			if (value != null) {
				acc[key] = JSON.parse(value);
			}
			return acc;
		}, {});
	}

	public static set<T extends keyof typeof ColdDeviceStorage.default>(key: T, value: typeof ColdDeviceStorage.default[T]): void {
		// 呼び出し側のバグ等で undefined が来ることがある
		// undefined を文字列として miLocalStorage に入れると参照する際の JSON.parse でコケて不具合の元になるため無視

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
			set: (value: typeof ColdDeviceStorage.default[K]) => {
				const val = value;
				ColdDeviceStorage.set(key, val);
			},
		};
	}
}
