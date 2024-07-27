<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.iconOnly]: iconOnly }]">
	<div :class="$style.body">
		<div v-if="['all', 'bg'].includes(<string>defaultStore.state.bannerDisplay)" :class="[$style.banner, $style.topBanner]" :style="{ backgroundImage: `url(${ instance.bannerUrl })` }"></div>
		<div :class="$style.top">
			<div v-if="['all', 'topBottom', 'top'].includes(<string>defaultStore.state.bannerDisplay)" :class="[$style.banner, $style.topBanner]" :style="{ backgroundImage: `url(${ instance.bannerUrl })` }"></div>
			<button v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip.noDelay.right="instance.name ?? i18n.ts.instance" class="_button" :class="$style.instance" @click="openInstanceMenu">
				<img :src="instance.iconUrl || instance.faviconUrl || '/favicon.ico'" alt="" :class="$style.instanceIcon"/>
			</button>
		</div>
		<div :class="$style.middle">
			<MkA v-tooltip.noDelay.right="i18n.ts.timeline" :class="$style.item" :activeClass="$style.active" to="/" exact>
				<i :class="$style.itemIcon" class="ti ti-home ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.timeline }}</span>
			</MkA>
			<template v-for="item in menu">
				<div v-if="item === '-'" :class="$style.divider"></div>
				<component
					:is="navbarItemDef[item].to ? 'MkA' : 'button'"
					v-else-if="navbarItemDef[item] && (navbarItemDef[item].show !== false)"
					v-vibrate="defaultStore.state.vibrateSystem ? 5 : []"
					v-tooltip.noDelay.right="navbarItemDef[item].title"
					class="_button"
					:class="[$style.item, { [$style.active]: navbarItemDef[item].active }]"
					:activeClass="$style.active"
					:to="navbarItemDef[item].to"
					v-on="navbarItemDef[item].action ? { click: navbarItemDef[item].action } : {}"
				>
					<i class="ti-fw" :class="[$style.itemIcon, navbarItemDef[item].icon]"></i><span :class="$style.itemText">{{ navbarItemDef[item].title }}</span>
					<span v-if="navbarItemDef[item].indicated" :class="$style.itemIndicator">
						<span v-if="navbarItemDef[item].indicateValue && defaultStore.state.showUnreadNotificationsCount" class="_indicateCounter" :class="$style.itemIndicateValueIcon">{{ navbarItemDef[item].indicateValue }}</span>
						<i v-else class="_indicatorCircle"></i>
					</span>
				</component>
			</template>
			<div :class="$style.divider"></div>
			<MkA v-if="$i.isAdmin || $i.isModerator" v-tooltip.noDelay.right="i18n.ts.controlPanel" :class="$style.item" :activeClass="$style.active" to="/admin">
				<i :class="$style.itemIcon" class="ti ti-dashboard ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.controlPanel }}</span>
				<span v-if="controlPanelIndicated" :class="$style.itemIndicator"><i class="_indicatorCircle"></i></span>
			</MkA>
			<button v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" class="_button" :class="$style.item" @click="more">
				<i :class="$style.itemIcon" class="ti ti-dots ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.more }}</span>
				<span v-if="otherMenuItemIndicated" :class="$style.itemIndicator"><i class="_indicatorCircle"></i></span>
			</button>
			<MkA v-tooltip.noDelay.right="i18n.ts.settings" :class="$style.item" :activeClass="$style.active" to="/settings">
				<i :class="$style.itemIcon" class="ti ti-settings ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.settings }}</span>
			</MkA>
		</div>
		<div :class="$style.bottom">
			<div v-if="['all', 'topBottom', 'bottom'].includes(<string>defaultStore.state.bannerDisplay)" :class="[$style.banner, $style.bottomBanner]" :style="{ backgroundImage: `url(${ $i.bannerUrl })` }"></div>
			<button v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip.noDelay.right="defaultStore.state.renameTheButtonInPostFormToNya ? i18n.ts.nya : i18n.ts.note" class="_button" :class="[$style.post]" data-cy-open-post-form @click="os.post">
				<i class="ti ti-fw" :class="[$style.postIcon, defaultStore.state.renameTheButtonInPostFormToNya ? 'ti-paw-filled' : 'ti-pencil']"></i><span :class="$style.postText">{{ defaultStore.state.renameTheButtonInPostFormToNya ? i18n.ts.nya : i18n.ts.note }}</span>
			</button>
			<div :class="$style.profile">
				<button v-if="iconOnly" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip.noDelay.right="`${i18n.ts.account}: @${$i.username}`" class="_button" :class="[$style.account]" @click="openAccountMenu">
					<MkAvatar :user="$i" :class="$style.avatar"/>
				</button>
				<button v-else v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" v-tooltip.noDelay.right="`${i18n.ts.account}: @${$i.username}`" class="_button" :class="[$style.account]" @click="openProfile">
					<MkAvatar :user="$i" :class="$style.avatar"/><MkUserName class="_nowrap" :class="$style.acct" :user="$i"/>
				</button>
				<button v-if="!iconOnly" v-vibrate="defaultStore.state.vibrateSystem ? 5 : []" class="_button" :class="[$style.drawer]" @click="openAccountMenu"><i class="ti ti-chevron-up"/></button>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { openInstanceMenu } from '@/ui/_common_/common.js';
