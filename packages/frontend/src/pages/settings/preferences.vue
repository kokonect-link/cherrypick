<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/preferences" :label="i18n.ts.preferences" :keywords="['general', 'preferences']" icon="ti ti-adjustments">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/gear_3d.png" color="#00ff9d">
			<SearchKeyword>{{ i18n.ts._settings.preferencesBanner }}</SearchKeyword>
		</MkFeatureBanner>

		<div class="_gaps_s">
			<SearchMarker v-slot="slotProps" :keywords="['general']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts.general }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-settings"></i></SearchIcon></template>

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

						<div class="_gaps_s">
							<SearchMarker :keywords="['titlebar', 'show']">
								<MkPreferenceContainer k="showTitlebar">
									<MkSwitch v-model="showTitlebar">
										<template #label><SearchLabel>{{ i18n.ts.showTitlebar }}</SearchLabel></template>
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

							<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'advanced']">
								<MkPreferenceContainer k="advancedMfm">
									<MkSwitch v-model="advancedMfm">
										<template #label><SearchLabel>{{ i18n.ts.enableAdvancedMfm }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['auto', 'load', 'auto', 'more', 'scroll']">
								<MkPreferenceContainer k="enableInfiniteScroll">
									<MkSwitch v-model="enableInfiniteScroll">
										<template #label><SearchLabel>{{ i18n.ts.enableInfiniteScroll }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['emoji', 'style', 'native', 'system', 'fluent', 'twemoji']">
							<MkPreferenceContainer k="emojiStyle">
								<div>
									<MkRadios v-model="emojiStyle">
										<template #label><SearchLabel>{{ i18n.ts.emojiStyle }}</SearchLabel></template>
										<option value="native">{{ i18n.ts.native }}</option>
										<option value="fluentEmoji">Fluent Emoji</option>
										<option value="twemoji">Twemoji</option>
									</MkRadios>
									<div style="margin: 8px 0 0 0; font-size: 1.5em;"><Mfm :key="emojiStyle" text="🍮🍦🍭🍩🍰🍫🍬🥞🍪"/></div>
								</div>
							</MkPreferenceContainer>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker :keywords="['appearance', 'display']">
				<MkFolder>
					<template #label><SearchLabel>{{ i18n.ts.appearance }}</SearchLabel></template>
					<template #icon><i class="ti ti-adjustments"></i></template>

					<div class="_gaps_s">
						<SearchMarker :keywords="['font', 'size']">
							<div style="width: 100%">
								<div :class="$style.label"><SearchLabel>{{ i18n.ts.fontSize }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></div>
								<div :class="$style.fontSize" class="_panel">
									<MkPreferenceContainer k="fontSize">
										<div v-for="size in 19" v-show="fontSize === size" :key="size" :style="{ fontSize: `${size + 6}px` }">{{ i18n.ts._mfc.dummy }}</div>
									</MkPreferenceContainer>
								</div>
								<div :class="$style.fontSizeSlider">
									<div :class="$style.fontSizeLeft">Aa</div>
									<MkRange
										v-model="fontSize"
										style="position: initial !important; width: 100%; margin: 0 -10px;"
										easing
										:min="1"
										:max="19"
										:step="1"
										:textConverter="(v) => `${v + 6}px`"
										isFontSizeSlider
									/>
									<div :class="$style.fontSizeRight">Aa</div>
								</div>
								<MkInfo v-if="String(fontSize) != String(fontSizeBefore)" style="margin-top: 10px;">{{ i18n.ts.reloadToApplySetting2 }} <a class="_link" @click="reload">{{ i18n.ts.reload }}</a></MkInfo>

								<SearchMarker :keywords="['bold']">
									<MkSwitch v-model="useBoldFont" style="margin-top: .75em;">
										<template #label><SearchLabel>{{ i18n.ts.useBoldFont }}</SearchLabel></template>
									</MkSwitch>
								</SearchMarker>

								<SearchMarker :keywords="['system', 'native']">
									<MkSwitch v-model="useSystemFont" style="margin-top: .75em;">
										<template #label><SearchLabel>{{ i18n.ts.useSystemFont }}</SearchLabel></template>
									</MkSwitch>
								</SearchMarker>
							</div>

							<!--
							<MkRadios v-model="fontSize">
								<template #label><SearchLabel>{{ i18n.ts.fontSize }}</SearchLabel></template>
								<option value="1"><span style="font-size: 12px;">Aa</span></option>
								<option value="2"><span style="font-size: 13px;">Aa</span></option>
								<option :value="null"><span style="font-size: 14px;">Aa</span></option>
								<option value="3"><span style="font-size: 15px;">Aa</span></option>
								<option value="4"><span style="font-size: 16px;">Aa</span></option>
								<option value="5"><span style="font-size: 17px;">Aa</span></option>
								<option value="6"><span style="font-size: 18px;">Aa</span></option>
								<option value="7"><span style="font-size: 19px;">Aa</span></option>
								<option value="8"><span style="font-size: 20px;">Aa</span></option>
							</MkRadios>
							-->
						</SearchMarker>

						<hr>

						<SearchMarker :keywords="['highlight', 'sensitive', 'nsfw', 'image', 'photo', 'picture', 'media', 'thumbnail']">
							<MkPreferenceContainer k="highlightSensitiveMedia">
								<MkSwitch v-model="highlightSensitiveMedia">
									<template #label><SearchLabel>{{ i18n.ts.highlightSensitiveMedia }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['avatar', 'icon', 'square']">
							<MkPreferenceContainer k="squareAvatars">
								<MkSwitch v-model="squareAvatars">
									<template #label><SearchLabel>{{ i18n.ts.squareAvatars }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['avatar', 'icon', 'square', 'federation', 'shape']">
							<MkPreferenceContainer k="setFederationAvatarShape">
								<MkSwitch v-model="setFederationAvatarShape" @update:modelValue="cantUseSetFederationAvatarShape">
									<template #label><SearchLabel>{{ i18n.ts.setFederationAvatarShape }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption>
										{{ $i.policies.canSetFederationAvatarShape ? i18n.ts.setFederationAvatarShapeDescription : i18n.ts.cannotBeUsedFunc }}
										<span v-if="!$i.policies.canSetFederationAvatarShape" style="margin-left: 3px;"><a class="_link" @click="learnMoreCantUseSetFederationAvatarShape">{{ i18n.ts.learnMore }}</a></span>
									</template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['avatar', 'icon', 'decoration', 'show']">
							<MkPreferenceContainer k="showAvatarDecorations">
								<MkSwitch v-model="showAvatarDecorations">
									<template #label><SearchLabel>{{ i18n.ts.showAvatarDecorations }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['effect', 'show']">
							<MkPreferenceContainer k="enableSeasonalScreenEffect">
								<MkSwitch v-model="enableSeasonalScreenEffect">
									<template #label><SearchLabel>{{ i18n.ts.seasonalScreenEffect }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['show', 'unread', 'notification', 'count']">
							<MkPreferenceContainer k="showUnreadNotificationsCount">
								<MkSwitch v-model="showUnreadNotificationsCount">
									<template #label><SearchLabel>{{ i18n.ts.showUnreadNotificationsCount }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['file', 'grid', 'layout', 'user', 'page']">
							<MkPreferenceContainer k="filesGridLayoutInUserPage">
								<MkSwitch v-model="filesGridLayoutInUserPage">
									<template #label><SearchLabel>{{ i18n.ts.filesGridLayoutInUserPage }}</SearchLabel> <span class="_beta">CherryPick</span></template>
									<template #caption><SearchKeyword>{{ i18n.ts.filesGridLayoutInUserPageDescription }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['timeline', 'note']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts._settings.timelineAndNote }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-notes"></i></SearchIcon></template>

					<div class="_gaps_m">
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

							<SearchMarker :keywords="['post', 'form', 'note', 'replies']">
								<MkPreferenceContainer k="showFixedPostFormInReplies">
									<MkSwitch v-model="showFixedPostFormInReplies">
										<template #label><SearchLabel>{{ i18n.ts.showFixedPostFormInReplies }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										<template #caption><SearchKeyword>{{ i18n.ts.showFixedPostFormInRepliesDescription }}</SearchKeyword></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['force', 'collapse', 'renote']">
								<MkPreferenceContainer k="forceCollapseAllRenotes">
									<MkSwitch v-model="forceCollapseAllRenotes">
										<template #label><SearchLabel>{{ i18n.ts.forceCollapseAllRenotes }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										<template #caption><SearchKeyword>{{ i18n.ts.forceCollapseAllRenotesDescription }}</SearchKeyword></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['renote']">
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

							<SearchMarker :keywords="['disable', 'streaming', 'timeline']">
								<MkPreferenceContainer k="disableStreamingTimeline">
									<MkSwitch v-model="disableStreamingTimeline">
										<template #label><SearchLabel>{{ i18n.ts.disableStreamingTimeline }}</SearchLabel></template>
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
						</div>

						<hr>

						<div class="_gaps_m">
							<div class="_gaps_s">
								<SearchMarker :keywords="['hide', 'avatar', 'note', 'display']">
									<MkPreferenceContainer k="hideAvatarsInNote">
										<MkSwitch v-model="hideAvatarsInNote">
											<template #label><SearchLabel>{{ i18n.ts.hideAvatarsInNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['enable', 'absolute', 'time', 'note', 'display']">
									<MkPreferenceContainer k="enableAbsoluteTime">
										<MkSwitch v-model="enableAbsoluteTime">
											<template #label><SearchLabel>{{ i18n.ts.enableAbsoluteTime }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['enable', 'mark', 'date', 'note', 'display']">
									<MkPreferenceContainer k="enableMarkByDate">
										<MkSwitch v-model="enableMarkByDate" :disabled="prefer.s.enableAbsoluteTime">
											<template #label><SearchLabel>{{ i18n.ts.enableMarkByDate }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['show', 'reply', 'target', 'note', 'display']">
									<MkPreferenceContainer k="showReplyTargetNote">
										<MkSwitch v-model="showReplyTargetNote">
											<template #label><SearchLabel>{{ i18n.ts.showReplyTargetNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['show', 'reply', 'target', 'note', 'transparent', 'display']">
									<MkPreferenceContainer k="showReplyTargetNoteInSemiTransparent">
										<MkSwitch v-model="showReplyTargetNoteInSemiTransparent">
											<template #label><SearchLabel>{{ i18n.ts.showReplyTargetNoteInSemiTransparent }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['note', 'timeline', 'gap']">
									<MkPreferenceContainer k="showGapBetweenNotesInTimeline">
										<MkSwitch v-model="showGapBetweenNotesInTimeline">
											<template #label><SearchLabel>{{ i18n.ts.showGapBetweenNotesInTimeline }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['note', 'gap', 'body']">
									<MkPreferenceContainer k="showGapBodyOfTheNote">
										<MkSwitch v-model="showGapBodyOfTheNote">
											<template #label><SearchLabel>{{ i18n.ts.showGapBodyOfTheNote }}</SearchLabel> <span class="_beta">CherryPick</span></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>
							</div>

							<div class="_gaps_s">
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

								<div class="_gaps_s" style="margin: 1em 0;">
									<div style="font-weight: bold; margin: 0 0 8px 0;">{{ i18n.ts.noteFooterButton }} <span class="_beta" style="vertical-align: middle;">CherryPick</span></div>

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
											<template #label><i class="ti ti-heart"></i> <SearchLabel>{{ i18n.ts.like }}</SearchLabel></template>
											<div class="_gaps_m">
												<MkPreferenceContainer k="selectReaction">
													<FormSlot v-model="selectReaction">
														<template #label>{{ i18n.ts.selectReaction }}</template>
														<MkCustomEmoji v-if="selectReaction && selectReaction.startsWith(':')" style="max-height: 3em; font-size: 1.1em;" :useOriginalSize="false" :name="selectReaction" :normal="true" :noStyle="true"/>
														<MkEmoji v-else-if="selectReaction && !selectReaction.startsWith(':')" :emoji="selectReaction" style="max-height: 3em; font-size: 1.1em;" :normal="true" :noStyle="true"/>
														<span v-else-if="!selectReaction">{{ i18n.ts.notSet }}</span>
														<div class="_buttons" style="padding-top: 8px;">
															<MkButton rounded :small="true" inline @click="chooseNewReaction"><i class="ti ti-pencil"></i> {{ i18n.ts.edit }}</MkButton>
															<MkButton rounded :small="true" inline danger @click="resetReaction"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>
														</div>
													</FormSlot>
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

								<SearchMarker :keywords="['reaction', 'count', 'show']">
									<MkPreferenceContainer k="showReactionsCount">
										<MkSwitch v-model="showReactionsCount">
											<template #label><SearchLabel>{{ i18n.ts.showReactionsCount }}</SearchLabel></template>
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

								<SearchMarker :keywords="['image', 'photo', 'picture', 'media', 'thumbnail', 'quality', 'raw', 'attachment']">
									<MkPreferenceContainer k="loadRawImages">
										<MkSwitch v-model="loadRawImages">
											<template #label><SearchLabel>{{ i18n.ts.loadRawImages }}</SearchLabel></template>
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
							</div>

							<SearchMarker :keywords="['reaction', 'size', 'scale', 'display']">
								<MkPreferenceContainer k="reactionsDisplaySize">
									<MkRadios v-model="reactionsDisplaySize">
										<template #label><SearchLabel>{{ i18n.ts.reactionsDisplaySize }}</SearchLabel></template>
										<option value="small">{{ i18n.ts.small }}</option>
										<option value="medium">{{ i18n.ts.medium }}</option>
										<option value="large">{{ i18n.ts.large }}</option>
									</MkRadios>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['reaction', 'size', 'scale', 'display', 'width', 'limit']">
								<MkPreferenceContainer k="limitWidthOfReaction">
									<MkSwitch v-model="limitWidthOfReaction">
										<template #label><SearchLabel>{{ i18n.ts.limitWidthOfReaction }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'list', 'size', 'height']">
								<MkPreferenceContainer k="mediaListWithOneImageAppearance">
									<MkRadios v-model="mediaListWithOneImageAppearance">
										<template #label><SearchLabel>{{ i18n.ts.mediaListWithOneImageAppearance }}</SearchLabel></template>
										<option value="expand">{{ i18n.ts.default }}</option>
										<option value="16_9">{{ i18n.tsx.limitTo({ x: '16:9' }) }}</option>
										<option value="1_1">{{ i18n.tsx.limitTo({ x: '1:1' }) }}</option>
										<option value="2_3">{{ i18n.tsx.limitTo({ x: '2:3' }) }}</option>
									</MkRadios>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['ticker', 'information', 'label', 'instance', 'server', 'host', 'federation']">
								<MkPreferenceContainer k="instanceTicker">
									<MkSelect v-if="instance.federation !== 'none'" v-model="instanceTicker">
										<template #label><SearchLabel>{{ i18n.ts.instanceTicker }}</SearchLabel></template>
										<option value="none">{{ i18n.ts._instanceTicker.none }}</option>
										<option value="remote">{{ i18n.ts._instanceTicker.remote }}</option>
										<option value="always">{{ i18n.ts._instanceTicker.always }}</option>
									</MkSelect>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'nsfw', 'sensitive', 'display', 'show', 'hide', 'visibility']">
								<MkPreferenceContainer k="nsfw">
									<MkSelect v-model="nsfw">
										<template #label><SearchLabel>{{ i18n.ts.displayOfSensitiveMedia }}</SearchLabel></template>
										<option value="respect">{{ i18n.ts._displayOfSensitiveMedia.respect }}</option>
										<option value="ignore">{{ i18n.ts._displayOfSensitiveMedia.ignore }}</option>
										<option value="force">{{ i18n.ts._displayOfSensitiveMedia.force }}</option>
									</MkSelect>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'nsfw', 'sensitive', 'display', 'show', 'hide', 'visibility', 'open', 'click', 'double']">
								<MkPreferenceContainer k="nsfwOpenBehavior">
									<MkSelect v-model="nsfwOpenBehavior">
										<template #label><SearchLabel>{{ i18n.ts.nsfwOpenBehavior }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
										<option value="click">{{ i18n.ts._nsfwOpenBehavior.click }}</option>
										<option value="doubleClick">{{ i18n.ts._nsfwOpenBehavior.doubleClick }}</option>
									</MkSelect>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['post', 'form']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts.postForm }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-edit"></i></SearchIcon></template>

					<div class="_gaps_m">
						<div class="_gaps_s">
							<SearchMarker :keywords="['remember', 'keep', 'note', 'cw']">
								<MkPreferenceContainer k="keepCw">
									<MkSwitch v-model="keepCw">
										<template #label><SearchLabel>{{ i18n.ts.keepCw }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['remember', 'keep', 'note', 'visibility']">
								<MkPreferenceContainer k="rememberNoteVisibility">
									<MkSwitch v-model="rememberNoteVisibility">
										<template #label><SearchLabel>{{ i18n.ts.rememberNoteVisibility }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
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

							<hr>

							<SearchMarker :keywords="['preview', 'note', 'text']">
								<MkPreferenceContainer k="showPreview">
									<MkSwitch v-model="showPreview">
										<template #label><SearchLabel>{{ i18n.ts.previewNoteText }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['show', 'profile', 'preview']">
								<MkPreferenceContainer k="showProfilePreview">
									<MkSwitch v-model="showProfilePreview">
										<template #label><SearchLabel>{{ i18n.ts.previewNoteProfile }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>

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
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['notification']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts.notifications }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-bell"></i></SearchIcon></template>

					<div class="_gaps_m">
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

						<SearchMarker :keywords="['position']">
							<MkPreferenceContainer k="notificationPosition">
								<MkRadios v-model="notificationPosition">
									<template #label><SearchLabel>{{ i18n.ts.position }}</SearchLabel></template>
									<option value="leftTop"><i class="ti ti-align-box-left-top"></i> {{ i18n.ts.leftTop }}</option>
									<option value="rightTop"><i class="ti ti-align-box-right-top"></i> {{ i18n.ts.rightTop }}</option>
									<option value="leftBottom"><i class="ti ti-align-box-left-bottom"></i> {{ i18n.ts.leftBottom }}</option>
									<option value="rightBottom"><i class="ti ti-align-box-right-bottom"></i> {{ i18n.ts.rightBottom }}</option>
								</MkRadios>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['stack', 'axis', 'direction']">
							<MkPreferenceContainer k="notificationStackAxis">
								<MkRadios v-model="notificationStackAxis">
									<template #label><SearchLabel>{{ i18n.ts.stackAxis }}</SearchLabel></template>
									<option value="vertical"><i class="ti ti-carousel-vertical"></i> {{ i18n.ts.vertical }}</option>
									<option value="horizontal"><i class="ti ti-carousel-horizontal"></i> {{ i18n.ts.horizontal }}</option>
								</MkRadios>
							</MkPreferenceContainer>
						</SearchMarker>

						<MkButton @click="testNotification">{{ i18n.ts._notification.checkNotificationBehavior }}</MkButton>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker :label="i18n.ts._externalNavigationWarning.externalNavigationWarning" :keywords="['external', 'navigation', 'warning']">
				<MkFolder>
					<template #label><SearchLabel>{{ i18n.ts._externalNavigationWarning.externalNavigationWarning }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
					<template #icon><i class="ti ti-external-link"></i></template>

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

			<template v-if="$i.policies.chatAvailability !== 'unavailable'">
				<SearchMarker v-slot="slotProps" :keywords="['chat', 'messaging']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #label><SearchLabel>{{ i18n.ts.chat }}</SearchLabel></template>
						<template #icon><SearchIcon><i class="ti ti-messages"></i></SearchIcon></template>

						<div class="_gaps_s">
							<SearchMarker :keywords="['show', 'sender', 'name']">
								<MkPreferenceContainer k="chat.showSenderName">
									<MkSwitch v-model="chatShowSenderName">
										<template #label><SearchLabel>{{ i18n.ts._settings._chat.showSenderName }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['send', 'enter', 'newline']">
								<MkPreferenceContainer k="chat.sendOnEnter">
									<MkSwitch v-model="chatSendOnEnter">
										<template #label><SearchLabel>{{ i18n.ts._settings._chat.sendOnEnter }}</SearchLabel></template>
										<template #caption>
											<div class="_gaps_s">
												<div>
													<b>{{ i18n.ts._settings.ifOn }}:</b>
													<div>{{ i18n.ts._chat.send }}: Enter</div>
													<div>{{ i18n.ts._chat.newline }}: Shift + Enter</div>
												</div>
												<div>
													<b>{{ i18n.ts._settings.ifOff }}:</b>
													<div>{{ i18n.ts._chat.send }}: Ctrl + Enter</div>
													<div>{{ i18n.ts._chat.newline }}: Enter</div>
												</div>
											</div>
										</template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>
					</MkFolder>
				</SearchMarker>
			</template>

			<SearchMarker v-slot="slotProps" :keywords="['accessibility']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts.accessibility }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-accessible"></i></SearchIcon></template>

					<div class="_gaps_m">
						<MkFeatureBanner icon="/client-assets/mens_room_3d.png" color="#0011ff">
							<SearchKeyword>{{ i18n.ts._settings.accessibilityBanner }}</SearchKeyword>
						</MkFeatureBanner>

						<div class="_gaps_s">
							<SearchMarker :keywords="['animation', 'motion', 'reduce']">
								<MkPreferenceContainer k="animation">
									<MkSwitch v-model="reduceAnimation">
										<template #label><SearchLabel>{{ i18n.ts.reduceUiAnimation }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['disable', 'animation', 'image', 'photo', 'picture', 'media', 'thumbnail', 'gif']">
								<MkPreferenceContainer k="disableShowingAnimatedImages">
									<MkSwitch v-model="disableShowingAnimatedImages">
										<template #label><SearchLabel>{{ i18n.ts.disableShowingAnimatedImages }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
										<template #caption><i class="ti ti-alert-triangle" style="color: var(--MI_THEME-warn);"></i> {{ i18n.ts.disableShowingAnimatedImagesDescription }}</template>
									</MkSwitch>
								</MkPreferenceContainer>

								<MkDisableSection :disabled="disableShowingAnimatedImages">
									<MkPreferenceContainer k="showingAnimatedImages">
										<MkSelect v-model="showingAnimatedImages" style="margin-left: 44px;">
											<option value="always">{{ i18n.ts._showingAnimatedImages.always }}</option>
											<option value="interaction">{{ i18n.ts._showingAnimatedImages.interaction }}</option>
											<option value="inactive">{{ i18n.ts._showingAnimatedImages.inactive }}</option>
											<template #caption><SearchKeyword>{{ i18n.ts.showingAnimatedImagesDescription }}</SearchKeyword></template>
										</MkSelect>
									</MkPreferenceContainer>
								</MkDisableSection>
							</SearchMarker>

							<MkDisableSection :disabled="!prefer.s.advancedMfm">
								<SearchMarker :keywords="['mfm', 'mfc', 'enable', 'show', 'animated']">
									<MkPreferenceContainer k="animatedMfm">
										<MkSwitch v-model="animatedMfm">
											<template #label><SearchLabel>{{ i18n.ts.enableAnimatedMfm }}</SearchLabel></template>
										</MkSwitch>

										<div :class="$style.mfmPreview">
											<div v-if="prefer.s.advancedMfm && animatedMfm" style="margin: 0 0 8px; font-size: 1.5em;">
												<Mfm :key="emojiStyle" text="$[jelly 🍮] $[spin 🍪] $[shake 🍭]"/>
											</div>
											<div v-else style="margin: 0 0 8px; font-size: 1.5em;">
												<Mfm :key="emojiStyle" text="🍮 🍪 🍭"/>
											</div>
										</div>
									</MkPreferenceContainer>
								</SearchMarker>
							</MkDisableSection>

							<SearchMarker :keywords="['swipe', 'horizontal', 'tab']">
								<MkPreferenceContainer k="enableHorizontalSwipe">
									<MkSwitch v-model="enableHorizontalSwipe">
										<template #label><SearchLabel>{{ i18n.ts.enableHorizontalSwipe }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['swipe', 'pull', 'refresh']">
								<MkPreferenceContainer k="enablePullToRefresh">
									<MkSwitch v-model="enablePullToRefresh">
										<template #label><SearchLabel>{{ i18n.ts._settings.enablePullToRefresh }}</SearchLabel></template>
										<template #caption><SearchKeyword>{{ i18n.ts._settings.enablePullToRefresh_description }}</SearchKeyword></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['keep', 'screen', 'display', 'on']">
								<MkPreferenceContainer k="keepScreenOn">
									<MkSwitch v-model="keepScreenOn">
										<template #label><SearchLabel>{{ i18n.ts.keepScreenOn }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['native', 'system', 'video', 'audio', 'player', 'media']">
								<MkPreferenceContainer k="useNativeUiForVideoAudioPlayer">
									<MkSwitch v-model="useNativeUiForVideoAudioPlayer">
										<template #label><SearchLabel>{{ i18n.ts.useNativeUIForVideoAudioPlayer }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['text', 'selectable']">
								<MkPreferenceContainer k="makeEveryTextElementsSelectable">
									<MkSwitch v-model="makeEveryTextElementsSelectable">
										<template #label><SearchLabel>{{ i18n.ts._settings.makeEveryTextElementsSelectable }}</SearchLabel></template>
										<template #caption>{{ i18n.ts._settings.makeEveryTextElementsSelectable_description }}</template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['menu', 'style', 'popup', 'drawer']">
							<MkPreferenceContainer k="menuStyle">
								<MkSelect v-model="menuStyle">
									<template #label><SearchLabel>{{ i18n.ts.menuStyle }}</SearchLabel></template>
									<option value="auto">{{ i18n.ts.auto }}</option>
									<option value="popup">{{ i18n.ts.popup }}</option>
									<option value="drawer">{{ i18n.ts.drawer }}</option>
								</MkSelect>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['contextmenu', 'system', 'native']">
							<MkPreferenceContainer k="contextMenu">
								<MkSelect v-model="contextMenu">
									<template #label><SearchLabel>{{ i18n.ts._contextMenu.title }}</SearchLabel></template>
									<option value="app">{{ i18n.ts._contextMenu.app }}</option>
									<option value="appWithShift">{{ i18n.ts._contextMenu.appWithShift }}</option>
									<option value="native">{{ i18n.ts._contextMenu.native }}</option>
								</MkSelect>
							</MkPreferenceContainer>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['performance']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts.performance }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-battery-vertical-eco"></i></SearchIcon></template>

					<div class="_gaps_s">
						<SearchMarker :keywords="['blur']">
							<MkPreferenceContainer k="useBlurEffect">
								<MkSwitch v-model="useBlurEffect">
									<template #label><SearchLabel>{{ i18n.ts.useBlurEffect }}</SearchLabel></template>
									<template #caption><SearchKeyword>{{ i18n.ts.turnOffToImprovePerformance }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['blur', 'modal']">
							<MkPreferenceContainer k="useBlurEffectForModal">
								<MkSwitch v-model="useBlurEffectForModal">
									<template #label><SearchLabel>{{ i18n.ts.useBlurEffectForModal }}</SearchLabel></template>
									<template #caption><SearchKeyword>{{ i18n.ts.turnOffToImprovePerformance }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['blur', 'modal', 'bg', 'remove']">
							<MkPreferenceContainer k="removeModalBgColorForBlur">
								<MkSwitch v-if="useBlurEffect && useBlurEffectForModal" v-model="removeModalBgColorForBlur">
									<template #label><SearchLabel>{{ i18n.ts.removeModalBgColorForBlur }}</SearchLabel> <span class="_beta">CherryPick</span></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['sticky']">
							<MkPreferenceContainer k="useStickyIcons">
								<MkSwitch v-model="useStickyIcons">
									<template #label><SearchLabel>{{ i18n.ts._settings.useStickyIcons }}</SearchLabel></template>
									<template #caption><SearchKeyword>{{ i18n.ts.turnOffToImprovePerformance }}</SearchKeyword></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['datasaver']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts.dataSaver }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-antenna-bars-3"></i></SearchIcon></template>

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

			<SearchMarker v-slot="slotProps" :keywords="['other']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ i18n.ts.other }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-settings-cog"></i></SearchIcon></template>

					<div class="_gaps_m">
						<div class="_gaps_s">
							<SearchMarker :keywords="['image', 'photo', 'picture', 'media', 'thumbnail', 'new', 'tab']">
								<MkPreferenceContainer k="imageNewTab">
									<MkSwitch v-model="imageNewTab">
										<template #label><SearchLabel>{{ i18n.ts.openImageInNewTab }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['follow', 'replies']">
								<MkPreferenceContainer k="defaultFollowWithReplies">
									<MkSwitch v-model="defaultFollowWithReplies">
										<template #label><SearchLabel>{{ i18n.ts.withRepliesByDefaultForNewlyFollowed }}</SearchLabel></template>
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
										<template v-if="!$i.policies.canUseAutoTranslate" #caption>{{ i18n.ts.cannotBeUsedFunc }} <a class="_link" @click="learnMoreCantUseAutoTranslate">{{ i18n.ts.learnMore }}</a></template>
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

							<template v-if="store.s.searchEngine == 'other'">
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
					</div>
				</MkFolder>
			</SearchMarker>
		</div>

		<hr>

		<div class="_gaps_s">
			<FormLink to="/settings/navbar"><template #icon><i class="ti ti-menu-2"></i></template>{{ i18n.ts.navbar }}</FormLink>
			<FormLink to="/settings/timeline"><template #icon><i class="ti ti-align-left"></i></template>{{ i18n.ts.timeline }}</FormLink>
			<FormLink to="/settings/statusbar"><template #icon><i class="ti ti-equal-double"></i></template>{{ i18n.ts.statusbar }}</FormLink>
			<FormLink to="/settings/deck"><template #icon><i class="ti ti-columns"></i></template>{{ i18n.ts.deck }}</FormLink>
			<FormLink to="/settings/custom-css"><template #icon><i class="ti ti-code"></i></template>{{ i18n.ts.customCss }}</FormLink>
			<FormLink to="/settings/cherrypick"><template #icon><i class="ti ti-bulb-filled"></i></template>CherryPick</FormLink>
		</div>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { langs } from '@@/js/config.js';
