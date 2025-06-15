/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { v4 as uuid } from 'uuid';
import type { DeckProfile } from '@/deck.js';
import { ColdDeviceStorage, store } from '@/store.js';
import { prefer } from '@/preferences.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { deckStore } from '@/ui/deck/deck-store.js';
import { unisonReload } from '@/utility/unison-reload.js';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';

// TODO: そのうち消す
export function migrateOldSettings() {
	os.waiting(i18n.ts.settingsMigrating);

	store.loaded.then(async () => {
		misskeyApi('i/registry/get', { scope: ['client'], key: 'themes' }).catch(() => []).then((themes: any) => {
			if (themes.length > 0) {
				prefer.commit('themes', themes);
			}
		});

		const plugins = ColdDeviceStorage.get('plugins');
		prefer.commit('plugins', plugins.map(p => ({
			...p,
			installId: (p as any).id,
			id: undefined,
		})));

		prefer.commit('deck.profile', deckStore.s.profile);
		misskeyApi('i/registry/keys', {
			scope: ['client', 'deck', 'profiles'],
		}).then(async keys => {
			const profiles: DeckProfile[] = [];
			for (const key of keys) {
				const deck = await misskeyApi('i/registry/get', {
					scope: ['client', 'deck', 'profiles'],
					key: key,
				});
				profiles.push({
					id: uuid(),
					name: key,
					columns: deck.columns,
					layout: deck.layout,
				});
			}
			prefer.commit('deck.profiles', profiles);
		});

		prefer.commit('lightTheme', ColdDeviceStorage.get('lightTheme'));
		prefer.commit('darkTheme', ColdDeviceStorage.get('darkTheme'));
		prefer.commit('syncDeviceDarkMode', ColdDeviceStorage.get('syncDeviceDarkMode'));
		prefer.commit('emojiPalettes', [{
			id: 'reactions',
			name: '',
			emojis: store.s.reactions,
		}, {
			id: 'pinnedEmojis',
			name: '',
			emojis: store.s.pinnedEmojis,
		}]);
		prefer.commit('emojiPaletteForMain', 'pinnedEmojis');
		prefer.commit('emojiPaletteForReaction', 'reactions');
		prefer.commit('overridedDeviceKind', store.s.overridedDeviceKind);
		prefer.commit('widgets', store.s.widgets);
		prefer.commit('keepCw', store.s.keepCw);
		prefer.commit('collapseRenotes', store.s.collapseRenotes);
		prefer.commit('rememberNoteVisibility', store.s.rememberNoteVisibility);
		prefer.commit('uploadFolder', store.s.uploadFolder);
		prefer.commit('menu', [...store.s.menu, 'chat']);
		prefer.commit('statusbars', store.s.statusbars);
		prefer.commit('pinnedUserLists', store.s.pinnedUserLists);
		prefer.commit('serverDisconnectedBehavior', store.s.serverDisconnectedBehavior);
		prefer.commit('nsfw', store.s.nsfw);
		prefer.commit('highlightSensitiveMedia', store.s.highlightSensitiveMedia);
		prefer.commit('animation', store.s.animation);
		prefer.commit('animatedMfm', store.s.animatedMfm);
		prefer.commit('advancedMfm', store.s.advancedMfm);
		prefer.commit('showReactionsCount', store.s.showReactionsCount);
		prefer.commit('enableQuickAddMfmFunction', store.s.enableQuickAddMfmFunction);
		prefer.commit('loadRawImages', store.s.loadRawImages);
		prefer.commit('imageNewTab', store.s.imageNewTab);
		prefer.commit('disableShowingAnimatedImages', store.s.disableShowingAnimatedImages);
		prefer.commit('emojiStyle', store.s.emojiStyle);
		prefer.commit('menuStyle', store.s.menuStyle);
		prefer.commit('useBlurEffectForModal', store.s.useBlurEffectForModal);
		prefer.commit('useBlurEffect', store.s.useBlurEffect);
		prefer.commit('showFixedPostForm', store.s.showFixedPostForm);
		prefer.commit('showFixedPostFormInChannel', store.s.showFixedPostFormInChannel);
		prefer.commit('enableInfiniteScroll', store.s.enableInfiniteScroll);
		prefer.commit('useReactionPickerForContextMenu', store.s.useReactionPickerForContextMenu);
		prefer.commit('showGapBetweenNotesInTimeline', store.s.showGapBetweenNotesInTimeline);
		prefer.commit('instanceTicker', store.s.instanceTicker);
		prefer.commit('emojiPickerScale', store.s.emojiPickerScale);
		prefer.commit('emojiPickerWidth', store.s.emojiPickerWidth);
		prefer.commit('emojiPickerHeight', store.s.emojiPickerHeight);
		prefer.commit('emojiPickerStyle', store.s.emojiPickerStyle);
		prefer.commit('reportError', store.s.reportError);
		prefer.commit('squareAvatars', store.s.squareAvatars);
		prefer.commit('showAvatarDecorations', store.s.showAvatarDecorations);
		prefer.commit('numberOfPageCache', store.s.numberOfPageCache);
		prefer.commit('showNoteActionsOnlyHover', store.s.showNoteActionsOnlyHover);
		prefer.commit('showClipButtonInNoteFooter', store.s.showClipButtonInNoteFooter);
		prefer.commit('reactionsDisplaySize', store.s.reactionsDisplaySize);
		prefer.commit('limitWidthOfReaction', store.s.limitWidthOfReaction);
		prefer.commit('forceShowAds', store.s.forceShowAds);
		prefer.commit('aiChanMode', store.s.aiChanMode);
		prefer.commit('devMode', store.s.devMode);
		prefer.commit('mediaListWithOneImageAppearance', store.s.mediaListWithOneImageAppearance);
		prefer.commit('notificationPosition', store.s.notificationPosition);
		prefer.commit('notificationStackAxis', store.s.notificationStackAxis);
		prefer.commit('enableCondensedLine', store.s.enableCondensedLine);
		prefer.commit('keepScreenOn', store.s.keepScreenOn);
		prefer.commit('disableStreamingTimeline', store.s.disableStreamingTimeline);
		prefer.commit('useGroupedNotifications', store.s.useGroupedNotifications);
		prefer.commit('dataSaver', store.s.dataSaver);
		prefer.commit('enableSeasonalScreenEffect', store.s.enableSeasonalScreenEffect);
		prefer.commit('enableHorizontalSwipe', store.s.enableHorizontalSwipe);
		prefer.commit('useNativeUiForVideoAudioPlayer', store.s.useNativeUIForVideoAudioPlayer);
		prefer.commit('keepOriginalFilename', store.s.keepOriginalFilename);
		prefer.commit('alwaysConfirmFollow', store.s.alwaysConfirmFollow);
		prefer.commit('confirmWhenRevealingSensitiveMedia', store.s.confirmWhenRevealingSensitiveMedia);
		prefer.commit('contextMenu', store.s.contextMenu);
		prefer.commit('skipNoteRender', store.s.skipNoteRender);
		prefer.commit('showSoftWordMutedWord', store.s.showSoftWordMutedWord);
		prefer.commit('confirmOnReact', store.s.confirmOnReact);
		prefer.commit('defaultFollowWithReplies', store.s.defaultWithReplies);
		prefer.commit('sound.masterVolume', store.s.sound_masterVolume);
		prefer.commit('sound.notUseSound', store.s.sound_notUseSound);
		prefer.commit('sound.useSoundOnlyWhenActive', store.s.sound_useSoundOnlyWhenActive);
		prefer.commit('sound.on.note', store.s.sound_note as any);
		prefer.commit('sound.on.noteMy', store.s.sound_noteMy as any);
		prefer.commit('sound.on.noteSchedulePost', store.s.sound_noteSchedulePost as any);
		prefer.commit('sound.on.noteEdited', store.s.sound_noteEdited as any);
		prefer.commit('sound.on.notification', store.s.sound_notification as any);
		prefer.commit('sound.on.reaction', store.s.sound_reaction as any);
		prefer.commit('defaultNoteVisibility', store.s.defaultNoteVisibility);
		prefer.commit('defaultNoteLocalOnly', store.s.defaultNoteLocalOnly);
		prefer.commit('showPreview', store.s.showPreview);

		// #region CherryPick
		// - Settings/Preferences
		prefer.commit('forceCollapseAllRenotes', store.s.forceCollapseAllRenotes);
		prefer.commit('collapseReplies', store.s.collapseReplies);
		prefer.commit('collapseLongNoteContent', store.s.collapseLongNoteContent);
		prefer.commit('collapseDefault', store.s.collapseDefault);
		prefer.commit('allMediaNoteCollapse', store.s.allMediaNoteCollapse);
		prefer.commit('showSubNoteFooterButton', store.s.showSubNoteFooterButton);
		prefer.commit('infoButtonForNoteActionsEnabled', store.s.infoButtonForNoteActionsEnabled);
		prefer.commit('showTranslateButtonInNote', store.s.showTranslateButtonInNote);
		prefer.commit('showGapBodyOfTheNote', store.s.showGapBodyOfTheNote);
		prefer.commit('showReplyButtonInNoteFooter', store.s.showReplyButtonInNoteFooter);
		prefer.commit('showRenoteButtonInNoteFooter', store.s.showRenoteButtonInNoteFooter);
		prefer.commit('showLikeButtonInNoteFooter', store.s.showLikeButtonInNoteFooter);
		prefer.commit('showDoReactionButtonInNoteFooter', store.s.showDoReactionButtonInNoteFooter);
		prefer.commit('showQuoteButtonInNoteFooter', store.s.showQuoteButtonInNoteFooter);
		prefer.commit('showMoreButtonInNoteFooter', store.s.showMoreButtonInNoteFooter);
		prefer.commit('selectReaction', store.s.selectReaction);
		prefer.commit('showReplyInNotification', store.s.showReplyInNotification);
		prefer.commit('renoteQuoteButtonSeparation', store.s.renoteQuoteButtonSeparation);
		prefer.commit('renoteVisibilitySelection', store.s.renoteVisibilitySelection);
		prefer.commit('showFixedPostFormInReplies', store.s.showFixedPostFormInReplies);
		prefer.commit('showNoAltTextWarning', store.s.showNoAltTextWarning);
		prefer.commit('alwaysShowCw', store.s.alwaysShowCw);
		prefer.commit('autoLoadMoreReplies', store.s.autoLoadMoreReplies);
		prefer.commit('autoLoadMoreConversation', store.s.autoLoadMoreConversation);
		prefer.commit('useAutoTranslate', store.s.useAutoTranslate);
		prefer.commit('welcomeBackToast', store.s.welcomeBackToast);
		prefer.commit('disableNyaize', store.s.disableNyaize);
		prefer.commit('requireRefreshBehavior', store.s.requireRefreshBehavior);
		prefer.commit('newNoteReceivedNotificationBehavior', store.s.newNoteReceivedNotificationBehavior);
		prefer.commit('showProfilePreview', store.s.showProfilePreview);

		// - Settings/Appearance
		prefer.commit('fontSize', store.s.fontSize);
		prefer.commit('setFederationAvatarShape', store.s.setFederationAvatarShape);
		prefer.commit('filesGridLayoutInUserPage', store.s.filesGridLayoutInUserPage);
		prefer.commit('hideAvatarsInNote', store.s.hideAvatarsInNote);
		prefer.commit('enableAbsoluteTime', store.s.enableAbsoluteTime);
		prefer.commit('enableMarkByDate', store.s.enableMarkByDate);
		prefer.commit('showReplyTargetNote', store.s.showReplyTargetNote);
		prefer.commit('showReplyTargetNoteInSemiTransparent', store.s.showReplyTargetNoteInSemiTransparent);
		prefer.commit('nsfwOpenBehavior', store.s.nsfwOpenBehavior);

		// - Settings/Navigation bar
		prefer.commit('bannerDisplay', store.s.bannerDisplay);

		// - Settings/Timeline
		prefer.commit('enableHomeTimeline', store.s.enableHomeTimeline);
		prefer.commit('enableLocalTimeline', store.s.enableLocalTimeline);
		prefer.commit('enableSocialTimeline', store.s.enableSocialTimeline);
		prefer.commit('enableGlobalTimeline', store.s.enableGlobalTimeline);
		prefer.commit('enableBubbleTimeline', store.s.enableBubbleTimeline);
		prefer.commit('enableListTimeline', store.s.enableListTimeline);
		prefer.commit('enableAntennaTimeline', store.s.enableAntennaTimeline);
		prefer.commit('enableChannelTimeline', store.s.enableChannelTimeline);

		// - Settings/Sounds & Vibrations
		prefer.commit('vibrate', store.s.vibrate);
		prefer.commit('vibrate.on.note', store.s.vibrate_note);
		prefer.commit('vibrate.on.notification', store.s.vibrate_notification);
		prefer.commit('vibrate.on.system', store.s.vibrate_system);

		// - Settings/CherryPick
		prefer.commit('nicknameEnabled', store.s.nicknameEnabled);
		prefer.commit('nicknameMap', store.s.nicknameMap);
		prefer.commit('useEnterToSend', store.s.useEnterToSend);
		prefer.commit('postFormVisibilityHotkey', store.s.postFormVisibilityHotkey);
		prefer.commit('showRenoteConfirmPopup', store.s.showRenoteConfirmPopup);
		prefer.commit('expandOnNoteClick', store.s.expandOnNoteClick);
		prefer.commit('expandOnNoteClickBehavior', store.s.expandOnNoteClickBehavior);
		prefer.commit('displayHeaderNavBarWhenScroll', store.s.displayHeaderNavBarWhenScroll);
		prefer.commit('reactableRemoteReactionEnabled', store.s.reactableRemoteReactionEnabled);
		prefer.commit('showFollowingMessageInsteadOfButtonEnabled', store.s.showFollowingMessageInsteadOfButtonEnabled);
		prefer.commit('mobileHeaderChange', store.s.mobileHeaderChange);
		prefer.commit('renameTheButtonInPostFormToNya', store.s.renameTheButtonInPostFormToNya);
		prefer.commit('renameTheButtonInPostFormToNyaManualSet', store.s.renameTheButtonInPostFormToNyaManualSet);
		prefer.commit('enableWidgetsArea', store.s.enableWidgetsArea);
		prefer.commit('friendlyUiEnableNotificationsArea', store.s.friendlyUiEnableNotificationsArea);
		prefer.commit('enableLongPressOpenAccountMenu', store.s.enableLongPressOpenAccountMenu);
		prefer.commit('friendlyUiShowAvatarDecorationsInNavBtn', store.s.friendlyUiShowAvatarDecorationsInNavBtn);
		// #endregion

		window.setTimeout(() => {
			unisonReload();
		}, 10000);
	});
}
