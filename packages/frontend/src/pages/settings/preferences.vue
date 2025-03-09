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
					<MkSwitch v-model="showFixedPostForm">
						<template #label><SearchLabel>{{ i18n.ts.showFixedPostForm }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['post', 'form', 'timeline', 'channel']">
					<MkSwitch v-model="showFixedPostFormInChannel">
						<template #label><SearchLabel>{{ i18n.ts.showFixedPostFormInChannel }}</SearchLabel></template>
					</MkSwitch>
				</SearchMarker>

				<SearchMarker :keywords="['pinned', 'list']">
					<MkFolder>
						<template #label><SearchLabel>{{ i18n.ts.pinnedList }}</SearchLabel></template>
						<!-- 複数ピン止め管理できるようにしたいけどめんどいので一旦ひとつのみ -->
						<MkButton v-if="defaultStore.reactiveState.pinnedUserLists.value.length === 0" @click="setPinnedList()">{{ i18n.ts.add }}</MkButton>
						<MkButton v-else danger @click="removePinnedList()"><i class="ti ti-trash"></i> {{ i18n.ts.remove }}</MkButton>
					</MkFolder>
				</SearchMarker>

				<MkDisableSection :disabled="!advancedMfm">
					<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'advanced', 'picker', 'form', 'function', 'fn']">
						<MkSwitch v-model="enableQuickAddMfmFunction">
							<template #label><SearchLabel>{{ i18n.ts.enableQuickAddMfmFunction }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>
				</MkDisableSection>
			</div>
		</FormSection>

		<SearchMarker :keywords="['note']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.note }}</SearchLabel></template>

				<div class="_gaps_m">
					<div class="_gaps_s">
						<SearchMarker :keywords="['force', 'collapse', 'renote']">
							<MkSwitch v-model="forceCollapseAllRenotes">
								<template #label><SearchLabel>{{ i18n.ts.forceCollapseAllRenotes }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template #caption><SearchKeyword>{{ i18n.ts.forceCollapseAllRenotesDescription }}</SearchKeyword></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'renote']">
							<MkSwitch v-model="collapseRenotes">
								<template #label><SearchLabel>{{ i18n.ts.collapseRenotes }}</SearchLabel></template>
								<template #caption><SearchKeyword>{{ i18n.ts.collapseRenotesDescription }}</SearchKeyword></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'reply', 'replies']">
							<MkSwitch v-model="collapseReplies">
								<template #label><SearchLabel>{{ i18n.ts.collapseReplies }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template #caption><SearchKeyword>{{ i18n.ts.collapseRepliesDescription }}</SearchKeyword></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'long', 'note', 'content']">
							<MkSwitch v-model="collapseLongNoteContent">
								<template #label><SearchLabel>{{ i18n.ts.collapseLongNoteContent }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['collapse', 'note']">
							<MkSwitch v-model="collapseDefault">
								<template #label><SearchLabel>{{ i18n.ts.collapseDefault }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['media', 'note', 'collapse']">
							<MkSwitch v-model="allMediaNoteCollapse">
								<template #label><SearchLabel>{{ i18n.ts.allMediaNoteCollapse }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['hover', 'show', 'footer', 'action']">
							<MkSwitch v-model="showNoteActionsOnlyHover">
								<template #label><SearchLabel>{{ i18n.ts.showNoteActionsOnlyHover }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['footer', 'action', 'clip', 'show']">
							<MkSwitch v-model="showClipButtonInNoteFooter">
								<template #label><SearchLabel>{{ i18n.ts.showClipButtonInNoteFooter }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['footer', 'action', 'sub', 'note', 'show']">
							<MkSwitch v-model="showSubNoteFooterButton">
								<template #label><SearchLabel>{{ i18n.ts.showSubNoteFooterButton }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template #caption><SearchKeyword>{{ i18n.ts.showSubNoteFooterButtonDescription }}</SearchKeyword></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['footer', 'action', 'info', 'note', 'enable']">
							<MkSwitch v-model="infoButtonForNoteActionsEnabled">
								<template #label><SearchLabel>{{ i18n.ts.infoButtonForNoteActions }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template #caption><SearchKeyword>{{ i18n.ts.infoButtonForNoteActionsDescription }}</SearchKeyword></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['note', 'action', 'translate', 'show']">
							<MkSwitch v-model="showTranslateButtonInNote">
								<template #label><SearchLabel>{{ i18n.ts.showTranslateButtonInNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['footer', 'action', 'show']">
						</SearchMarker>

						<div class="_gaps_s" style="margin: 0 10px;">
							<div style="font-weight: bold; padding: 0.5em 0 0 0; margin: 0 0 8px 0;">{{ i18n.ts.noteFooterButton }} <span class="_beta" style="vertical-align: middle;">CherryPick</span></div>

							<SearchMarker :keywords="['reply']">
								<MkSwitch v-model="showReplyButtonInNoteFooter">
									<template #label><i class="ti ti-arrow-back-up"></i> <SearchLabel>{{ i18n.ts.reply }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['renote']">
								<MkSwitch v-model="showRenoteButtonInNoteFooter">
									<template #label><i class="ti ti-repeat"></i> <SearchLabel>{{ i18n.ts.renote }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['like']">
								<MkSwitch v-model="showLikeButtonInNoteFooter">
									<template #label><i class="ti ti-heart"></i> <SearchLabel>{{ i18n.ts.like }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['reaction', 'react']">
								<MkSwitch v-model="showDoReactionButtonInNoteFooter">
									<template #label><i class="ti ti-mood-plus"></i> <SearchLabel>{{ i18n.ts.doReaction }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['quote']">
								<MkSwitch v-model="showQuoteButtonInNoteFooter">
									<template #label><i class="ti ti-quote"></i> <SearchLabel>{{ i18n.ts.quote }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['more']">
								<MkSwitch v-model="showMoreButtonInNoteFooter">
									<template #label><i class="ti ti-dots"></i> <SearchLabel>{{ i18n.ts.more }}</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['like', 'select', 'reaction', 'react']">
								<MkFolder>
									<template #label><i class="ti ti-heart"></i> <SearchLabel>{{ i18n.ts.like }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
									<div class="_gaps_m">
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
									</div>
								</MkFolder>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['show', 'reply', 'notification', 'note']">
							<MkSwitch v-model="showReplyInNotification">
								<template #label><SearchLabel>{{ i18n.ts.showReplyInNotification }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['renote', 'quote', 'separation', 'note']">
							<MkSwitch v-model="renoteQuoteButtonSeparation">
								<template #label><SearchLabel>{{ i18n.ts.renoteQuoteButtonSeparation }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['renote', 'visibility', 'selection', 'note']">
							<MkSwitch v-model="renoteVisibilitySelection">
								<template #label><SearchLabel>{{ i18n.ts.showRenoteVisibilitySelector }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<MkDisableSection :disabled="renoteVisibilitySelection">
							<SearchMarker :keywords="['force', 'renote', 'visibility', 'selection', 'note']">
								<MkSelect v-model="forceRenoteVisibilitySelection">
									<template #label><SearchLabel>{{ i18n.ts.forceRenoteVisibilitySelector }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<option value="none">{{ i18n.ts.auto }}</option>
									<option value="public">{{ i18n.ts._visibility.public }}</option>
									<option value="home">{{ i18n.ts._visibility.home }}</option>
									<option value="followers">{{ i18n.ts._visibility.followers }}</option>
								</MkSelect>
							</SearchMarker>
						</MkDisableSection>

						<SearchMarker :keywords="['show', 'fixed', 'post', 'form', 'postform', 'replies', 'note']">
							<MkSwitch v-model="showFixedPostFormInReplies">
								<template #label><SearchLabel>{{ i18n.ts.showFixedPostFormInReplies }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template #caption><SearchKeyword>{{ i18n.ts.showFixedPostFormInRepliesDescription }}</SearchKeyword></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['show', 'alt', 'text', 'warning']">
							<MkSwitch v-model="showNoAltTextWarning">
								<template #label><SearchLabel>{{ i18n.ts.showNoAltWarning }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template #caption><SearchKeyword>{{ i18n.ts.showNoAltWarningDescription }}</SearchKeyword></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['always', 'show', 'cw', 'nsfw']">
							<MkSwitch v-model="alwaysShowCw">
								<template #label><SearchLabel>{{ i18n.ts.alwaysShowCw }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'advanced']">
							<MkSwitch v-model="advancedMfm">
								<template #label><SearchLabel>{{ i18n.ts.enableAdvancedMfm }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['reaction', 'count', 'show']">
							<MkSwitch v-model="showReactionsCount">
								<template #label><SearchLabel>{{ i18n.ts.showReactionsCount }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['image', 'photo', 'picture', 'media', 'thumbnail', 'quality', 'raw', 'attachment']">
							<MkSwitch v-model="loadRawImages">
								<template #label><SearchLabel>{{ i18n.ts.loadRawImages }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>
					</div>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['notification']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.notifications }}</SearchLabel></template>

				<div class="_gaps_m">
					<SearchMarker :keywords="['group']">
						<MkSwitch v-model="useGroupedNotifications">
							<template #label><SearchLabel>{{ i18n.ts.useGroupedNotifications }}</SearchLabel></template>
						</MkSwitch>
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
							<MkSwitch v-model="imageNewTab">
								<template #label><SearchLabel>{{ i18n.ts.openImageInNewTab }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['reaction', 'picker', 'contextmenu', 'open']">
							<MkSwitch v-model="useReactionPickerForContextMenu">
								<template #label><SearchLabel>{{ i18n.ts.useReactionPickerForContextMenu }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['load', 'auto', 'more']">
							<MkSwitch v-model="enableInfiniteScroll">
								<template #label><SearchLabel>{{ i18n.ts.enableInfiniteScroll }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['disable', 'streaming', 'timeline']">
							<MkSwitch v-model="disableStreamingTimeline">
								<template #label><SearchLabel>{{ i18n.ts.disableStreamingTimeline }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['follow', 'confirm', 'always']">
							<MkSwitch v-model="alwaysConfirmFollow">
								<template #label><SearchLabel>{{ i18n.ts.alwaysConfirmFollow }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['sensitive', 'nsfw', 'media', 'image', 'photo', 'picture', 'attachment', 'confirm']">
							<MkSwitch v-model="confirmWhenRevealingSensitiveMedia">
								<template #label><SearchLabel>{{ i18n.ts.confirmWhenRevealingSensitiveMedia }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['confirm', 'reaction', 'react']">
							<MkSwitch v-model="confirmOnReact">
								<template #label><SearchLabel>{{ i18n.ts.confirmOnReact }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['auto', 'load', 'more', 'reply', 'replies']">
							<MkSwitch v-model="autoLoadMoreReplies">
								<template #label><SearchLabel>{{ i18n.ts.autoLoadMoreReplies }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['auto', 'load', 'more', 'conversation']">
							<MkSwitch v-model="autoLoadMoreConversation">
								<template #label><SearchLabel>{{ i18n.ts.autoLoadMoreConversation }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['auto', 'translate']">
							<MkSwitch v-model="useAutoTranslate" @update:modelValue="learnMoreAutoTranslate">
								<template #label><SearchLabel>{{ i18n.ts.useAutoTranslate }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								<template v-if="!$i?.policies.canUseAutoTranslate" #caption>{{ i18n.ts.cannotBeUsedFunc }} <a class="_link" @click="learnMoreCantUseAutoTranslate">{{ i18n.ts.learnMore }}</a></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['welcome', 'toast']">
							<MkSwitch v-model="welcomeBackToast">
								<template #label><SearchLabel>{{ i18n.ts.welcomeBackToast }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>

						<SearchMarker :keywords="['disable', 'nyaize', 'note']">
							<MkSwitch v-model="disableNyaize">
								<template #label><SearchLabel>{{ i18n.ts.noNyaization }}</SearchLabel> <span class="_beta">CherryPick</span></template>
							</MkSwitch>
						</SearchMarker>
					</div>

					<SearchMarker :keywords="['server', 'disconnect']">
						<MkSelect v-model="serverDisconnectedBehavior">
							<template #label><SearchLabel>{{ i18n.ts.whenServerDisconnected }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
							<option value="reload">{{ i18n.ts._serverDisconnectedBehavior.reload }}</option>
							<option value="dialog">{{ i18n.ts._serverDisconnectedBehavior.dialog }}</option>
							<option value="quiet">{{ i18n.ts._serverDisconnectedBehavior.quiet }}</option>
						</MkSelect>
					</SearchMarker>

					<SearchMarker :keywords="['refresh']">
						<MkSelect v-model="requireRefreshBehavior">
							<template #label><SearchLabel>{{ i18n.ts.requireRefresh }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
							<option value="dialog">{{ i18n.ts._requireRefreshBehavior.dialog }}</option>
							<option value="quiet">{{ i18n.ts._requireRefreshBehavior.quiet }}</option>
						</MkSelect>
					</SearchMarker>

					<SearchMarker :keywords="['note', 'receive', 'notification']">
						<MkSelect v-model="newNoteReceivedNotificationBehavior">
							<template #label><SearchLabel>{{ i18n.ts.newNoteReceivedNotification }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
							<option value="default">{{ i18n.ts._newNoteReceivedNotificationBehavior.default }}</option>
							<option value="count">{{ i18n.ts._newNoteReceivedNotificationBehavior.count }}</option>
							<option value="none">{{ i18n.ts._newNoteReceivedNotificationBehavior.none }}</option>
						</MkSelect>
					</SearchMarker>

					<SearchMarker :keywords="['cache', 'page']">
						<MkRange v-model="numberOfPageCache" :min="1" :max="10" :step="1" easing>
							<template #label><SearchLabel>{{ i18n.ts.numberOfPageCache }}</SearchLabel></template>
							<template #caption>{{ i18n.ts.numberOfPageCacheDescription }}</template>
						</MkRange>
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
										<MkButton :disabled="!defaultStore.reactiveState.trustedDomains.value.length" danger @click="removeTrustedDomains"><i class="ti ti-trash"></i> {{ i18n.ts._externalNavigationWarning.deleteTrustedDomainList }}</MkButton>
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
						<MkSwitch v-model="forceShowAds">
							<template #label><SearchLabel>{{ i18n.ts.forceShowAds }}</SearchLabel></template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker>
						<MkRadios v-model="hemisphere">
							<template #label><SearchLabel>{{ i18n.ts.hemisphere }}</SearchLabel></template>
							<option value="N">{{ i18n.ts._hemisphere.N }}</option>
							<option value="S">{{ i18n.ts._hemisphere.S }}</option>
							<template #caption><SearchKeyword>{{ i18n.ts._hemisphere.caption }}</SearchKeyword></template>
						</MkRadios>
					</SearchMarker>

					<SearchMarker :keywords="['search', 'engine']">
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

						<template v-if="defaultStore.state.searchEngine == 'other'">
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
									<MkButton v-if="defaultStore.reactiveState.additionalUnicodeEmojiIndexes.value[lang]" danger @click="removeEmojiIndex(lang)"><i class="ti ti-trash"></i> {{ i18n.ts.remove }} ({{ getEmojiIndexLangName(lang) }})</MkButton>
									<MkButton v-else @click="downloadEmojiIndex(lang)"><i class="ti ti-download"></i> {{ getEmojiIndexLangName(lang) }}{{ defaultStore.reactiveState.additionalUnicodeEmojiIndexes.value[lang] ? ` (${ i18n.ts.installed })` : '' }}</MkButton>
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
import * as Misskey from 'cherrypick-js';
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
import { defaultStore } from '@/store.js';
import * as os from '@/os.js';
import { instance } from '@/instance.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { reloadAsk } from '@/scripts/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { miLocalStorage } from '@/local-storage.js';
import { globalEvents } from '@/events.js';
import { $i } from '@/account.js';
import MkDisableSection from '@/components/MkDisableSection.vue';