import * as Misskey from 'cherrypick-js';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkRange from '@/components/MkRange.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkButton from '@/components/MkButton.vue';
import FormLink from '@/components/form/link.vue';
import FormSlot from '@/components/form/slot.vue';
import MkLink from '@/components/MkLink.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkDisableSection from '@/components/MkDisableSection.vue';
import { store } from '@/store.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { miLocalStorage } from '@/local-storage.js';
import { prefer } from '@/preferences.js';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';
import { globalEvents } from '@/events.js';
import { claimAchievement } from '@/utility/achievements.js';
import { instance } from '@/instance.js';
import { ensureSignin } from '@/i.js';
import { unisonReload } from '@/utility/unison-reload.js';

const $i = ensureSignin();

const lang = ref(miLocalStorage.getItem('lang'));
const dataSaver = ref(prefer.s.dataSaver);
const trustedDomains = ref(prefer.s.trustedDomains.join('\n'));

// const fontSize = ref(miLocalStorage.getItem('fontSize'));
const fontSize = prefer.model('fontSize');
const fontSizeBefore = ref(miLocalStorage.getItem('fontSize'));
const useSystemFont = ref(miLocalStorage.getItem('useSystemFont') != null);
const useBoldFont = ref(miLocalStorage.getItem('useBoldFont'));