import * as os from '@/os.js';
import { navbarItemDef } from '@/navbar.js';
import { $i, openAccountMenu as openAccountMenu_ } from '@/account.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { mainRouter } from '@/router/main.js';
import { version } from '@/config.js';

const iconOnly = ref(false);

const menu = computed(() => defaultStore.state.menu);
const otherMenuItemIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (menu.value.includes(def)) continue;
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});
const controlPanelIndicated = ref(false);
const releasesCherryPick = ref();

if ($i.isAdmin ?? $i.isModerator) {
	misskeyApi('admin/abuse-user-reports', {
		state: 'unresolved',
		limit: 1,
	}).then(reports => {
		if (reports.length > 0) controlPanelIndicated.value = true;
	});

	fetch('https://api.github.com/repos/kokonect-link/cherrypick/releases', {
		method: 'GET',
	}).then(res => res.json())
		.then(async res => {
			const meta = await misskeyApi('admin/meta');
			if (meta.enableReceivePrerelease) releasesCherryPick.value = res;
			else releasesCherryPick.value = res.filter(x => x.prerelease === false);
			if ((version < releasesCherryPick.value[0].tag_name) && (meta.skipCherryPickVersion < releasesCherryPick.value[0].tag_name)) controlPanelIndicated.value = true;
		});
}

const calcViewState = () => {
	iconOnly.value = (window.innerWidth <= 1279) || (defaultStore.state.menuDisplay === 'sideIcon');
};

calcViewState();

window.addEventListener('resize', calcViewState);

watch(defaultStore.reactiveState.menuDisplay, () => {
	calcViewState();
});

function openAccountMenu(ev: MouseEvent) {
	openAccountMenu_({
		withExtraOperation: true,
	}, ev);
}

function more(ev: MouseEvent) {
	const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/MkLaunchPad.vue')), {
		src: ev.currentTarget ?? ev.target,
	}, {
		closed: () => dispose(),
	});
}

function openProfile() {
	mainRouter.push(`/@${$i.username}`);
}
</script>

<style lang="scss" module>
.root {
	--nav-width: 250px;
	--nav-icon-only-width: 80px;

	flex: 0 0 var(--nav-width);
	width: var(--nav-width);
	box-sizing: border-box;
}

.body {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1001;
	width: var(--nav-icon-only-width);
	height: 100dvh;
	box-sizing: border-box;
	overflow: auto;
	overflow-x: clip;
	overscroll-behavior: contain;
	background: var(--navBg);
	contain: strict;
	display: flex;
	flex-direction: column;
}

