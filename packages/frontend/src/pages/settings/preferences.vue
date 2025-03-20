<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/preferences" :label="i18n.ts.preferences" :keywords="['general', 'preferences']" icon="ti ti-adjustments">
	<div class="_gaps_m">
		<SearchMarker :keywords="['language']">
			<MkSelect v-model="lang">
				<template #label><SearchLabel>{{ i18n.ts.uiLanguage }}</SearchLabel></template>
				<option v-for="x in langs" :key="x[0]" :value="x[0]">{{ x[1] }}</option>
				<template #caption>
					<I18n :src="i18n.ts.i18nInfo" tag="span">
						<template #link>
							<MkLink url="https://crowdin.com/project/misskey">Crowdin</MkLink>
						</template>
					</I18n>
				</template>
			</MkSelect>
		</SearchMarker>

		<SearchMarker :keywords="['device', 'type', 'kind', 'smartphone', 'tablet', 'desktop']">
			<MkRadios v-model="overridedDeviceKind">
				<template #label><SearchLabel>{{ i18n.ts.overridedDeviceKind }}</SearchLabel></template>
				<option :value="null">{{ i18n.ts.auto }}</option>
				<option value="smartphone"><i class="ti ti-device-mobile"/> {{ i18n.ts.smartphone }}</option>
				<option value="tablet"><i class="ti ti-device-tablet"/> {{ i18n.ts.tablet }}</option>
				<option value="desktop"><i class="ti ti-device-desktop"/> {{ i18n.ts.desktop }}</option>
			</MkRadios>
		</SearchMarker>

		<FormSection>
			<div class="_gaps_s">
				<SearchMarker :keywords="['post', 'form', 'timeline']">
					<MkPreferenceContainer k="showFixedPostForm">
						<MkSwitch v-model="showFixedPostForm">
							<template #label><SearchLabel>{{ i18n.ts.showFixedPostForm }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['post', 'form', 'timeline', 'channel']">
					<MkPreferenceContainer k="showFixedPostFormInChannel">
						<MkSwitch v-model="showFixedPostFormInChannel">
							<template #label><SearchLabel>{{ i18n.ts.showFixedPostFormInChannel }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['post', 'form', 'replies', 'note']">
					<MkPreferenceContainer k="showFixedPostFormInReplies">
						<MkSwitch v-model="showFixedPostFormInReplies">
							<template #label><SearchLabel>{{ i18n.ts.showFixedPostFormInReplies }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							<template #caption><SearchKeyword>{{ i18n.ts.showFixedPostFormInRepliesDescription }}</SearchKeyword></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['pinned', 'list']">
					<MkFolder>
						<template #label><SearchLabel>{{ i18n.ts.pinnedList }}</SearchLabel></template>
						<!-- 複数ピン止め管理できるようにしたいけどめんどいので一旦ひとつのみ -->
						<MkButton v-if="prefer.r.pinnedUserLists.value.length === 0" @click="setPinnedList()">{{ i18n.ts.add }}</MkButton>
						<MkButton v-else danger @click="removePinnedList()"><i class="ti ti-trash"></i> {{ i18n.ts.remove }}</MkButton>
					</MkFolder>
				</SearchMarker>

				<MkDisableSection :disabled="!advancedMfm">
					<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'advanced', 'picker', 'form', 'function', 'fn']">
						<MkPreferenceContainer k="enableQuickAddMfmFunction">
							<MkSwitch v-model="enableQuickAddMfmFunction">
								<template #label><SearchLabel>{{ i18n.ts.enableQuickAddMfmFunction }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>
				</MkDisableSection>
			</div>
		</FormSection>

		<FormSection>
			<div class="_gaps_s">
				<SearchMarker :keywords="['remember', 'keep', 'note', 'visibility']">
					<MkPreferenceContainer k="rememberNoteVisibility">
						<MkSwitch v-model="rememberNoteVisibility">
							<template #label><SearchLabel>{{ i18n.ts.rememberNoteVisibility }}</SearchLabel></template>
						</MkSwitch>
					</MkPreferenceContainer>
				</SearchMarker>

				<SearchMarker :keywords="['default', 'note', 'visibility']">
					<MkDisableSection :disabled="rememberNoteVisibility">
						<MkFolder>
							<template #label><SearchLabel>{{ i18n.ts.defaultNoteVisibility }}</SearchLabel></template>
							<template v-if="defaultNoteVisibility === 'public'" #suffix>{{ i18n.ts._visibility.public }}</template>
							<template v-else-if="defaultNoteVisibility === 'home'" #suffix>{{ i18n.ts._visibility.home }}</template>
							<template v-else-if="defaultNoteVisibility === 'followers'" #suffix>{{ i18n.ts._visibility.followers }}</template>
							<template v-else-if="defaultNoteVisibility === 'specified'" #suffix>{{ i18n.ts._visibility.specified }}</template>

							<div class="_gaps_s">
								<MkPreferenceContainer k="defaultNoteVisibility">
									<MkSelect v-model="defaultNoteVisibility">
										<option value="public">{{ i18n.ts._visibility.public }}</option>
										<option value="home">{{ i18n.ts._visibility.home }}</option>
										<option value="followers">{{ i18n.ts._visibility.followers }}</option>
										<option value="specified">{{ i18n.ts._visibility.specified }}</option>
									</MkSelect>
								</MkPreferenceContainer>

								<MkPreferenceContainer k="defaultNoteLocalOnly">
									<MkSwitch v-model="defaultNoteLocalOnly">{{ i18n.ts._visibility.disableFederation }}</MkSwitch>
								</MkPreferenceContainer>
							</div>
						</MkFolder>
					</MkDisableSection>
				</SearchMarker>
			</div>
		</FormSection>

		<SearchMarker :keywords="['note']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.note }}</SearchLabel></template>

				<div class="_gaps_m">
					<div class="_gaps_s">
						<SearchMarker :keywords="['force', 'collapse', 'renote']">
							<MkPreferenceContainer k="forceCollapseAllRenotes">
								<MkSwitch v-model="forceCollapseAllRenotes">
									<template #label><SearchLabel>{{ i18n.ts.forceCollapseAllRenotes }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts.forceCollapseAllRenotesDescription }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'renote']">
							<MkPreferenceContainer k="collapseRenotes">
								<MkSwitch v-model="collapseRenotes">
									<template #label><SearchLabel>{{ i18n.ts.collapseRenotes }}</SearchLabel></template>
									<template #caption><SearchKeyword>{{ i18n.ts.collapseRenotesDescription }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'reply', 'replies']">
							<MkPreferenceContainer k="collapseReplies">
								<MkSwitch v-model="collapseReplies">
									<template #label><SearchLabel>{{ i18n.ts.collapseReplies }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts.collapseRepliesDescription }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'long', 'note', 'content']">
							<MkPreferenceContainer k="collapseLongNoteContent">
								<MkSwitch v-model="collapseLongNoteContent">
									<template #label><SearchLabel>{{ i18n.ts.collapseLongNoteContent }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'note']">
							<MkPreferenceContainer k="collapseDefault">
								<MkSwitch v-model="collapseDefault">
									<template #label><SearchLabel>{{ i18n.ts.collapseDefault }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['media', 'note', 'collapse']">
							<MkPreferenceContainer k="allMediaNoteCollapse">
								<MkSwitch v-model="allMediaNoteCollapse">
									<template #label><SearchLabel>{{ i18n.ts.allMediaNoteCollapse }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['hover', 'show', 'footer', 'action']">
							<MkPreferenceContainer k="showNoteActionsOnlyHover">
								<MkSwitch v-model="showNoteActionsOnlyHover">
									<template #label><SearchLabel>{{ i18n.ts.showNoteActionsOnlyHover }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['footer', 'action', 'clip', 'show']">
							<MkPreferenceContainer k="showClipButtonInNoteFooter">
								<MkSwitch v-model="showClipButtonInNoteFooter">
									<template #label><SearchLabel>{{ i18n.ts.showClipButtonInNoteFooter }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['footer', 'action', 'sub', 'note', 'show']">
							<MkPreferenceContainer k="showSubNoteFooterButton">
								<MkSwitch v-model="showSubNoteFooterButton">
									<template #label><SearchLabel>{{ i18n.ts.showSubNoteFooterButton }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts.showSubNoteFooterButtonDescription }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['footer', 'action', 'info', 'note', 'enable']">
							<MkPreferenceContainer k="infoButtonForNoteActionsEnabled">
								<MkSwitch v-model="infoButtonForNoteActionsEnabled">
									<template #label><SearchLabel>{{ i18n.ts.infoButtonForNoteActions }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts.infoButtonForNoteActionsDescription }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['note', 'action', 'translate', 'show']">
							<MkPreferenceContainer k="showTranslateButtonInNote">
								<MkSwitch v-model="showTranslateButtonInNote">
									<template #label><SearchLabel>{{ i18n.ts.showTranslateButtonInNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<div class="_gaps_s" style="margin: 15px 10px;">
							<div style="font-weight: bold; padding: 0.5em 0 0 0; margin: 0 0 8px 0;">{{ i18n.ts.noteFooterButton }} <span class="_beta" style="vertical-align: middle;">CherryPick</span></div>

							<SearchMarker :keywords="['reply']">
								<MkPreferenceContainer k="showReplyButtonInNoteFooter">
									<MkSwitch v-model="showReplyButtonInNoteFooter">
										<template #label><i class="ti ti-arrow-back-up"></i> <SearchLabel>{{ i18n.ts.reply }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['renote']">
								<MkPreferenceContainer k="showRenoteButtonInNoteFooter">
									<MkSwitch v-model="showRenoteButtonInNoteFooter">
										<template #label><i class="ti ti-repeat"></i> <SearchLabel>{{ i18n.ts.renote }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['like']">
								<MkPreferenceContainer k="showLikeButtonInNoteFooter">
									<MkSwitch v-model="showLikeButtonInNoteFooter">
										<template #label><i class="ti ti-heart"></i> <SearchLabel>{{ i18n.ts.like }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['reaction', 'react']">
								<MkPreferenceContainer k="showDoReactionButtonInNoteFooter">
									<MkSwitch v-model="showDoReactionButtonInNoteFooter">
										<template #label><i class="ti ti-mood-plus"></i> <SearchLabel>{{ i18n.ts.doReaction }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['quote']">
								<MkPreferenceContainer k="showQuoteButtonInNoteFooter">
									<MkSwitch v-model="showQuoteButtonInNoteFooter">
										<template #label><i class="ti ti-quote"></i> <SearchLabel>{{ i18n.ts.quote }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['more']">
								<MkPreferenceContainer k="showMoreButtonInNoteFooter">
									<MkSwitch v-model="showMoreButtonInNoteFooter">
										<template #label><i class="ti ti-dots"></i> <SearchLabel>{{ i18n.ts.more }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['like', 'select', 'reaction', 'react']">
								<MkFolder>
									<template #label><i class="ti ti-heart"></i> <SearchLabel>{{ i18n.ts.like }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
									<div class="_gaps_m">
										<MkPreferenceContainer k="selectReaction">
											<FromSlot v-model="selectReaction">
												<template #label>{{ i18n.ts.selectReaction }}</template>
												<MkCustomEmoji v-if="selectReaction && selectReaction.startsWith(':')" style="max-height: 3em; font-size: 1.1em;" :useOriginalSize="false" :name="selectReaction" :normal="true" :noStyle="true"/>
												<MkEmoji v-else-if="selectReaction && !selectReaction.startsWith(':')" :emoji="selectReaction" style="max-height: 3em; font-size: 1.1em;" :normal="true" :noStyle="true"/>
												<span v-else-if="!selectReaction">{{ i18n.ts.notSet }}</span>
												<div class="_buttons" style="padding-top: 8px;">
													<MkButton rounded :small="true" inline @click="chooseNewReaction"><i class="ti ti-pencil"></i> {{ i18n.ts.edit }}</MkButton>
													<MkButton rounded :small="true" inline danger @click="resetReaction"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>
												</div>
											</FromSlot>
										</MkPreferenceContainer>
									</div>
								</MkFolder>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['renote', 'quote', 'separation', 'note']">
							<MkPreferenceContainer k="renoteQuoteButtonSeparation">
								<MkSwitch v-model="renoteQuoteButtonSeparation">
									<template #label><SearchLabel>{{ i18n.ts.renoteQuoteButtonSeparation }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['renote', 'visibility', 'selection', 'note']">
							<MkPreferenceContainer k="renoteVisibilitySelection">
								<MkSwitch v-model="renoteVisibilitySelection">
									<template #label><SearchLabel>{{ i18n.ts.showRenoteVisibilitySelector }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<MkDisableSection :disabled="renoteVisibilitySelection">
							<SearchMarker :keywords="['force', 'renote', 'visibility', 'selection', 'note']">
								<MkPreferenceContainer k="forceRenoteVisibilitySelection">
									<MkSelect v-model="forceRenoteVisibilitySelection">
										<template #label><SearchLabel>{{ i18n.ts.forceRenoteVisibilitySelector }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										<option value="none">{{ i18n.ts.auto }}</option>
										<option value="public">{{ i18n.ts._visibility.public }}</option>
										<option value="home">{{ i18n.ts._visibility.home }}</option>
										<option value="followers">{{ i18n.ts._visibility.followers }}</option>
									</MkSelect>
								</MkPreferenceContainer>
							</SearchMarker>
						</MkDisableSection>

						<SearchMarker :keywords="['show', 'alt', 'text', 'warning']">
							<MkPreferenceContainer k="showNoAltTextWarning">
								<MkSwitch v-model="showNoAltTextWarning">
									<template #label><SearchLabel>{{ i18n.ts.showNoAltWarning }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts.showNoAltWarningDescription }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['always', 'show', 'cw', 'nsfw']">
							<MkPreferenceContainer k="alwaysShowCw">
								<MkSwitch v-model="alwaysShowCw">
									<template #label><SearchLabel>{{ i18n.ts.alwaysShowCw }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'advanced']">
							<MkPreferenceContainer k="advancedMfm">
								<MkSwitch v-model="advancedMfm">
									<template #label><SearchLabel>{{ i18n.ts.enableAdvancedMfm }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['reaction', 'count', 'show']">
							<MkPreferenceContainer k="showReactionsCount">
								<MkSwitch v-model="showReactionsCount">
									<template #label><SearchLabel>{{ i18n.ts.showReactionsCount }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['image', 'photo', 'picture', 'media', 'thumbnail', 'quality', 'raw', 'attachment']">
							<MkPreferenceContainer k="loadRawImages">
								<MkSwitch v-model="loadRawImages">
									<template #label><SearchLabel>{{ i18n.ts.loadRawImages }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>
					</div>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['notification']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.notifications }}</SearchLabel></template>

				<div class="_gaps_s">
					<SearchMarker :keywords="['group']">
						<MkPreferenceContainer k="useGroupedNotifications">
							<MkSwitch v-model="useGroupedNotifications">
								<template #label><SearchLabel>{{ i18n.ts.useGroupedNotifications }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['show', 'reply', 'notification', 'note']">
						<MkPreferenceContainer k="showReplyInNotification">
							<MkSwitch v-model="showReplyInNotification">
								<template #label><SearchLabel>{{ i18n.ts.showReplyInNotification }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['behavior']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.behavior }}</SearchLabel></template>

				<div class="_gaps_m">
					<div class="_gaps_s">
						<SearchMarker :keywords="['image', 'photo', 'picture', 'media', 'thumbnail', 'new', 'tab']">
							<MkPreferenceContainer k="imageNewTab">
								<MkSwitch v-model="imageNewTab">
									<template #label><SearchLabel>{{ i18n.ts.openImageInNewTab }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['reaction', 'picker', 'contextmenu', 'open']">
							<MkPreferenceContainer k="useReactionPickerForContextMenu">
								<MkSwitch v-model="useReactionPickerForContextMenu">
									<template #label><SearchLabel>{{ i18n.ts.useReactionPickerForContextMenu }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['load', 'auto', 'more']">
							<MkPreferenceContainer k="enableInfiniteScroll">
								<MkSwitch v-model="enableInfiniteScroll">
									<template #label><SearchLabel>{{ i18n.ts.enableInfiniteScroll }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['disable', 'streaming', 'timeline']">
							<MkPreferenceContainer k="disableStreamingTimeline">
								<MkSwitch v-model="disableStreamingTimeline">
									<template #label><SearchLabel>{{ i18n.ts.disableStreamingTimeline }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['follow', 'confirm', 'always']">
							<MkPreferenceContainer k="alwaysConfirmFollow">
								<MkSwitch v-model="alwaysConfirmFollow">
									<template #label><SearchLabel>{{ i18n.ts.alwaysConfirmFollow }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['sensitive', 'nsfw', 'media', 'image', 'photo', 'picture', 'attachment', 'confirm']">
							<MkPreferenceContainer k="confirmWhenRevealingSensitiveMedia">
								<MkSwitch v-model="confirmWhenRevealingSensitiveMedia">
									<template #label><SearchLabel>{{ i18n.ts.confirmWhenRevealingSensitiveMedia }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['reaction', 'confirm']">
							<MkPreferenceContainer k="confirmOnReact">
								<MkSwitch v-model="confirmOnReact">
									<template #label><SearchLabel>{{ i18n.ts.confirmOnReact }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['remember', 'keep', 'note', 'cw']">
							<MkPreferenceContainer k="keepCw">
								<MkSwitch v-model="keepCw">
									<template #label><SearchLabel>{{ i18n.ts.keepCw }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['auto', 'load', 'more', 'reply', 'replies']">
							<MkPreferenceContainer k="autoLoadMoreReplies">
								<MkSwitch v-model="autoLoadMoreReplies">
									<template #label><SearchLabel>{{ i18n.ts.autoLoadMoreReplies }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['auto', 'load', 'more', 'conversation']">
							<MkPreferenceContainer k="autoLoadMoreConversation">
								<MkSwitch v-model="autoLoadMoreConversation">
									<template #label><SearchLabel>{{ i18n.ts.autoLoadMoreConversation }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['auto', 'translate']">
							<MkPreferenceContainer k="useAutoTranslate">
								<MkSwitch v-model="useAutoTranslate" @update:modelValue="learnMoreAutoTranslate">
									<template #label><SearchLabel>{{ i18n.ts.useAutoTranslate }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template v-if="!$i?.policies.canUseAutoTranslate" #caption>{{ i18n.ts.cannotBeUsedFunc }} <a class="_link" @click="learnMoreCantUseAutoTranslate">{{ i18n.ts.learnMore }}</a></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['welcome', 'toast']">
							<MkPreferenceContainer k="welcomeBackToast">
								<MkSwitch v-model="welcomeBackToast">
									<template #label><SearchLabel>{{ i18n.ts.welcomeBackToast }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['disable', 'nyaize', 'note']">
							<MkPreferenceContainer k="disableNyaize">
								<MkSwitch v-model="disableNyaize">
									<template #label><SearchLabel>{{ i18n.ts.noNyaization }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>
					</div>

					<SearchMarker :keywords="['server', 'disconnect', 'reconnect', 'reload', 'streaming']">
						<MkPreferenceContainer k="serverDisconnectedBehavior">
							<MkSelect v-model="serverDisconnectedBehavior">
								<template #label><SearchLabel>{{ i18n.ts.whenServerDisconnected }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
								<option value="reload">{{ i18n.ts._serverDisconnectedBehavior.reload }}</option>
								<option value="dialog">{{ i18n.ts._serverDisconnectedBehavior.dialog }}</option>
								<option value="quiet">{{ i18n.ts._serverDisconnectedBehavior.quiet }}</option>
								<option value="none">{{ i18n.ts._serverDisconnectedBehavior.none }}</option>
							</MkSelect>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['refresh']">
						<MkPreferenceContainer k="requireRefreshBehavior">
							<MkSelect v-model="requireRefreshBehavior">
								<template #label><SearchLabel>{{ i18n.ts.requireRefresh }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
								<option value="dialog">{{ i18n.ts._requireRefreshBehavior.dialog }}</option>
								<option value="quiet">{{ i18n.ts._requireRefreshBehavior.quiet }}</option>
							</MkSelect>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['note', 'receive', 'notification']">
						<MkPreferenceContainer k="newNoteReceivedNotificationBehavior">
							<MkSelect v-model="newNoteReceivedNotificationBehavior">
								<template #label><SearchLabel>{{ i18n.ts.newNoteReceivedNotification }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
								<option value="default">{{ i18n.ts._newNoteReceivedNotificationBehavior.default }}</option>
								<option value="count">{{ i18n.ts._newNoteReceivedNotificationBehavior.count }}</option>
								<option value="none">{{ i18n.ts._newNoteReceivedNotificationBehavior.none }}</option>
							</MkSelect>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['cache', 'page']">
						<MkPreferenceContainer k="numberOfPageCache">
							<MkRange v-model="numberOfPageCache" :min="1" :max="10" :step="1" easing>
								<template #label><SearchLabel>{{ i18n.ts.numberOfPageCache }}</SearchLabel></template>
								<template #caption>{{ i18n.ts.numberOfPageCacheDescription }}</template>
							</MkRange>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :label="i18n.ts.dataSaver" :keywords="['datasaver']">
						<MkFolder>
							<template #label><SearchLabel>{{ i18n.ts.dataSaver }}</SearchLabel></template>

							<div class="_gaps_m">
								<MkInfo>{{ i18n.ts.reloadRequiredToApplySettings }}</MkInfo>

								<div class="_buttons">
									<MkButton inline @click="enableAllDataSaver">{{ i18n.ts.enableAll }}</MkButton>
									<MkButton inline @click="disableAllDataSaver">{{ i18n.ts.disableAll }}</MkButton>
								</div>
								<div class="_gaps_m">
									<MkSwitch v-model="dataSaver.media">
										{{ i18n.ts._dataSaver._media.title }}
										<template #caption>{{ i18n.ts._dataSaver._media.description }}</template>
									</MkSwitch>
									<MkSwitch v-model="dataSaver.avatar">
										{{ i18n.ts._dataSaver._avatar.title }}
										<template #caption>{{ i18n.ts._dataSaver._avatar.description }}</template>
									</MkSwitch>
									<MkSwitch v-model="dataSaver.urlPreview">
										{{ i18n.ts._dataSaver._urlPreview.title }}
										<template #caption>{{ i18n.ts._dataSaver._urlPreview.description }}</template>
									</MkSwitch>
									<MkSwitch v-model="dataSaver.code">
										{{ i18n.ts._dataSaver._code.title }}
										<template #caption>{{ i18n.ts._dataSaver._code.description }}</template>
									</MkSwitch>
								</div>
							</div>
						</MkFolder>
					</SearchMarker>

					<SearchMarker :label="i18n.ts._externalNavigationWarning.externalNavigationWarning" :keywords="['external', 'navigation', 'warning']">
						<MkFolder>
							<template #label><SearchLabel>{{ i18n.ts._externalNavigationWarning.externalNavigationWarning }}</SearchLabel> <span class="_beta">CherryPick</span></template>

							<div class="_gaps_m">
								<div class="_gaps_m">
									<MkSwitch v-model="externalNavigationWarning">
										<template #label><SearchLabel>{{ i18n.ts._externalNavigationWarning.enableExternalNavigationWarning }}</SearchLabel></template>
									</MkSwitch>
									<MkTextarea v-model="trustedDomains">
										<template #label><SearchLabel>{{ i18n.ts._externalNavigationWarning.trustedDomainList }}</SearchLabel></template>
										<template #caption>
											<i class="ti ti-alert-triangle" style="color: var(--MI_THEME-warn);"></i>
											<SearchKeyword>{{ i18n.ts._externalNavigationWarning.trustedDomainListDescription }}<br>{{ i18n.ts._externalNavigationWarning.trustedDomainListDescription2 }}</SearchKeyword>
										</template>
									</MkTextarea>
									<div class="_buttons">
										<MkButton primary :disabled="!trustedDomainsChanged" @click="trustedDomainsSave()"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
										<MkButton :disabled="!prefer.r.trustedDomains.value.length" danger @click="removeTrustedDomains"><i class="ti ti-trash"></i> {{ i18n.ts._externalNavigationWarning.deleteTrustedDomainList }}</MkButton>
									</div>
								</div>
							</div>
						</MkFolder>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker>
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.other }}</SearchLabel></template>

				<div class="_gaps">
					<SearchMarker :keywords="['ad', 'show']">
						<MkPreferenceContainer k="forceShowAds">
							<MkSwitch v-model="forceShowAds">
								<template #label><SearchLabel>{{ i18n.ts.forceShowAds }}</SearchLabel></template>
							</MkSwitch>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker>
						<MkPreferenceContainer k="hemisphere">
							<MkRadios v-model="hemisphere">
								<template #label><SearchLabel>{{ i18n.ts.hemisphere }}</SearchLabel></template>
								<option value="N">{{ i18n.ts._hemisphere.N }}</option>
								<option value="S">{{ i18n.ts._hemisphere.S }}</option>
								<template #caption>{{ i18n.ts._hemisphere.caption }}</template>
							</MkRadios>
						</MkPreferenceContainer>
					</SearchMarker>

					<SearchMarker :keywords="['search', 'engine']">
						<MkPreferenceContainer k="searchEngine">
							<MkSelect v-model="searchEngine">
								<template #label><SearchLabel>{{ i18n.ts._searchSite.title }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template #caption><SearchKeyword>{{ i18n.ts._searchSite.description }}</SearchKeyword></template>
								<option value="google">Google</option>
								<option value="bing">Bing</option>
								<option value="yahoo">Yahoo</option>
								<option value="baidu">Baidu</option>
								<option value="naver">NAVER</option>
								<option value="daum">Daum</option>
								<option value="duckduckgo">DuckDuckGo</option>
								<option value="other">{{ i18n.ts.other }}</option>
							</MkSelect>
						</MkPreferenceContainer>

						<template v-if="prefer.s.searchEngine == 'other'">
							<SearchMarker>
								<MkInput v-model="searchEngineUrl">
									<template #label><SearchLabel>{{ i18n.ts._searchSite.otherSearchEngine }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts._searchSite.otherDescription }}</SearchKeyword></template>
								</MkInput>
							</SearchMarker>

							<SearchMarker>
								<MkInput v-model="searchEngineUrlQuery">
									<template #label><SearchLabel>{{ i18n.ts._searchSite.query }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts._searchSite.queryDescription }}</SearchKeyword></template>
								</MkInput>
							</SearchMarker>
						</template>
					</SearchMarker>

					<SearchMarker :keywords="['emoji', 'dictionary', 'additional', 'extra']">
						<MkFolder>
							<template #label><SearchLabel>{{ i18n.ts.additionalEmojiDictionary }}</SearchLabel></template>
							<div class="_buttons">
								<template v-for="lang in emojiIndexLangs" :key="lang">
									<MkButton v-if="store.r.additionalUnicodeEmojiIndexes.value[lang]" danger @click="removeEmojiIndex(lang)"><i class="ti ti-trash"></i> {{ i18n.ts.remove }} ({{ getEmojiIndexLangName(lang) }})</MkButton>
									<MkButton v-else @click="downloadEmojiIndex(lang)"><i class="ti ti-download"></i> {{ getEmojiIndexLangName(lang) }}{{ store.r.additionalUnicodeEmojiIndexes.value[lang] ? ` (${ i18n.ts.installed })` : '' }}</MkButton>
								</template>
							</div>
						</MkFolder>
					</SearchMarker>

					<FormLink to="/settings/navbar">{{ i18n.ts.navbar }}</FormLink>
					<FormLink to="/settings/statusbar">{{ i18n.ts.statusbar }}</FormLink>
				</div>
			</FormSection>
		</SearchMarker>

		<FormSection>
			<div class="_gaps">
				<FormLink to="/settings/deck">{{ i18n.ts.deck }}</FormLink>
			</div>
		</FormSection>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { langs } from '@@/js/config.js';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkRange from '@/components/MkRange.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import FormLink from '@/components/form/link.vue';