const overridedDeviceKind = prefer.model('overridedDeviceKind');
const showTitlebar = prefer.model('showTitlebar');
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
const defaultNoteVisibility = prefer.model('defaultNoteVisibility');
const defaultNoteLocalOnly = prefer.model('defaultNoteLocalOnly');
const rememberNoteVisibility = prefer.model('rememberNoteVisibility');
const showGapBetweenNotesInTimeline = prefer.model('showGapBetweenNotesInTimeline');
const notificationPosition = prefer.model('notificationPosition');
const notificationStackAxis = prefer.model('notificationStackAxis');
const instanceTicker = prefer.model('instanceTicker');
const highlightSensitiveMedia = prefer.model('highlightSensitiveMedia');
const mediaListWithOneImageAppearance = prefer.model('mediaListWithOneImageAppearance');
const reactionsDisplaySize = prefer.model('reactionsDisplaySize');
const limitWidthOfReaction = prefer.model('limitWidthOfReaction');
const squareAvatars = prefer.model('squareAvatars');
const enableSeasonalScreenEffect = prefer.model('enableSeasonalScreenEffect');
const showAvatarDecorations = prefer.model('showAvatarDecorations');
const nsfw = prefer.model('nsfw');
const emojiStyle = prefer.model('emojiStyle');
const useBlurEffectForModal = prefer.model('useBlurEffectForModal');
const useBlurEffect = prefer.model('useBlurEffect');
const defaultFollowWithReplies = prefer.model('defaultFollowWithReplies');
const chatShowSenderName = prefer.model('chat.showSenderName');
const chatSendOnEnter = prefer.model('chat.sendOnEnter');
const useStickyIcons = prefer.model('useStickyIcons');
const reduceAnimation = prefer.model('animation', v => !v, v => !v);
const animatedMfm = prefer.model('animatedMfm');
const disableShowingAnimatedImages = prefer.model('disableShowingAnimatedImages');
const keepScreenOn = prefer.model('keepScreenOn');
const enableHorizontalSwipe = prefer.model('enableHorizontalSwipe');
const enablePullToRefresh = prefer.model('enablePullToRefresh');
const useNativeUiForVideoAudioPlayer = prefer.model('useNativeUiForVideoAudioPlayer');
const contextMenu = prefer.model('contextMenu');
const menuStyle = prefer.model('menuStyle');
const makeEveryTextElementsSelectable = prefer.model('makeEveryTextElementsSelectable');
const showPreview = prefer.model('showPreview');

