<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="show" ref="el" :class="[$style.root, { [$style.reduceBlurEffect]: !prefer.s.useBlurEffect, [$style.reduceAnimation]: !prefer.s.animation, [$style.scrollToTransparent]: showEl }]">
	<div :class="[$style.upper, { [$style.slim]: narrow || isFriendly().value, [$style.thin]: thin_, [$style.hideTitle]: hideTitle && isFriendly().value }]">
		<div v-if="!thin_ && !canBack && !notification" :class="$style.buttonsLeft">
			<button class="_button" :class="[$style.button, $style.goBack]" @click.stop="goBack" @touchstart="preventDrag"><i class="ti ti-arrow-left"></i></button>
		</div>
		<div v-if="!thin_ && narrow && props.displayMyAvatar && $i && !isFriendly().value && !notification" class="_button" :class="$style.buttonsLeft" @click="openAccountMenu">
			<MkAvatar :class="$style.avatar" :user="$i"/>
		</div>
		<div v-else-if="!thin_ && narrow && !hideTitle && canBack" :class="$style.buttonsLeft"/>
		<div v-if="leftSpacing" :class="leftSpacing.class ? $style.buttonsLeft : undefined" :style="leftSpacing.style">
			<div v-for="(width, index) in leftSpacing.children" :key="index" :style="width"/>
		</div>

		<template v-if="props.title || props.icon">
			<div v-if="!hideTitle" :class="[$style.titleContainer, { [$style.titleContainer_canBack]: !canBack }]" @click="top">
				<i v-if="props.icon" :class="[$style.titleIcon, props.icon]"></i>

				<div :class="$style.title">
					<div v-if="props.title">{{ props.title }}</div>
				</div>
			</div>
			<XTabs v-if="(!narrow || hideTitle) && !isFriendly().value" :class="[$style.tabs, { [$style.tabs_canBack]: !canBack }]" :tab="tab" :tabs="tabs" :rootEl="el" @update:tab="key => emit('update:tab', key)" @tabClick="onTabClick"/>
		</template>
		<template v-else-if="pageMetadata">
			<div v-if="!hideTitle" :class="[$style.titleContainer, { [$style.titleContainer_canBack]: !canBack }]" @click="(ev) => topWithMenu(ev)">
				<div v-if="pageMetadata.avatar" :class="$style.titleAvatarContainer">
					<MkAvatar :class="$style.titleAvatar" :user="pageMetadata.avatar" indicator/>
				</div>
				<i v-else-if="pageMetadata.icon" :class="[$style.titleIcon, pageMetadata.icon]"></i>

				<div :class="$style.title">
					<MkUserName v-if="pageMetadata.userName" :user="pageMetadata.userName" :nowrap="true"/>
					<div v-else-if="pageMetadata.title">{{ pageMetadata.title }}</div>
					<div v-if="pageMetadata.subtitle" :class="$style.subtitle">
						{{ pageMetadata.subtitle }}
					</div>
				</div>
			</div>
			<XTabs v-if="(!narrow || hideTitle) && !isFriendly().value" :class="[$style.tabs, { [$style.tabs_canBack]: !canBack }]" :tab="tab" :tabs="tabs" :rootEl="el" @update:tab="key => emit('update:tab', key)" @tabClick="onTabClick"/>
		</template>
		<div v-if="!thin_ && !narrow && (actions && actions.length > 0) && hideTitle && ['index'].includes(<string>mainRouter.currentRoute.value.name)" :class="$style.buttonsRight"/>
		<div v-if="(!thin_ && narrow && !hideTitle) || (actions && actions.length > 0)" :class="$style.buttonsRight">
			<template v-for="action in actions">
				<button v-tooltip.noDelay="action.text" class="_button" :class="[$style.button, { [$style.highlighted]: action.highlighted }]" @click.stop="action.handler" @touchstart="preventDrag"><i :class="action.icon"></i></button>
			</template>
		</div>
		<div v-else-if="!thin_ && !canBack && !(actions && actions.length > 0)" :class="$style.buttonsRight"/>
		<div v-if="pageMetadata && pageMetadata.avatar && ($i && $i.id !== pageMetadata.userName?.id) && mainRouter.currentRoute.value.name === 'user' && !disableFollowButton && !notification" :class="$style.followButton">
			<MkFollowButton :user="pageMetadata.avatar" :transparent="false" :full="!narrow"/>
		</div>
	</div>
	<div v-if="((narrow && !hideTitle) || isFriendly().value) && hasTabs" :class="[$style.lower, { [$style.slim]: narrow && !isFriendly().value, [$style.thin]: thin_, [$style.lowerFriendly]: isFriendly().value}]">
		<div v-if="!thin_ && isFriendly().value" :class="$style.buttonsLeft" style="min-width: 0; width: 0; margin-right: auto;">
		</div>
		<XTabs :class="$style.tabs" :tab="tab" :tabs="tabs" :rootEl="el" @update:tab="key => emit('update:tab', key)" @tabClick="onTabClick"/>
	</div>