import MkLink from '@/components/MkLink.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import MkDisableSection from '@/components/MkDisableSection.vue';
import { store } from '@/store.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { miLocalStorage } from '@/local-storage.js';
import { prefer } from '@/preferences.js';
import { globalEvents } from '@/events.js';
import { $i } from '@/account.js';

const lang = ref(miLocalStorage.getItem('lang'));
const dataSaver = ref(prefer.s.dataSaver);
const trustedDomains = ref(prefer.s.trustedDomains.join('\n'));

const overridedDeviceKind = prefer.model('overridedDeviceKind');
const keepCw = prefer.model('keepCw');
const serverDisconnectedBehavior = prefer.model('serverDisconnectedBehavior');
const hemisphere = prefer.model('hemisphere');
const showNoteActionsOnlyHover = prefer.model('showNoteActionsOnlyHover');
const showClipButtonInNoteFooter = prefer.model('showClipButtonInNoteFooter');
const collapseRenotes = prefer.model('collapseRenotes');
const advancedMfm = prefer.model('advancedMfm');
const showReactionsCount = prefer.model('showReactionsCount');
const enableQuickAddMfmFunction = prefer.model('enableQuickAddMfmFunction');
const forceShowAds = prefer.model('forceShowAds');
const loadRawImages = prefer.model('loadRawImages');
const imageNewTab = prefer.model('imageNewTab');
const showFixedPostForm = prefer.model('showFixedPostForm');
const showFixedPostFormInChannel = prefer.model('showFixedPostFormInChannel');
const numberOfPageCache = prefer.model('numberOfPageCache');
const enableInfiniteScroll = prefer.model('enableInfiniteScroll');
const useReactionPickerForContextMenu = prefer.model('useReactionPickerForContextMenu');
const disableStreamingTimeline = prefer.model('disableStreamingTimeline');
const useGroupedNotifications = prefer.model('useGroupedNotifications');
const alwaysConfirmFollow = prefer.model('alwaysConfirmFollow');
const confirmWhenRevealingSensitiveMedia = prefer.model('confirmWhenRevealingSensitiveMedia');
const confirmOnReact = prefer.model('confirmOnReact');
const contextMenu = prefer.model('contextMenu');
const defaultNoteVisibility = prefer.model('defaultNoteVisibility');
const defaultNoteLocalOnly = prefer.model('defaultNoteLocalOnly');
const rememberNoteVisibility = prefer.model('rememberNoteVisibility');

