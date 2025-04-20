<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/navbar" :label="i18n.ts.navbar" icon="ti ti-list" :keywords="['navbar', 'menu', 'sidebar']">
	<div class="_gaps_m">
		<FormSlot>
			<template #label>{{ i18n.ts.navbar }}</template>
			<MkContainer :showHeader="false">
				<Sortable
					v-model="items"
					itemKey="id"
					:animation="150"
					:handle="'.' + $style.itemHandle"
					@start="e => e.item.classList.add('active')"
					@end="e => e.item.classList.remove('active')"
				>
					<template #item="{element,index}">
						<div
							v-if="element.type === '-' || navbarItemDef[element.type]"
							:class="$style.item"
						>
							<button class="_button" :class="$style.itemHandle"><i class="ti ti-menu"></i></button>
							<i class="ti-fw" :class="[$style.itemIcon, navbarItemDef[element.type]?.icon]"></i><span :class="$style.itemText">{{ navbarItemDef[element.type]?.title ?? i18n.ts.divider }}</span>
							<button class="_button" :class="$style.itemRemove" @click="removeItem(index)"><i class="ti ti-x"></i></button>
						</div>
					</template>
				</Sortable>
			</MkContainer>
		</FormSlot>
		<div class="_buttons">
			<MkButton @click="addItem"><i class="ti ti-plus"></i> {{ i18n.ts.addItem }}</MkButton>
			<MkButton danger @click="reset"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>
			<MkButton primary class="save" @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
		</div>

		<SearchMarker :keywords="['menu', 'display']">
			<MkRadios v-model="menuDisplay">
				<template #label><SearchLabel>{{ i18n.ts.display }}</SearchLabel></template>
				<option value="sideFull">{{ i18n.ts._menuDisplay.sideFull }}</option>
				<option value="sideIcon">{{ i18n.ts._menuDisplay.sideIcon }}</option>
			</MkRadios>
		</SearchMarker>

		<SearchMarker :keywords="['navbar', 'sidebar', 'toggle', 'button', 'sub']">
			<MkPreferenceContainer k="showNavbarSubButtons">
				<MkSwitch v-model="showNavbarSubButtons">
					<template #label><SearchLabel>{{ i18n.ts._settings.showNavbarSubButtons }}</SearchLabel></template>
				</MkSwitch>
			</MkPreferenceContainer>
		</SearchMarker>

		<SearchMarker :keywords="['banner', 'display']">
			<MkPreferenceContainer k="bannerDisplay">
				<MkRadios v-model="bannerDisplay">
					<template #label><SearchLabel>{{ i18n.ts.displayBanner }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
					<option value="all">{{ i18n.ts._bannerDisplay.all }}</option>
					<option value="topBottom">{{ i18n.ts._bannerDisplay.topBottom }}</option>
					<option value="top">{{ i18n.ts._bannerDisplay.top }}</option>
					<option value="bottom">{{ i18n.ts._bannerDisplay.bottom }}</option>
					<option value="bg">{{ i18n.ts._bannerDisplay.bg }}</option>
					<option value="hide">{{ i18n.ts._bannerDisplay.hide }}</option>
				</MkRadios>
			</MkPreferenceContainer>
		</SearchMarker>

		<SearchMarker :keywords="['bottom']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.bottomNavbar }}</SearchLabel> <span class="_beta" style="vertical-align: middle;">CherryPick</span></template>
				<template v-if="!isMobile" #description>{{ i18n.ts.cannotBeUsedFunc }} <a class="_link" @click="learnMoreBottomNavbar">{{ i18n.ts.learnMore }}</a></template>
				<div class="_gaps_m">
					<MkDisableSection :disabled="isFriendly().value">
						<MkSwitch v-model="showMenuButtonInNavbar" :disabled="!isMobile">
							<template #label><i class="ti ti-menu-2"></i> <SearchLabel>{{ i18n.ts.menu }}</SearchLabel></template>
						</MkSwitch>
					</MkDisableSection>

					<MkSwitch v-model="showHomeButtonInNavbar" :disabled="!isMobile">
						<template #label><i class="ti ti-home"></i> <SearchLabel>{{ i18n.ts.home }}</SearchLabel></template>
					</MkSwitch>

					<MkSwitch v-model="showExploreButtonInNavbar" :disabled="!isMobile">
						<template #label><i class="ti ti-hash"></i> <SearchLabel>{{ i18n.ts.explore }}</SearchLabel></template>
					</MkSwitch>

					<MkSwitch v-model="showSearchButtonInNavbar" :disabled="!isMobile">
						<template #label><i class="ti ti-search"></i> <SearchLabel>{{ i18n.ts.search }}</SearchLabel></template>
					</MkSwitch>

					<MkSwitch v-model="showNotificationButtonInNavbar" :disabled="!isMobile">
						<template #label><i class="ti ti-bell"></i> <SearchLabel>{{ i18n.ts.notifications }}</SearchLabel></template>
					</MkSwitch>

					<MkSwitch v-model="showChatButtonInNavbar" :disabled="!isMobile">
						<template #label><i class="ti ti-messages"></i> <SearchLabel>{{ i18n.ts.chat }}</SearchLabel></template>
					</MkSwitch>

					<MkDisableSection :disabled="miLocalStorage.getItem('ui') === 'deck'">
						<MkSwitch v-model="showWidgetButtonInNavbar" :disabled="!isMobile">
							<template #label><i class="ti ti-apps"></i> <SearchLabel>{{ i18n.ts.widgets }}</SearchLabel></template>
						</MkSwitch>
					</MkDisableSection>

					<MkDisableSection :disabled="isFriendly().value">
						<MkSwitch v-model="showPostButtonInNavbar" :disabled="!isMobile">
							<template #label><i class="ti ti-pencil"></i> <SearchLabel>{{ i18n.ts.postNote }}</SearchLabel></template>
						</MkSwitch>
					</MkDisableSection>
				</div>
				<div class="_buttons" style="margin-top: 20px;">
					<MkButton :disabled="!isMobile" danger @click="resetButtomNavbar"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>
					<MkButton :disabled="!isMobile" primary class="save" @click="reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true })"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
				</div>
			</FormSection>
		</SearchMarker>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import FormSlot from '@/components/form/slot.vue';