</div>
</template>

<script lang="ts">
import type { PageHeaderItem } from '@/types/page-header.js';
import type { PageMetadata } from '@/page.js';
import type { Tab } from './MkPageHeader.tabs.vue';

export type PageHeaderProps = {
	overridePageMetadata?: PageMetadata;
	tabs?: Tab[];
	tab?: string;
	actions?: PageHeaderItem[] | null;
	thin?: boolean;
	hideTitle?: boolean;
	canOmitTitle?: boolean;
	displayMyAvatar?: boolean;
	disableFollowButton?: boolean;
	notification?: boolean;
	title?: string;
	icon?: string;
};
</script>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, inject, useTemplateRef, computed } from 'vue';
import { getScrollPosition, scrollToTop } from '@@/js/scroll.js';
import XTabs from './MkPageHeader.tabs.vue';
import { globalEvents } from '@/events.js';
import { getAccountMenu } from '@/accounts.js';
import { $i } from '@/i.js';
import { DI } from '@/di.js';
import * as os from '@/os.js';
import { mainRouter } from '@/router.js';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences.js';
import { isFriendly } from '@/utility/is-friendly.js';
import { scrollToVisibility } from '@/utility/scroll-to-visibility.js';
import MkFollowButton from '@/components/MkFollowButton.vue';
import { haptic } from '@/utility/haptic.js';

const { showEl } = scrollToVisibility();

const canBack = ref(['index', 'explore', 'my-notifications', 'chat'].includes(<string>mainRouter.currentRoute.value.name));

const props = withDefaults(defineProps<PageHeaderProps>(), {
	tabs: () => ([] as Tab[]),
});

const emit = defineEmits<{
	(ev: 'update:tab', key: string);
}>();

//const viewId = inject(DI.viewId);
const injectedPageMetadata = inject(DI.pageMetadata, ref(null));
const pageMetadata = computed(() => props.overridePageMetadata ?? injectedPageMetadata.value);

const hideTitle = computed(() => inject('shouldOmitHeaderTitle', false) || props.hideTitle || (props.canOmitTitle && props.tabs.length > 0));
const thin_ = props.thin || inject('shouldHeaderThin', false);

const el = useTemplateRef('el');
const narrow = ref(false);
const hasTabs = computed(() => props.tabs.length > 0);
const hasActions = computed(() => props.actions && props.actions.length > 0);
const show = computed(() => {
	return !hideTitle.value || hasTabs.value || hasActions.value;
});

const leftSpacing = computed(() => {
	if (thin_ || props.notification) return null;

	const actions = props.actions;
	const actionsLength = actions?.length ?? 0;

	if (actionsLength > 1 && isFriendly().value) {
		const widths: string[] = [];
		if (!narrow.value && canBack.value) widths.push('width: 50px; margin-right: 8px;');
		if (actionsLength >= 3) widths.push('width: 42px;');
		widths.push('width: 34px;');
		return { class: true, style: 'min-width: initial; margin-right: initial;', children: widths };
	}

	if (!narrow.value && actionsLength === 1 && isFriendly().value && ['my-notifications', 'chat'].includes(<string>mainRouter.currentRoute.value.name)) {
		return { class: false, style: '', children: ['width: 50px; margin-right: 8px;'] };
	}

	if (!narrow.value && actionsLength > 1 && !isFriendly().value && mainRouter.currentRoute.value.name === 'index') {
		return { class: true, style: 'margin-right: auto;', children: ['width: 84px;'] };
	}

	if (narrow.value && actionsLength > 1 && !isFriendly().value && mainRouter.currentRoute.value.name !== 'index') {
		return { class: false, style: '', children: ['width: 34px;'] };
	}

	if (pageMetadata.value?.avatar && mainRouter.currentRoute.value.name === 'user' && $i?.id !== pageMetadata.value.avatar.id) {
		return { class: false, style: '', children: ['width: 50px;'] };
	}

	return null;
});

const preventDrag = (ev: TouchEvent) => {
	ev.stopPropagation();
};

const top = () => {
	if (el.value) {
		scrollToTop(el.value as HTMLElement, { behavior: 'smooth' });
	}
};

const topWithMenu = (ev: MouseEvent) => {
	const pos = getScrollPosition(el.value as HTMLElement);
	if (el.value && pos !== 0) {
		scrollToTop(el.value as HTMLElement, { behavior: 'smooth' });
	} else if (pos === 0) {
		os.popupMenu([{
			text: i18n.ts.reload,
			icon: 'ti ti-refresh',
			action: () => {
				window.location.reload();
			},
		}], ev.currentTarget ?? ev.target);
	}
};