.root:not(.iconOnly) {
	.body {
		width: var(--nav-width);
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 1;
		padding: 20px 0;
		background: var(--X14);
		-webkit-backdrop-filter: var(--blur, blur(8px));
		backdrop-filter: var(--blur, blur(8px));
	}

	.banner {
		position: absolute;
		left: 0;
		width: 100%;
		background-size: cover;
		background-position: center center;

		&.topBanner {
			top: 0;
			height: 100%;
			-webkit-mask-image: linear-gradient(0deg, rgba(0,0,0,0) 15%, rgba(0,0,0,0.75) 100%);
			mask-image: linear-gradient(0deg, rgba(0,0,0,0) 15%, rgba(0,0,0,0.75) 100%);
		}

		&.bottomBanner {
			bottom: 0;
			height: 100%;
			background-position-y: 20px;
			-webkit-mask-image: linear-gradient(0deg,rgba(0,0,0,.75) 15%,rgba(0,0,0,0) 80%);
			mask-image: linear-gradient(0deg,rgba(0,0,0,.75) 15%,rgba(0,0,0,0) 80%);
		}
	}

	.instance {
		position: relative;
		display: block;
		text-align: center;
		width: 100%;

		&:focus-visible {
			outline: none;

			> .instanceIcon {
				outline: 2px solid var(--focus);
				outline-offset: 2px;
			}
		}
	}

	.instanceIcon {
		display: inline-block;
		width: 50px;
		aspect-ratio: 1;
		margin-right: 150px;
		border-radius: 18px;
	}

	.bottom {
		position: sticky;
		bottom: 0;
		padding-top: 20px;
		background: var(--X14);
		-webkit-backdrop-filter: var(--blur, blur(8px));
		backdrop-filter: var(--blur, blur(8px));
	}

	.post {
		position: relative;
		display: block;
		z-index: 2;
		width: 100%;
		height: 40px;
		color: var(--fgOnAccent);
		font-weight: bold;
		text-align: left;

		&::before {
			content: "";
			display: block;
			width: calc(100% - 38px);
			height: 100%;
			margin: auto;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			border-radius: 999px;
			background: linear-gradient(90deg, var(--buttonGradateA), var(--buttonGradateB));
		}

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--fgOnAccent);
				outline-offset: -4px;
			}
		}

		&:hover, &.active {
			&::before {
				background: var(--accentLighten);
			}
		}
	}

	.postIcon {
		position: relative;
		margin-left: 30px;
		margin-right: 8px;
		width: 32px;
	}

	.postText {
		position: relative;
	}

	.profile {
		display: flex;
	}

	.account {
		position: relative;
		display: flex;
		z-index: 2;
		align-items: center;
		padding: 20px 0 20px 30px;
		width: 100%;
		text-align: left;
		box-sizing: border-box;

		&:focus-visible {
			outline: none;

			> .avatar {
				box-shadow: 0 0 0 4px var(--focus);
			}
		}
	}

	.avatar {
		display: block;
		flex-shrink: 0;
		position: relative;
		width: 32px;
		aspect-ratio: 1;
		margin-right: 8px;
	}

	.acct {
		display: block;
		flex-shrink: 1;
		padding-right: 8px;
		margin-left: 5px;
		font-weight: bold;
		max-width: 100px;
		text-overflow: clip !important;
	}

	.drawer {
		display: flex;
		z-index: 2;
		align-items: center;
		padding: 16px;
		margin-right: 16px;
	}

	.middle {
		flex: 1;
	}

	.divider {
		margin: 16px 16px;
		border-top: solid 0.5px var(--divider);
	}

	.item {
		position: relative;
		display: block;
		padding-left: 30px;
		line-height: 2.85rem;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: 100%;
		text-align: left;
		box-sizing: border-box;
		color: var(--navFg);
		margin-bottom: 0.5rem;

		&:hover {
			text-decoration: none;
			color: var(--navHoverFg);
		}

		&.active {
			color: var(--navActive);
		}

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--focus);
				outline-offset: -2px;
			}
		}

		&:hover, &.active, &:focus {
			color: var(--accent);

			&::before {
				content: "";
				display: block;
				width: calc(100% - 34px);
				height: 100%;
				margin: auto;
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				border-radius: 15px;
				background: var(--accentedBg);
			}
		}
	}

	.itemIcon {
		position: relative;
		width: 32px;
		margin-right: 8px;
		font-size: 1.1em;
	}

	.itemIndicator {
		position: absolute;
		top: 0;
		left: 20px;
		color: var(--navIndicator);
		font-size: 8px;
		animation: global-blink 1s infinite;

		&:has(.itemIndicateValueIcon) {
			animation: none;
			left: auto;
			right: 40px;
		}
	}

	.itemText {
		position: relative;
		font-size: 0.9em;
	}
}