import MkContainer from '@/components/MkContainer.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import MkDisableSection from '@/components/MkDisableSection.vue';
import FormSection from '@/components/form/section.vue';
import * as os from '@/os.js';
import { navbarItemDef } from '@/navbar.js';
import { store } from '@/store.js';
import { reloadAsk } from '@/utility/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { prefer } from '@/preferences.js';
import { PREF_DEF } from '@/preferences/def.js';
import { miLocalStorage } from '@/local-storage.js';
import { deviceKind } from '@/utility/device-kind.js';
import { isFriendly } from '@/utility/is-friendly.js';

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

const items = ref(prefer.s.menu.map(x => ({
	id: Math.random().toString(),
	type: x,
})));

const menuDisplay = computed(store.makeGetterSetter('menuDisplay'));
const showNavbarSubButtons = prefer.model('showNavbarSubButtons');
const bannerDisplay = prefer.model('bannerDisplay');

const showMenuButtonInNavbar = computed(store.makeGetterSetter('showMenuButtonInNavbar'));
const showHomeButtonInNavbar = computed(store.makeGetterSetter('showHomeButtonInNavbar'));
const showExploreButtonInNavbar = computed(store.makeGetterSetter('showExploreButtonInNavbar'));
const showSearchButtonInNavbar = computed(store.makeGetterSetter('showSearchButtonInNavbar'));
const showNotificationButtonInNavbar = computed(store.makeGetterSetter('showNotificationButtonInNavbar'));
const showChatButtonInNavbar = computed(store.makeGetterSetter('showChatButtonInNavbar'));
const showWidgetButtonInNavbar = computed(store.makeGetterSetter('showWidgetButtonInNavbar'));
const showPostButtonInNavbar = computed(store.makeGetterSetter('showPostButtonInNavbar'));

async function addItem(ev: MouseEvent) {
	const menu = Object.keys(navbarItemDef).filter(k => !prefer.s.menu.includes(k));
	os.popupMenu([
		...menu.map(k => ({
			type: 'button',
			text: navbarItemDef[k].title,
			icon: navbarItemDef[k].icon,
			action() {
				items.value = [...items.value, {
					id: Math.random().toString(),
					type: k,
				}];
			},
		})), {
			type: 'button',
			text: i18n.ts.divider,
			// Note: アイコン指定しないとテキストの位置が他の項目とずれる
			icon: 'ti',
			action() {
				items.value = [...items.value, {
					id: Math.random().toString(),
					type: '-',
				}];
			},
		},
	], ev.currentTarget ?? ev.target );
}

function removeItem(index: number) {
	items.value.splice(index, 1);
}

async function save() {
	prefer.commit('menu', items.value.map(x => x.type));
}

function reset() {
	items.value = PREF_DEF.menu.default.map(x => ({
		id: Math.random().toString(),
		type: x,
	}));
}

function resetButtomNavbar() {
	store.set('showMenuButtonInNavbar', !isFriendly().value);
	store.set('showHomeButtonInNavbar', true);
	store.set('showExploreButtonInNavbar', isFriendly().value);
	store.set('showSearchButtonInNavbar', false);
	store.set('showNotificationButtonInNavbar', true);
	store.set('showChatButtonInNavbar', isFriendly().value);
	store.set('showWidgetButtonInNavbar', true);
	store.set('showPostButtonInNavbar', !isFriendly().value);
}

function learnMoreBottomNavbar() {
	os.alert({
		type: 'info',
		text: i18n.ts.bottomNavbarDescription,
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.navbar,
	icon: 'ti ti-list',
}));
</script>

<style lang="scss" module>
.item {
	position: relative;
	display: block;
	line-height: 2.85rem;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	color: var(--MI_THEME-navFg);
}

.itemIcon {
	position: relative;
	width: 32px;
	margin-right: 8px;
}

.itemText {
	position: relative;
	font-size: 0.9em;
}

.itemRemove {
	position: absolute;
	z-index: 10000;
	width: 32px;
	height: 32px;
	color: #ff2a2a;
	right: 8px;
	opacity: 0.8;
}

.itemHandle {
	cursor: move;
	width: 32px;
	height: 32px;
	margin: 0 8px;
	opacity: 0.5;
}
</style>