const lang = ref(miLocalStorage.getItem('lang'));
const dataSaver = ref(defaultStore.state.dataSaver);
const trustedDomains = ref(defaultStore.state.trustedDomains.join('\n'));

const hemisphere = computed(defaultStore.makeGetterSetter('hemisphere'));
const overridedDeviceKind = computed(defaultStore.makeGetterSetter('overridedDeviceKind'));
const serverDisconnectedBehavior = computed(defaultStore.makeGetterSetter('serverDisconnectedBehavior'));
const showNoteActionsOnlyHover = computed(defaultStore.makeGetterSetter('showNoteActionsOnlyHover'));
const showClipButtonInNoteFooter = computed(defaultStore.makeGetterSetter('showClipButtonInNoteFooter'));
const collapseRenotes = computed(defaultStore.makeGetterSetter('collapseRenotes'));
const advancedMfm = computed(defaultStore.makeGetterSetter('advancedMfm'));
const showReactionsCount = computed(defaultStore.makeGetterSetter('showReactionsCount'));
const enableQuickAddMfmFunction = computed(defaultStore.makeGetterSetter('enableQuickAddMfmFunction'));
const forceShowAds = computed(defaultStore.makeGetterSetter('forceShowAds'));
const loadRawImages = computed(defaultStore.makeGetterSetter('loadRawImages'));
const imageNewTab = computed(defaultStore.makeGetterSetter('imageNewTab'));
const showFixedPostForm = computed(defaultStore.makeGetterSetter('showFixedPostForm'));
const showFixedPostFormInChannel = computed(defaultStore.makeGetterSetter('showFixedPostFormInChannel'));
const numberOfPageCache = computed(defaultStore.makeGetterSetter('numberOfPageCache'));
const enableInfiniteScroll = computed(defaultStore.makeGetterSetter('enableInfiniteScroll'));
const useReactionPickerForContextMenu = computed(defaultStore.makeGetterSetter('useReactionPickerForContextMenu'));
const disableStreamingTimeline = computed(defaultStore.makeGetterSetter('disableStreamingTimeline'));
const useGroupedNotifications = computed(defaultStore.makeGetterSetter('useGroupedNotifications'));
const alwaysConfirmFollow = computed(defaultStore.makeGetterSetter('alwaysConfirmFollow'));
const confirmWhenRevealingSensitiveMedia = computed(defaultStore.makeGetterSetter('confirmWhenRevealingSensitiveMedia'));
const confirmOnReact = computed(defaultStore.makeGetterSetter('confirmOnReact'));
const contextMenu = computed(defaultStore.makeGetterSetter('contextMenu'));

