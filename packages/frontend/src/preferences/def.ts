/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'cherrypick-js';
import { hemisphere } from '@@/js/intl-const.js';
import type { Theme } from '@/theme.js';
import type { SoundType } from '@/utility/sound.js';
import type { Plugin } from '@/plugin.js';
import type { DeviceKind } from '@/utility/device-kind.js';
import type { DeckProfile } from '@/deck.js';
import type { PreferencesDefinition } from './manager.js';
import { DEFAULT_DEVICE_KIND } from '@/utility/device-kind.js';

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
};

// NOTE: デフォルト値は他の設定の状態に依存してはならない(依存していた場合、ユーザーがその設定項目単体で「初期値にリセット」した場合不具合の原因になる)

export const PREF_DEF = {
	accounts: {
		default: [] as [host: string, user: {
			id: string;
			username: string;
		}][],
	},

	pinnedUserLists: {
		accountDependent: true,
		default: [] as Misskey.entities.UserList[],
	},
	uploadFolder: {
		accountDependent: true,
		default: null as string | null,
	},
	widgets: {
		accountDependent: true,
		default: [{
			name: 'calendar',
			id: 'a', place: 'right', data: {},
		}, {
			name: 'notifications',
			id: 'b', place: 'right', data: {},
		}, {
			name: 'trends',
			id: 'c', place: 'right', data: {},
		}] as {
			name: string;
			id: string;
			place: string | null;
			data: Record<string, any>;
		}[],
	},
	'deck.profile': {
		accountDependent: true,
		default: null as string | null,
	},
	'deck.profiles': {
		accountDependent: true,
		default: [] as DeckProfile[],
	},

	emojiPalettes: {
		serverDependent: true,
		default: [{
			id: 'a',
			name: '',
			emojis: ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮'],
		}] as {
			id: string;
			name: string;
			emojis: string[];
		}[],
	},
	emojiPaletteForReaction: {
		serverDependent: true,
		default: null as string | null,
	},
	emojiPaletteForMain: {
		serverDependent: true,
		default: null as string | null,
	},

	overridedDeviceKind: {
		default: null as DeviceKind | null,
	},
	themes: {
		default: [] as Theme[],
	},
	lightTheme: {
		default: null as Theme | null,
	},
	darkTheme: {
		default: null as Theme | null,
	},
	syncDeviceDarkMode: {
		default: true,
	},
	defaultNoteVisibility: {
		default: 'public' as (typeof Misskey.noteVisibilities)[number],
	},
	defaultNoteLocalOnly: {
		default: false,
	},
	keepCw: {
		default: true,
	},
	rememberNoteVisibility: {
		default: false,
	},
	reportError: {
		default: false,
	},
	collapseRenotes: {
		default: true,
	},
	menu: {
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
		default: [] as {
			name: string;
			id: string;
			type: string;
			size: 'verySmall' | 'small' | 'medium' | 'large' | 'veryLarge';
			black: boolean;
			props: Record<string, any>;
		}[],
	},
	serverDisconnectedBehavior: {
		default: 'quiet' as 'quiet' | 'reload' | 'dialog' | 'none',
	},
	nsfw: {
		default: 'respect' as 'respect' | 'force' | 'ignore',
	},
	highlightSensitiveMedia: {
		default: false,
	},
	animation: {
		default: !window.matchMedia('(prefers-reduced-motion)').matches,
	},
	animatedMfm: {
		default: !window.matchMedia('(prefers-reduced-motion)').matches,
	},
	advancedMfm: {
		default: true,
	},
	showReactionsCount: {
		default: true,
	},
	enableQuickAddMfmFunction: {
		default: true,
	},
	loadRawImages: {
		default: false,
	},
	imageNewTab: {
		default: false,
	},
	disableShowingAnimatedImages: {
		default: window.matchMedia('(prefers-reduced-motion)').matches,
	},
	emojiStyle: {
		default: 'twemoji', // twemoji / fluentEmoji / native
	},
	menuStyle: {
		default: 'auto' as 'auto' | 'popup' | 'drawer',
	},
	useBlurEffectForModal: {
		default: DEFAULT_DEVICE_KIND === 'desktop',
	},
	useBlurEffect: {
		default: DEFAULT_DEVICE_KIND === 'desktop',
	},
	useStickyIcons: {
		default: true,
	},
	showFixedPostForm: {
		default: false,
	},
	showFixedPostFormInChannel: {
		default: false,
	},
	enableInfiniteScroll: {
		default: true,
	},
	useReactionPickerForContextMenu: {
		default: false,
	},
	showGapBetweenNotesInTimeline: {
		default: true,
	},
	instanceTicker: {
		default: 'remote' as 'none' | 'remote' | 'always',
	},
	emojiPickerScale: {
		default: 3,
	},
	emojiPickerWidth: {
		default: 2,
	},
	emojiPickerHeight: {
		default: 3,
	},
	emojiPickerStyle: {
		default: 'auto' as 'auto' | 'popup' | 'drawer',
	},
	squareAvatars: {
		default: true,
	},
	showAvatarDecorations: {
		default: true,
	},
	numberOfPageCache: {
		default: 3,
	},
	showNoteActionsOnlyHover: {
		default: false,
	},
	showClipButtonInNoteFooter: {
		default: false,
	},
	reactionsDisplaySize: {
		default: 'small' as 'small' | 'medium' | 'large',
	},
	limitWidthOfReaction: {
		default: true,
	},
	forceShowAds: {
		default: true,
	},
	aiChanMode: {
		default: false,
	},
	devMode: {
		default: false,
	},
	mediaListWithOneImageAppearance: {
		default: 'expand' as 'expand' | '16_9' | '1_1' | '2_3',
	},
	notificationPosition: {
		default: 'rightBottom' as 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom',
	},
	notificationStackAxis: {
		default: 'vertical' as 'vertical' | 'horizontal',
	},
	enableCondensedLine: {
		default: false,
	},
	keepScreenOn: {
		default: false,
	},
	disableStreamingTimeline: {
		default: false,
	},
	useGroupedNotifications: {
		default: true,
	},
	dataSaver: {
		default: {
			media: false,
			avatar: false,
			urlPreview: false,
			code: false,
		} as Record<string, boolean>,
	},
	hemisphere: {
		default: hemisphere as 'N' | 'S',
	},
	enableSeasonalScreenEffect: {
		default: false,
	},
	enableHorizontalSwipe: {
		default: false,
	},
	enablePullToRefresh: {
		default: true,
	},
	useNativeUiForVideoAudioPlayer: {
		default: false,
	},
	keepOriginalFilename: {
		default: true,
	},
	alwaysConfirmFollow: {
		default: true,
	},
	confirmWhenRevealingSensitiveMedia: {
		default: false,
	},
	contextMenu: {
		default: 'app' as 'app' | 'appWithShift' | 'native',
	},
	skipNoteRender: {
		default: true,
	},
	showSoftWordMutedWord: {
		default: false,
	},
	confirmOnReact: {
		default: false,
	},
	defaultFollowWithReplies: {
		default: true,
	},
	makeEveryTextElementsSelectable: {
		default: DEFAULT_DEVICE_KIND === 'desktop',
	},
	showNavbarSubButtons: {
		default: true,
	},
	showTitlebar: {
		default: false,
	},
	plugins: {
		default: [] as Plugin[],
	},

	'sound.masterVolume': {
		default: 0.3,
	},
	'sound.notUseSound': {
		default: false,
	},
	'sound.useSoundOnlyWhenActive': {
		default: false,
	},
	'sound.on.note': {
		default: { type: 'syuilo/n-aec', volume: 1 } as SoundStore,
	},
	'sound.on.noteMy': {
		default: { type: 'syuilo/n-cea-4va', volume: 1 } as SoundStore,
	},
	'sound.on.noteSchedulePost': {
		default: { type: 'syuilo/n-cea', volume: 1 } as SoundStore,
	},
	'sound.on.noteEdited': {
		default: { type: 'syuilo/n-eca', volume: 1 } as SoundStore,
	},
	'sound.on.notification': {
		default: { type: 'syuilo/n-ea', volume: 1 } as SoundStore,
	},
	'sound.on.reaction': {
		default: { type: 'syuilo/bubble2', volume: 1 } as SoundStore,
	},
	'sound.on.chatMessage': {
		default: { type: 'syuilo/waon', volume: 1 } as SoundStore,
	},

	'deck.alwaysShowMainColumn': {
		default: true,
	},
	'deck.navWindow': {
		default: true,
	},
	'deck.useSimpleUiForNonRootPages': {
		default: true,
	},
	'deck.columnAlign': {
		default: 'center' as 'left' | 'right' | 'center',
	},
	'deck.columnGap': {
		default: 6,
	},
	'deck.menuPosition': {
		default: 'bottom' as 'right' | 'bottom',
	},
	'deck.navbarPosition': {
		default: 'left' as 'left' | 'top' | 'bottom',
	},
	'deck.wallpaper': {
		default: null as string | null,
	},

	'chat.showSenderName': {
		default: true,
	},
	'chat.sendOnEnter': {
		default: true,
	},

	'game.dropAndFusion': {
		default: {
			bgmVolume: 0.25,
			sfxVolume: 1,
		},
	},

	// #region CherryPick
	// - Settings/Preferences
	forceCollapseAllRenotes: {
		default: false,
	},
	collapseReplies: {
		default: false,
	},
	collapseLongNoteContent: {
		default: true,
	},
	collapseDefault: {
		default: true,
	},
	allMediaNoteCollapse: {
		default: false,
	},
	showSubNoteFooterButton: {
		default: true,
	},
	infoButtonForNoteActionsEnabled: {
		default: true,
	},
	showTranslateButtonInNote: {
		default: true,
	},
	showGapBodyOfTheNote: {
		default: false,
	},
	showReplyButtonInNoteFooter: {
		default: true,
	},
	showRenoteButtonInNoteFooter: {
		default: true,
	},
	showLikeButtonInNoteFooter: {
		default: true,
	},
	showDoReactionButtonInNoteFooter: {
		default: true,
	},
	showQuoteButtonInNoteFooter: {
		default: true,
	},
	showMoreButtonInNoteFooter: {
		default: true,
	},
	selectReaction: {
		default: '❤️' as string,
	},
	showReplyInNotification: {
		default: false,
	},
	renoteQuoteButtonSeparation: {
		default: true,
	},
	renoteVisibilitySelection: {
		default: true,
	},
	forceRenoteVisibilitySelection: {
		default: 'none' as 'none' | 'public' | 'home' | 'followers',
	},
	showFixedPostFormInReplies: {
		default: true,
	},
	showNoAltTextWarning: {
		default: false,
	},
	alwaysShowCw: {
		default: false,
	},
	autoLoadMoreReplies: {
		default: false,
	},
	autoLoadMoreConversation: {
		default: false,
	},
	useAutoTranslate: {
		default: false,
	},
	welcomeBackToast: {
		default: true,
	},
	disableNyaize: {
		default: false,
	},
	requireRefreshBehavior: {
		default: 'dialog' as 'quiet' | 'dialog',
	},
	newNoteReceivedNotificationBehavior: {
		default: 'count' as 'default' | 'count' | 'none',
	},
	showUnreadNotificationsCount: {
		default: false,
	},
	externalNavigationWarning: {
		default: true,
	},
	trustedDomains: {
		default: [] as string[],
	},
	showPreview: {
		default: false,
	},
	showProfilePreview: {
		default: true,
	},

	// - Settings/Appearance
	fontSize: {
		default: 8,
	},
	removeModalBgColorForBlur: {
		default: DEFAULT_DEVICE_KIND === 'desktop',
	},
	setFederationAvatarShape: {
		default: true,
	},
	filesGridLayoutInUserPage: {
		default: true,
	},
	hideAvatarsInNote: {
		default: false,
	},
	enableAbsoluteTime: {
		default: false,
	},
	enableMarkByDate: {
		default: false,
	},
	showReplyTargetNote: {
		default: true,
	},
	showReplyTargetNoteInSemiTransparent: {
		default: true,
	},
	nsfwOpenBehavior: {
		default: 'click' as 'click' | 'doubleClick',
	},

	// - Settings/Navigation bar
	bannerDisplay: {
		default: 'topBottom' as 'all' | 'topBottom' | 'top' | 'bottom' | 'bg' | 'hide',
	},

	// - Settings/Timeline
	enableHomeTimeline: {
		default: true,
	},
	enableLocalTimeline: {
		default: true,
	},
	enableSocialTimeline: {
		default: true,
	},
	enableGlobalTimeline: {
		default: true,
	},
	enableBubbleTimeline: {
		default: true,
	},
	enableListTimeline: {
		default: true,
	},
	enableAntennaTimeline: {
		default: true,
	},
	enableChannelTimeline: {
		default: true,
	},

	// - Settings/Sounds & Vibrations
	vibrate: {
		default: !/ipad|iphone/.test(navigator.userAgent.toLowerCase()) && window.navigator.vibrate,
	},
	'vibrate.on.note': {
		default: true,
	},
	'vibrate.on.notification': {
		default: true,
	},
	'vibrate.on.system': {
		default: true,
	},

	// - Settings/CherryPick
	nicknameEnabled: {
		default: true,
	},
	nicknameMap: {
		default: {} as Record<string, string>,
	},
	useEnterToSend: {
		default: false,
	},
	postFormVisibilityHotkey: {
		default: true,
	},
	showRenoteConfirmPopup: {
		default: true,
	},
	expandOnNoteClick: {
		default: true,
	},
	expandOnNoteClickBehavior: {
		default: 'click' as 'click' | 'doubleClick',
	},
	displayHeaderNavBarWhenScroll: {
		default: 'hideHeaderFloatBtn' as 'all' | 'hideHeaderOnly' | 'hideHeaderFloatBtn' | 'hideFloatBtnOnly' | 'hideFloatBtnNavBar' | 'hide',
	},
	reactableRemoteReactionEnabled: {
		default: true,
	},
	showFollowingMessageInsteadOfButtonEnabled: {
		default: true,
	},
	mobileHeaderChange: {
		default: false,
	},
	renameTheButtonInPostFormToNya: {
		default: false,
	},
	renameTheButtonInPostFormToNyaManualSet: {
		default: false,
	},
	enableWidgetsArea: {
		default: true,
	},
	friendlyUiEnableNotificationsArea: {
		default: true,
	},
	enableLongPressOpenAccountMenu: {
		default: true,
	},
	friendlyUiShowAvatarDecorationsInNavBtn: {
		default: false,
	},

	// - Settings/Accessibility
	showingAnimatedImages: {
		default: /mobile|ipad|iphone|android/.test(navigator.userAgent.toLowerCase()) ? 'inactive' : 'always' as 'always' | 'interaction' | 'inactive',
	},

	// - Settings/Drive
	imageCompressionMode: {
		default: 'resizeCompressLossy' as 'resizeCompress' | 'noResizeCompress' | 'resizeCompressLossy' | 'noResizeCompressLossy' | null,
	},
	//#endregion

	'experimental.stackingRouterView': {
		default: false,
	},
} satisfies PreferencesDefinition;