const forceCollapseAllRenotes = prefer.model('forceCollapseAllRenotes');
const collapseReplies = prefer.model('collapseReplies');
const collapseLongNoteContent = prefer.model('collapseLongNoteContent');
const collapseDefault = prefer.model('collapseDefault');
const allMediaNoteCollapse = prefer.model('allMediaNoteCollapse');
const showSubNoteFooterButton = prefer.model('showSubNoteFooterButton');
const infoButtonForNoteActionsEnabled = prefer.model('infoButtonForNoteActionsEnabled');
const showTranslateButtonInNote = prefer.model('showTranslateButtonInNote');
const showReplyButtonInNoteFooter = prefer.model('showReplyButtonInNoteFooter');
const showRenoteButtonInNoteFooter = prefer.model('showRenoteButtonInNoteFooter');
const showLikeButtonInNoteFooter = prefer.model('showLikeButtonInNoteFooter');
const showDoReactionButtonInNoteFooter = prefer.model('showDoReactionButtonInNoteFooter');
const showQuoteButtonInNoteFooter = prefer.model('showQuoteButtonInNoteFooter');
const showMoreButtonInNoteFooter = prefer.model('showMoreButtonInNoteFooter');
const selectReaction = prefer.model('selectReaction');
const showReplyInNotification = prefer.model('showReplyInNotification');
const renoteQuoteButtonSeparation = prefer.model('renoteQuoteButtonSeparation');
const renoteVisibilitySelection = prefer.model('renoteVisibilitySelection');
const forceRenoteVisibilitySelection = prefer.model('forceRenoteVisibilitySelection');
const showFixedPostFormInReplies = prefer.model('showFixedPostFormInReplies');
const showNoAltTextWarning = prefer.model('showNoAltTextWarning');
const alwaysShowCw = prefer.model('alwaysShowCw');
const autoLoadMoreReplies = prefer.model('autoLoadMoreReplies');
const autoLoadMoreConversation = prefer.model('autoLoadMoreConversation');
const useAutoTranslate = prefer.model('useAutoTranslate');
const welcomeBackToast = prefer.model('welcomeBackToast');
const disableNyaize = prefer.model('disableNyaize');
const requireRefreshBehavior = prefer.model('requireRefreshBehavior');
const newNoteReceivedNotificationBehavior = prefer.model('newNoteReceivedNotificationBehavior');
const externalNavigationWarning = prefer.model('externalNavigationWarning');
const searchEngine = prefer.model('searchEngine');
const searchEngineUrl = prefer.model('searchEngineUrl');
const searchEngineUrlQuery = prefer.model('searchEngineUrlQuery');