.root.iconOnly {
	flex: 0 0 var(--nav-icon-only-width);
	width: var(--nav-icon-only-width);

	.body {
		width: var(--nav-icon-only-width);
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 1;
		padding: 20px 0;
		background: var(--X14);
		-webkit-backdrop-filter: var(--blur, blur(8px));
		backdrop-filter: var(--blur, blur(8px));
	}

	.instance {
		display: block;
		text-align: center;
		width: 100%;

		&:focus-visible {
			outline: none;

			> .instanceIcon {
				outline: 2px solid var(--focus);
				outline-offset: 2px;
			}
		}
	}

	.instanceIcon {
		display: inline-block;
		width: 30px;
		aspect-ratio: 1;
	}

	.bottom {
		position: sticky;
		bottom: 0;
		padding-top: 20px;
		background: var(--X14);
		-webkit-backdrop-filter: var(--blur, blur(8px));
		backdrop-filter: var(--blur, blur(8px));
	}

	.post {
		display: block;
		position: relative;
		width: 100%;
		height: 52px;
		text-align: center;

		&::before {
			content: "";
			display: block;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			width: 52px;
			aspect-ratio: 1/1;
			border-radius: 100%;
			background: linear-gradient(90deg, var(--buttonGradateA), var(--buttonGradateB));
		}

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--fgOnAccent);
				outline-offset: -4px;
			}
		}

		&:hover, &.active {
			&::before {
				background: var(--accentLighten);
			}
		}
	}

	.postIcon {
		position: relative;
		color: var(--fgOnAccent);
	}

	.postText {
		display: none;
	}

	.account {
		display: block;
		text-align: center;
		padding: 20px 0;
		width: 100%;

		&:focus-visible {
			outline: none;

			> .avatar {
				box-shadow: 0 0 0 4px var(--focus);
			}
		}
	}

	.avatar {
		display: inline-block;
		width: 38px;
		aspect-ratio: 1;
	}

	.acct {
		display: none;
	}

	.middle {
		flex: 1;
	}

	.divider {
		margin: 8px auto;
		width: calc(100% - 32px);
		border-top: solid 0.5px var(--divider);
	}

	.item {
		display: block;
		position: relative;
		padding: 18px 0;
		width: 100%;
		text-align: center;

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--focus);
				outline-offset: -2px;
			}
		}

		&:hover, &.active, &:focus {
			text-decoration: none;
			color: var(--accent);

			&::before {
				content: "";
				display: block;
				height: 100%;
				aspect-ratio: 1;
				margin: auto;
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				border-radius: 15px;
				background: var(--accentedBg);
			}

			> .icon,
			> .text {
				opacity: 1;
			}
		}
	}

	.itemIcon {
		display: block;
		margin: 0 auto;
		opacity: 0.7;
	}

	.itemText {
		display: none;
	}

	.itemIndicator {
		position: absolute;
		top: 6px;
		left: 24px;
		color: var(--navIndicator);
		font-size: 8px;
		animation: global-blink 1s infinite;

		&:has(.itemIndicateValueIcon) {
			animation: none;
			top: 4px;
			left: auto;
			right: 4px;
		}
	}
}
</style>
