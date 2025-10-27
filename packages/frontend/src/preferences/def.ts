/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'cherrypick-js';
import { hemisphere } from '@@/js/intl-const.js';
import { prefersReducedMotion } from '@@/js/config.js';
import { definePreferences } from './manager.js';
import type { Theme } from '@/theme.js';
import type { SoundType } from '@/utility/sound.js';
import type { Plugin } from '@/plugin.js';
import type { DeviceKind } from '@/utility/device-kind.js';
import type { DeckProfile } from '@/deck.js';
import type { WatermarkPreset } from '@/utility/watermark.js';
import { genId } from '@/utility/id.js';
import { DEFAULT_DEVICE_KIND } from '@/utility/device-kind.js';
import { deepEqual } from '@/utility/deep-equal.js';

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

export type StatusbarStore = {
	name: string | null;
	id: string;
	type: string | null;
	size: 'verySmall' | 'small' | 'medium' | 'large' | 'veryLarge';
	black: boolean;
	props: Record<string, any>;
};

export type DataSaverStore = {
	media: boolean;
	avatar: boolean;
	urlPreviewThumbnail: boolean;
	disableUrlPreview: boolean;
	code: boolean;
};

type OmitStrict<T, K extends keyof T> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;

// NOTE: デフォルト値は他の設定の状態に依存してはならない(依存していた場合、ユーザーがその設定項目単体で「初期値にリセット」した場合不具合の原因になる)

export const PREF_DEF = definePreferences({
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
		default: () => [{
			name: 'calendar',
			id: genId(), place: 'right', data: {},
		}, {
			name: 'notifications',
			id: genId(), place: 'right', data: {},
		}, {
			name: 'trends',
			id: genId(), place: 'right', data: {},
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
		default: () => [{
			id: genId(),
			name: '',
			emojis: ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮'],
		}] as {
			id: string;
			name: string;
			emojis: string[];
		}[],
		mergeStrategy: (a, b) => {
			const mergedItems = [] as typeof a;
			for (const x of a.concat(b)) {
				const sameIdItem = mergedItems.find(y => y.id === x.id);
				if (sameIdItem != null) {
					if (deepEqual(x, sameIdItem)) { // 完全な重複は無視
						continue;
					} else { // IDは同じなのに内容が違う場合はマージ不可とする
						throw new Error();
					}
				} else {
					mergedItems.push(x);
				}
			}
			return mergedItems;
		},
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
		mergeStrategy: (a, b) => {
			const mergedItems = [] as typeof a;
			for (const x of a.concat(b)) {
				const sameIdItem = mergedItems.find(y => y.id === x.id);
				if (sameIdItem != null) {
					if (deepEqual(x, sameIdItem)) { // 完全な重複は無視
						continue;
					} else { // IDは同じなのに内容が違う場合はマージ不可とする
						throw new Error();
					}
				} else {
					mergedItems.push(x);
				}
			}
			return mergedItems;
		},
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
		default: [] as StatusbarStore[],
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
		default: !prefersReducedMotion,
	},
	animatedMfm: {
		default: !prefersReducedMotion,
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
		default: prefersReducedMotion,
	},
	emojiStyle: {
		default: 'twemoji', // twemoji / fluentEmoji / native
	},
	menuStyle: {
		default: 'auto' as 'auto' | 'popup' | 'drawer',
	},
	useBlurEffectForModal: {
		default: true,
	},
	useBlurEffect: {
		default: true,
	},
	useStickyIcons: {
		default: true,
	},
	enableHighQualityImagePlaceholders: {
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
	pollingInterval: {
		// 1 ... 低
		// 2 ... 中
		// 3 ... 高
		default: 2,
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
	useGroupedNotifications: {
		default: true,
	},
	dataSaver: {
		default: {
			media: false,
			avatar: false,
			urlPreviewThumbnail: false,
			disableUrlPreview: false,
			code: false,
		} as DataSaverStore,
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
	showAvailableReactionsFirstInNote: {
		default: false,
	},
	showPageTabBarBottom: {
		default: false,
	},
	plugins: {
		default: [] as (OmitStrict<Plugin, 'config'> & { config: Record<string, any> })[],
		mergeStrategy: (a, b) => {
			const sameIdExists = a.some(x => b.some(y => x.installId === y.installId));
			if (sameIdExists) throw new Error();
			const sameNameExists = a.some(x => b.some(y => x.name === y.name));
			if (sameNameExists) throw new Error();
			return a.concat(b);
		},
	},
	mutingEmojis: {
		default: [] as string[],
		mergeStrategy: (a, b) => {
			return [...new Set(a.concat(b))];
		},
	},
	watermarkPresets: {
		accountDependent: true,
		default: [] as WatermarkPreset[],
		mergeStrategy: (a, b) => {
			const mergedItems = [] as typeof a;
			for (const x of a.concat(b)) {
				const sameIdItem = mergedItems.find(y => y.id === x.id);
				if (sameIdItem != null) {
					if (deepEqual(x, sameIdItem)) { // 完全な重複は無視
						continue;
					} else { // IDは同じなのに内容が違う場合はマージ不可とする
						throw new Error();
					}
				} else {
					mergedItems.push(x);
				}
			}
			return mergedItems;
		},
	},
	defaultWatermarkPresetId: {
		accountDependent: true,
		default: null as WatermarkPreset['id'] | null,
	},
	defaultImageCompressionLevel: {
		default: 2 as 0 | 1 | 2 | 3,
	},
	defaultVideoCompressionLevel: {
		default: 2 as 0 | 1 | 2 | 3,
	},

	'sound.masterVolume': {
		default: 0.5,
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
	//#endregion

	'experimental.stackingRouterView': {
		default: false,
	},
	'experimental.enableFolderPageView': {
		default: false,
	},
	'experimental.enableHapticFeedback': {
		default: false,
	},
	'experimental.enableWebTranslatorApi': {
		default: false,
	},
});