async function openAccountMenu(ev: MouseEvent) {
	haptic();

	const menuItems = await getAccountMenu({
		withExtraOperation: true,
	});

	os.popupMenu(menuItems, ev.currentTarget ?? ev.target);
}

function onTabClick(): void {
	top();
}

function goBack() {
	haptic();

	window.history.back();
}

let ro: ResizeObserver | null;

onMounted(() => {
	if (el.value?.parentElement) {
		narrow.value = el.value.parentElement.offsetWidth < 500;
		ro = new ResizeObserver((entries, observer) => {
			if (el.value?.parentElement && window.document.body.contains(el.value as HTMLElement)) {
				narrow.value = el.value.parentElement.offsetWidth < 500;
			}
		});
		ro.observe(el.value.parentElement as HTMLElement);
	}
});

onUnmounted(() => {
	if (ro) ro.disconnect();
});
</script>

<style lang="scss" module>
.root {
	background: color(from var(--MI_THEME-pageHeaderBg) srgb r g b / 0.75);
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
	border-bottom: solid 0.5px transparent;
	width: 100%;
	color: var(--MI_THEME-pageHeaderFg);
	transition: background-color 0.5s;

	&.reduceBlurEffect {
		background-color: color(from var(--MI_THEME-bg) srgb r g b / 1);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}

	&.reduceAnimation {
		transition: background-color 0s;
	}

	&.scrollToTransparent {
		background-color: transparent;
	}
}

@container style(--MI_THEME-pageHeaderBg: var(--MI_THEME-bg)) {
	.root {
		border-bottom: solid 0.5px var(--MI_THEME-divider);
	}
}

.upper,
.lower {
	width: 100%;
	background: transparent;
}

.upper {
	--height: 50px;
	display: flex;
	gap: var(--MI-margin);
	height: var(--height);

	.tabs:first-child {
		margin-left: auto;
		padding: 0 12px;
	}
	.tabs {
		margin-right: auto;
	}

	.tabs_canBack {
		padding: 0 12px;
	}

	&.thin {
		--height: 40px;

		> .buttons {
			> .button {
				font-size: 0.9em;
			}
		}
	}

	&.slim {
		text-align: center;
		gap: 0;

		.tabs:first-child {
			margin-left: 0;
		}
		> .titleContainer {
			margin: 0 auto;
			max-width: 100%;
		}
	}
}

.lower {
	--height: 40px;
	height: var(--height);

	.tabs {
		margin-right: auto;
	}
}

.hideTitle {
	display: none;
}

.buttons {
	--MI-margin: 8px;
	display: flex;
	align-items: center;
	min-width: var(--height);
	height: var(--height);
	&:empty {
		width: var(--height);
	}
}

.buttonsLeft {
	composes: buttons;
	margin: 0 var(--MI-margin) 0 0;
}

.buttonsRight {
	composes: buttons;
	margin: 0 0 0 var(--MI-margin);
}

.followButton {
  composes: buttons;
  margin: 0 var(--MI-margin) 0 0;
}

.goBack {
	margin-left: 8px;

	> i {
		margin: auto;
		font-size: medium;
	}
}

.avatar {
	$size: 32px;
	display: inline-block;
	width: $size;
	height: $size;
	vertical-align: bottom;
	margin: 0 8px;
}

.button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: var(--height);
	width: calc(var(--height) - (var(--MI-margin)));
	box-sizing: border-box;
	position: relative;
	border-radius: 5px;

	&:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	&.highlighted {
		color: var(--MI_THEME-accent);
	}
}

.fullButton {
	& + .fullButton {
		margin-left: 12px;
	}
}

.titleContainer {
	display: flex;
	align-items: center;
	max-width: min(30vw, 400px);
	overflow: clip;
	white-space: nowrap;
	text-align: left;
	font-weight: bold;
	flex-shrink: 1;
	margin-left: 24px;
  -webkit-tap-highlight-color: transparent;
}

.titleContainer_canBack {
	margin-left: -16px;
}

.titleAvatarContainer {
	$size: 32px;
	contain: strict;
	overflow: clip;
	width: $size;
	height: $size;
	padding: 8px;
	flex-shrink: 0;
}

.titleAvatar {
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.titleIcon {
	margin-right: 8px;
	width: 16px;
	text-align: center;
}

.title {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	line-height: 1.1;
}

.subtitle {
	opacity: 0.6;
	font-size: 0.8em;
	font-weight: normal;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	&.activeTab {
		text-align: center;

		> .chevron {
			display: inline-block;
			margin-left: 6px;
		}
	}
}

.lowerFriendly {
	display: flex;
}

@container (max-width: 500px) {
  .followButton {
    margin: 0;
  }
}
</style>