const forceCollapseAllRenotes = prefer.model('forceCollapseAllRenotes');
const collapseReplies = prefer.model('collapseReplies');
const collapseLongNoteContent = prefer.model('collapseLongNoteContent');
const collapseDefault = prefer.model('collapseDefault');
const allMediaNoteCollapse = prefer.model('allMediaNoteCollapse');
const showSubNoteFooterButton = prefer.model('showSubNoteFooterButton');
const infoButtonForNoteActionsEnabled = prefer.model('infoButtonForNoteActionsEnabled');
const showTranslateButtonInNote = prefer.model('showTranslateButtonInNote');
const showGapBodyOfTheNote = prefer.model('showGapBodyOfTheNote');
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
const searchEngine = computed(store.makeGetterSetter('searchEngine'));
const searchEngineUrl = computed(store.makeGetterSetter('searchEngineUrl'));
const searchEngineUrlQuery = computed(store.makeGetterSetter('searchEngineUrlQuery'));
const removeModalBgColorForBlur = prefer.model('removeModalBgColorForBlur');
const setFederationAvatarShape = prefer.model('setFederationAvatarShape');
const showUnreadNotificationsCount = prefer.model('showUnreadNotificationsCount');
const filesGridLayoutInUserPage = prefer.model('filesGridLayoutInUserPage');
const hideAvatarsInNote = prefer.model('hideAvatarsInNote');
const enableAbsoluteTime = prefer.model('enableAbsoluteTime');
const enableMarkByDate = prefer.model('enableMarkByDate');
const showReplyTargetNote = prefer.model('showReplyTargetNote');
const showReplyTargetNoteInSemiTransparent = prefer.model('showReplyTargetNoteInSemiTransparent');
const nsfwOpenBehavior = prefer.model('nsfwOpenBehavior');
const showProfilePreview = prefer.model('showProfilePreview');
const showingAnimatedImages = prefer.model('showingAnimatedImages');