const forceCollapseAllRenotes = computed(defaultStore.makeGetterSetter('forceCollapseAllRenotes'));
const collapseReplies = computed(defaultStore.makeGetterSetter('collapseReplies'));
const collapseLongNoteContent = computed(defaultStore.makeGetterSetter('collapseLongNoteContent'));
const collapseDefault = computed(defaultStore.makeGetterSetter('collapseDefault'));
const allMediaNoteCollapse = computed(defaultStore.makeGetterSetter('allMediaNoteCollapse'));
const showSubNoteFooterButton = computed(defaultStore.makeGetterSetter('showSubNoteFooterButton'));
const infoButtonForNoteActionsEnabled = computed(defaultStore.makeGetterSetter('infoButtonForNoteActionsEnabled'));
const showTranslateButtonInNote = computed(defaultStore.makeGetterSetter('showTranslateButtonInNote'));
const showReplyButtonInNoteFooter = computed(defaultStore.makeGetterSetter('showReplyButtonInNoteFooter'));
const showRenoteButtonInNoteFooter = computed(defaultStore.makeGetterSetter('showRenoteButtonInNoteFooter'));
const showLikeButtonInNoteFooter = computed(defaultStore.makeGetterSetter('showLikeButtonInNoteFooter'));
const showDoReactionButtonInNoteFooter = computed(defaultStore.makeGetterSetter('showDoReactionButtonInNoteFooter'));
const showQuoteButtonInNoteFooter = computed(defaultStore.makeGetterSetter('showQuoteButtonInNoteFooter'));
const showMoreButtonInNoteFooter = computed(defaultStore.makeGetterSetter('showMoreButtonInNoteFooter'));
const selectReaction = computed(defaultStore.makeGetterSetter('selectReaction'));
const showReplyInNotification = computed(defaultStore.makeGetterSetter('showReplyInNotification'));
const renoteQuoteButtonSeparation = computed(defaultStore.makeGetterSetter('renoteQuoteButtonSeparation'));
const renoteVisibilitySelection = computed(defaultStore.makeGetterSetter('renoteVisibilitySelection'));
const forceRenoteVisibilitySelection = computed(defaultStore.makeGetterSetter('forceRenoteVisibilitySelection'));
const showFixedPostFormInReplies = computed(defaultStore.makeGetterSetter('showFixedPostFormInReplies'));
const showNoAltTextWarning = computed(defaultStore.makeGetterSetter('showNoAltTextWarning'));
const alwaysShowCw = computed(defaultStore.makeGetterSetter('alwaysShowCw'));
const autoLoadMoreReplies = computed(defaultStore.makeGetterSetter('autoLoadMoreReplies'));
const autoLoadMoreConversation = computed(defaultStore.makeGetterSetter('autoLoadMoreConversation'));
const useAutoTranslate = computed(defaultStore.makeGetterSetter('useAutoTranslate'));
const welcomeBackToast = computed(defaultStore.makeGetterSetter('welcomeBackToast'));
const disableNyaize = computed(defaultStore.makeGetterSetter('disableNyaize'));
const requireRefreshBehavior = computed(defaultStore.makeGetterSetter('requireRefreshBehavior'));
const newNoteReceivedNotificationBehavior = computed(defaultStore.makeGetterSetter('newNoteReceivedNotificationBehavior'));
const externalNavigationWarning = computed(defaultStore.makeGetterSetter('externalNavigationWarning'));
const searchEngine = computed(defaultStore.makeGetterSetter('searchEngine'));
const searchEngineUrl = computed(defaultStore.makeGetterSetter('searchEngineUrl'));
const searchEngineUrlQuery = computed(defaultStore.makeGetterSetter('searchEngineUrlQuery'));

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
		const currentIndexes = defaultStore.state.additionalUnicodeEmojiIndexes;

		function download() {
			switch (lang) {
				case 'en-US': return import('../../unicode-emoji-indexes/en-US.json').then(x => x.default);
				case 'ja-JP': return import('../../unicode-emoji-indexes/ja-JP.json').then(x => x.default);
				case 'ja-JP_hira': return import('../../unicode-emoji-indexes/ja-JP_hira.json').then(x => x.default);
				default: throw new Error('unrecognized lang: ' + lang);
			}
		}

		currentIndexes[lang] = await download();
		await defaultStore.set('additionalUnicodeEmojiIndexes', currentIndexes);
	}

	os.promiseDialog(main());
}

function removeEmojiIndex(lang: string) {
	async function main() {
		const currentIndexes = defaultStore.state.additionalUnicodeEmojiIndexes;
		delete currentIndexes[lang];
		await defaultStore.set('additionalUnicodeEmojiIndexes', currentIndexes);
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

	defaultStore.set('pinnedUserLists', [list]);
}

function removePinnedList() {
	defaultStore.set('pinnedUserLists', []);
}

function enableAllDataSaver() {
	const g = { ...defaultStore.state.dataSaver };
	Object.keys(g).forEach((key) => { g[key] = true; });
	dataSaver.value = g;
}

function disableAllDataSaver() {
	const g = { ...defaultStore.state.dataSaver };
	Object.keys(g).forEach((key) => { g[key] = false; });
	dataSaver.value = g;
}

watch(dataSaver, (to) => {
	defaultStore.set('dataSaver', to);
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
		await defaultStore.set('trustedDomains', []);

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

		await defaultStore.set('trustedDomains', domains);
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

definePageMetadata(() => ({
	title: i18n.ts.general,
	icon: 'ti ti-adjustments',
}));
</script>
