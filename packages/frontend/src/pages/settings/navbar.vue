<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
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

	<MkRadios v-model="menuDisplay">
		<template #label>{{ i18n.ts.display }}</template>
		<option value="sideFull">{{ i18n.ts._menuDisplay.sideFull }}</option>
		<option value="sideIcon">{{ i18n.ts._menuDisplay.sideIcon }}</option>
		<option value="top">{{ i18n.ts._menuDisplay.top }}</option>
		<!-- <MkRadio v-model="menuDisplay" value="hide" disabled>{{ i18n.ts._menuDisplay.hide }}</MkRadio>--> <!-- TODO: サイドバーを完全に隠せるようにすると、別途ハンバーガーボタンのようなものをUIに表示する必要があり面倒 -->
	</MkRadios>

	<MkRadios v-model="bannerDisplay">
		<template #label>{{ i18n.ts.displayBanner }} <span class="_beta">CherryPick</span></template>
		<option value="all">{{ i18n.ts._bannerDisplay.all }}</option>
		<option value="topBottom">{{ i18n.ts._bannerDisplay.topBottom }}</option>
		<option value="top">{{ i18n.ts._bannerDisplay.top }}</option>
		<option value="bottom">{{ i18n.ts._bannerDisplay.bottom }}</option>
		<option value="bg">{{ i18n.ts._bannerDisplay.bg }}</option>
		<option value="hide">{{ i18n.ts._bannerDisplay.hide }}</option>
	</MkRadios>

	<FormSection>
		<template #label>{{ i18n.ts.bottomNavbar }} <span class="_beta">CherryPick</span></template>
		<template v-if="!isMobile" #description>{{ i18n.ts.cannotBeUsedFunc }} <a class="_link" @click="learnMoreBottomNavbar">{{ i18n.ts.learnMore }}</a></template>
		<div class="_gaps_m">
			<MkSwitch v-if="!isFriendly" v-model="showMenuButtonInNavbar" :disabled="!isMobile"><i class="ti ti-menu-2"></i> {{ i18n.ts.menu }}</MkSwitch>
			<MkSwitch v-model="showHomeButtonInNavbar" :disabled="!isMobile"><i class="ti ti-home"></i> {{ i18n.ts.home }}</MkSwitch>
			<MkSwitch v-model="showExploreButtonInNavbar" :disabled="!isMobile"><i class="ti ti-hash"></i> {{ i18n.ts.explore }}</MkSwitch>
			<MkSwitch v-model="showSearchButtonInNavbar" :disabled="!isMobile"><i class="ti ti-search"></i> {{ i18n.ts.search }}</MkSwitch>
			<MkSwitch v-model="showNotificationButtonInNavbar" :disabled="!isMobile"><i class="ti ti-bell"></i> {{ i18n.ts.notifications }}</MkSwitch>
			<MkSwitch v-model="showMessageButtonInNavbar" :disabled="!isMobile"><i class="ti ti-messages"></i> {{ i18n.ts.messaging }}</MkSwitch>
			<MkSwitch v-if="miLocalStorage.getItem('ui') !== 'deck'" v-model="showWidgetButtonInNavbar" :disabled="!isMobile"><i class="ti ti-apps"></i> {{ i18n.ts.widgets }}</MkSwitch>
			<MkSwitch v-if="!isFriendly" v-model="showPostButtonInNavbar" :disabled="!isMobile"><i class="ti ti-pencil"></i> {{ i18n.ts.postNote }}</MkSwitch>
		</div>
		<div class="_buttons" style="margin-top: 20px;">
			<MkButton :disabled="!isMobile" danger @click="resetButtomNavbar"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>
			<MkButton :disabled="!isMobile" primary class="save" @click="reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true })"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import FormSlot from '@/components/form/slot.vue';
import MkContainer from '@/components/MkContainer.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';
import * as os from '@/os.js';
import { navbarItemDef } from '@/navbar.js';
import { defaultStore } from '@/store.js';
import { reloadAsk } from '@/scripts/reload-ask.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { miLocalStorage } from '@/local-storage.js';
import { deviceKind } from '@/scripts/device-kind.js';

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});
const isFriendly = ref(miLocalStorage.getItem('ui') === 'friendly');

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

const items = ref(defaultStore.state.menu.map(x => ({
	id: Math.random().toString(),
	type: x,
})));

const menuDisplay = computed(defaultStore.makeGetterSetter('menuDisplay'));
const bannerDisplay = computed(defaultStore.makeGetterSetter('bannerDisplay'));

const showMenuButtonInNavbar = computed(defaultStore.makeGetterSetter('showMenuButtonInNavbar'));
const showHomeButtonInNavbar = computed(defaultStore.makeGetterSetter('showHomeButtonInNavbar'));
const showExploreButtonInNavbar = computed(defaultStore.makeGetterSetter('showExploreButtonInNavbar'));
const showSearchButtonInNavbar = computed(defaultStore.makeGetterSetter('showSearchButtonInNavbar'));
const showNotificationButtonInNavbar = computed(defaultStore.makeGetterSetter('showNotificationButtonInNavbar'));
const showMessageButtonInNavbar = computed(defaultStore.makeGetterSetter('showMessageButtonInNavbar'));
const showWidgetButtonInNavbar = computed(defaultStore.makeGetterSetter('showWidgetButtonInNavbar'));
const showPostButtonInNavbar = computed(defaultStore.makeGetterSetter('showPostButtonInNavbar'));

async function addItem(ev: MouseEvent) {
	const menu = Object.keys(navbarItemDef).filter(k => !defaultStore.state.menu.includes(k));
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
	defaultStore.set('menu', items.value.map(x => x.type));
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
}

function reset() {
	items.value = defaultStore.def.menu.default.map(x => ({
		id: Math.random().toString(),
		type: x,
	}));
}

function resetButtomNavbar() {
	defaultStore.set('showHomeButtonInNavbar', !isFriendly.value);
	defaultStore.set('showExploreButtonInNavbar', isFriendly.value);
	defaultStore.set('showSearchButtonInNavbar', false);
	defaultStore.set('showNotificationButtonInNavbar', true);
	defaultStore.set('showMessageButtonInNavbar', isFriendly.value);
	defaultStore.set('showWidgetButtonInNavbar', true);
}

function learnMoreBottomNavbar() {
	os.alert({
		type: 'info',
		text: i18n.ts.bottomNavbarDescription,
	});
}

watch([menuDisplay, bannerDisplay], async () => {
	await reloadAsk({ reason: i18n.ts.reloadToApplySetting, unison: true });
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
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
	color: var(--navFg);
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