watch(lang, () => {
	miLocalStorage.setItem('lang', lang.value as string);
	miLocalStorage.removeItem('locale');
	miLocalStorage.removeItem('localeVersion');
});

watch(fontSize, () => {
	if (fontSize.value == null) {
		miLocalStorage.removeItem('fontSize');
	} else {
		miLocalStorage.setItem('fontSize', String(fontSize.value));
	}
});

watch(useBoldFont, () => {
	if (useBoldFont.value) {
		miLocalStorage.setItem('useBoldFont', useBoldFont.value);
	} else {
		miLocalStorage.removeItem('useBoldFont');
	}
});

watch(useSystemFont, () => {
	if (useSystemFont.value) {
		miLocalStorage.setItem('useSystemFont', 't');
	} else {
		miLocalStorage.removeItem('useSystemFont');
	}
});

watch([
	squareAvatars,
	setFederationAvatarShape,
], () => {
	misskeyApi('i/update', {
		setFederationAvatarShape: $i.policies.canSetFederationAvatarShape ? setFederationAvatarShape.value : false,
		isSquareAvatars: prefer.s.squareAvatars,
	});
});

watch([
	hemisphere,
	lang,
	showNoteActionsOnlyHover,
	overridedDeviceKind,
	disableStreamingTimeline,
	alwaysConfirmFollow,
	confirmWhenRevealingSensitiveMedia,
	showGapBetweenNotesInTimeline,
	mediaListWithOneImageAppearance,
	reactionsDisplaySize,
	limitWidthOfReaction,
	squareAvatars,
	highlightSensitiveMedia,
	enableSeasonalScreenEffect,
	chatShowSenderName,
	useStickyIcons,
	keepScreenOn,
	contextMenu,
	// fontSize,
	useSystemFont,
	makeEveryTextElementsSelectable,
	enableHorizontalSwipe,
	enablePullToRefresh,
	showFixedPostFormInReplies,
	useBlurEffect,
	useBlurEffectForModal,
	removeModalBgColorForBlur,
	useBoldFont,
	setFederationAvatarShape,
	showGapBetweenNotesInTimeline,
	showUnreadNotificationsCount,
	filesGridLayoutInUserPage,
	disableShowingAnimatedImages,
	showingAnimatedImages,
], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

watch([
	hideAvatarsInNote,
	mediaListWithOneImageAppearance,
	reactionsDisplaySize,
	limitWidthOfReaction,
	instanceTicker,
	highlightSensitiveMedia,
	enableAbsoluteTime,
	enableMarkByDate,
	showReplyTargetNote,
	showReplyTargetNoteInSemiTransparent,
	collapseLongNoteContent,
	collapseDefault,
	showNoteActionsOnlyHover,
	showClipButtonInNoteFooter,
	showReplyInNotification,
	showTranslateButtonInNote,
	showGapBodyOfTheNote,
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

let smashCount = 0;
let smashTimer: number | null = null;

function testNotification(): void {
	const notification: Misskey.entities.Notification = {
		id: Math.random().toString(),
		createdAt: new Date().toUTCString(),
		isRead: false,
		type: 'test',
	};

	globalEvents.emit('clientNotification', notification);

	// セルフ通知破壊 実績関連
	smashCount++;
	if (smashCount >= 10) {
		claimAchievement('smashTestNotificationButton');
		smashCount = 0;
	}
	if (smashTimer) {
		window.clearTimeout(smashTimer);
	}
	smashTimer = window.setTimeout(() => {
		smashCount = 0;
	}, 300);
}

function reloadTimeline() {
	globalEvents.emit('reloadTimeline');
}

function reloadNotification() {
	globalEvents.emit('reloadNotification');
}

async function cantUseSetFederationAvatarShape() {
	if (!$i.policies.canSetFederationAvatarShape && setFederationAvatarShape.value) setFederationAvatarShape.value = false;
}

function learnMoreCantUseSetFederationAvatarShape() {
	os.alert({
		type: 'info',
		title: i18n.ts.setFederationAvatarShape,
		text: i18n.tsx.cantUseThisFunctionDescription({ name: i18n.ts.setFederationAvatarShape }),
		caption: i18n.tsx.cantUseThisFunctionCaption({ name: i18n.ts.setFederationAvatarShape }),
	});
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
		const domains = trustedDomains.value
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

function reload() {
	unisonReload();
}

watch(trustedDomains, () => {
	trustedDomainsChanged.value = true;
});

onMounted(() => {
	if (fontSizeBefore.value == null) {
		fontSizeBefore.value = String(fontSize.value);
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.general,
	icon: 'ti ti-adjustments',
}));
</script>

<style lang="scss" module>
.label {
	font-size: 0.85em;
	padding: 0 0 8px 0;
	user-select: none;
}

.fontSize {
	padding: 20px 20px 28px;
	border-radius: 6px;
	text-align: center;
	background: var(--MI_THEME-bg);
}

.fontSizeSlider {
	display: flex;
	margin-top: -8px;
	border-top: solid .5px var(--MI_THEME-divider);

	> .fontSizeLeft, .fontSizeRight {
		position: relative;
		background: var(--MI_THEME-bg);
		font-weight: normal;
		line-height: 20px;
	}

	> .fontSizeLeft {
		padding: 7px 6px 7px 18px;
		border-bottom-left-radius: 6px;
		font-size: 12px;
	}

	> .fontSizeRight {
		padding: 7px 18px 7px 6px;
		border-bottom-right-radius: 6px;
		font-size: 18px;
	}
}

.mfmPreview {
	margin-top: 8px;
	text-align: center;
	max-width: 110px;
}
</style>