watch(lang, () => {
	miLocalStorage.setItem('lang', lang.value as string);
	miLocalStorage.removeItem('locale');
	miLocalStorage.removeItem('localeVersion');
});

watch([
	hemisphere,
	lang,
	showNoteActionsOnlyHover,
	overridedDeviceKind,
	disableStreamingTimeline,
	alwaysConfirmFollow,
	confirmWhenRevealingSensitiveMedia,
	contextMenu,
	showFixedPostFormInReplies,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch([
	collapseLongNoteContent,
	collapseDefault,
	showNoteActionsOnlyHover,
	showClipButtonInNoteFooter,
	showReplyInNotification,
	showTranslateButtonInNote,
	showSubNoteFooterButton,
	infoButtonForNoteActionsEnabled,
	renoteQuoteButtonSeparation,
	allMediaNoteCollapse,
	alwaysShowCw,
	showReplyButtonInNoteFooter,
	showRenoteButtonInNoteFooter,
	showLikeButtonInNoteFooter,
	showDoReactionButtonInNoteFooter,
	showQuoteButtonInNoteFooter,
	showMoreButtonInNoteFooter,
], () => {
	reloadTimeline();
	reloadNotification();
});

watch([
	enableInfiniteScroll,
	useAutoTranslate,
	disableNyaize,
	forceCollapseAllRenotes,
	collapseRenotes,
	collapseReplies,
], () => {
	reloadTimeline();
});

watch([
	showReplyInNotification,
], () => {
	reloadNotification();
});

const emojiIndexLangs = ['en-US', 'ja-JP', 'ja-JP_hira'] as const;

function getEmojiIndexLangName(targetLang: typeof emojiIndexLangs[number]) {
	if (langs.find(x => x[0] === targetLang)) {
		return langs.find(x => x[0] === targetLang)![1];
	} else {
		// 絵文字辞書限定の言語定義
		switch (targetLang) {
			case 'ja-JP_hira': return 'ひらがな';
			default: return targetLang;
		}
	}
}

function downloadEmojiIndex(lang: typeof emojiIndexLangs[number]) {
	async function main() {
		const currentIndexes = store.s.additionalUnicodeEmojiIndexes;

		function download() {
			switch (lang) {
				case 'en-US': return import('../../unicode-emoji-indexes/en-US.json').then(x => x.default);
				case 'ja-JP': return import('../../unicode-emoji-indexes/ja-JP.json').then(x => x.default);
				case 'ja-JP_hira': return import('../../unicode-emoji-indexes/ja-JP_hira.json').then(x => x.default);
				default: throw new Error('unrecognized lang: ' + lang);
			}
		}

		currentIndexes[lang] = await download();
		await store.set('additionalUnicodeEmojiIndexes', currentIndexes);
	}

	os.promiseDialog(main());
}

function removeEmojiIndex(lang: string) {
	async function main() {
		const currentIndexes = store.s.additionalUnicodeEmojiIndexes;
		delete currentIndexes[lang];
		await store.set('additionalUnicodeEmojiIndexes', currentIndexes);
	}

	os.promiseDialog(main());
}

async function setPinnedList() {
	const lists = await misskeyApi('users/lists/list');
	const { canceled, result: list } = await os.select({
		title: i18n.ts.selectList,
		items: lists.map(x => ({
			value: x, text: x.name,
		})),
	});
	if (canceled) return;
	if (list == null) return;

	prefer.commit('pinnedUserLists', [list]);
}

function removePinnedList() {
	prefer.commit('pinnedUserLists', []);
}

function enableAllDataSaver() {
	const g = { ...prefer.s.dataSaver };
	Object.keys(g).forEach((key) => { g[key] = true; });
	dataSaver.value = g;
}

function disableAllDataSaver() {
	const g = { ...prefer.s.dataSaver };
	Object.keys(g).forEach((key) => { g[key] = false; });
	dataSaver.value = g;
}

watch(dataSaver, (to) => {
	prefer.commit('dataSaver', to);
}, {
	deep: true,
});

function reloadTimeline() {
	globalEvents.emit('reloadTimeline');
}

function reloadNotification() {
	globalEvents.emit('reloadNotification');
}

function chooseNewReaction(ev: MouseEvent) {
	os.pickEmoji(getHTMLElement(ev), {
		showPinned: false,
	}).then(async (emoji) => {
		selectReaction.value = emoji as string; // 選択された絵文字を格納
	});
}

function resetReaction() {
	selectReaction.value = ''; // `selectReaction` をリセット
}

function getHTMLElement(ev: MouseEvent): HTMLElement {
	const target = ev.currentTarget ?? ev.target;
	return target as HTMLElement; // イベント発生元の HTML 要素を取得
}

async function learnMoreAutoTranslate() {
	if (!useAutoTranslate.value) return;

	const confirm = await os.confirm({
		type: 'warning',
		title: i18n.ts.useAutoTranslate,
		text: i18n.ts.useAutoTranslateDescription,
	});

	if (confirm.canceled) useAutoTranslate.value = false;
}

function learnMoreCantUseAutoTranslate() {
	os.alert({
		type: 'info',
		title: i18n.ts.useAutoTranslate,
		text: i18n.tsx.cantUseThisFunctionDescription({ name: i18n.ts.useAutoTranslate }),
		caption: i18n.tsx.cantUseThisFunctionCaption({ name: i18n.ts.useAutoTranslate }),
	});
}

function removeTrustedDomains() {
	async function main() {
		await prefer.commit('trustedDomains', []);

		// Refresh filtered list to signal to the user how they've been saved
		trustedDomains.value = '';
	}

	os.promiseDialog(main());
}

const trustedDomainsChanged = ref(false);

async function trustedDomainsSave() {
	async function main() {
		let domains = trustedDomains.value
			.trim().split('\n')
			.map(el => el.trim())
			.filter(el => el);

		await prefer.commit('trustedDomains', domains);
		trustedDomainsChanged.value = false;

		// Refresh filtered list to signal to the user how they've been saved
		trustedDomains.value = domains.join('\n');
	}

	await os.promiseDialog(main());
}

watch(trustedDomains, () => {
	trustedDomainsChanged.value = true;
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.general,
	icon: 'ti ti-adjustments',
}));
</script>
