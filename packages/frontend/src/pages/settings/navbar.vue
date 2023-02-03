<template>
<div class="_gaps_m">
	<!--
	<MkTextarea v-model="items" tall manual-save>
		<template #label>{{ i18n.ts.navbar }}</template>
		<template #caption><button class="_textButton" @click="addItem">{{ i18n.ts.addItem }}</button></template>
	</MkTextarea>
	-->

	<MkRadios v-model="menuDisplay">
		<template #label>{{ i18n.ts.display }}</template>
		<option value="sideFull">{{ i18n.ts._menuDisplay.sideFull }}</option>
		<option value="sideIcon">{{ i18n.ts._menuDisplay.sideIcon }}</option>
		<option value="top">{{ i18n.ts._menuDisplay.top }}</option>
		<!-- <MkRadio v-model="menuDisplay" value="hide" disabled>{{ i18n.ts._menuDisplay.hide }}</MkRadio>--> <!-- TODO: サイドバーを完全に隠せるようにすると、別途ハンバーガーボタンのようなものをUIに表示する必要があり面倒 -->
	</MkRadios>

	<div class="asdiokco _formItem _formPanel">
		<Sortable class="draggable" v-model="items" :item-key="item => item" animation="150" delay="100" delay-on-touch-only="true">
			<template #item="{element: item}">
				<div class="item">
					<i v-if="!item.startsWith('-:')" :class="navbarItemDef[item].icon"/>
					<template v-if="item.startsWith('-:')">
						<i class="ti ti-minus"/>
						<span v-text="$ts.divider"/>
					</template>
					<span v-else v-text="(navbarItemDef[item] ? navbarItemDef[item].title : item)"/>
					<div class="del" @click="del(item)"><i class="ti ti-x"/></div>
				</div>
			</template>
		</Sortable>
	</div>

	<div class="wthhikgt">
		<MkButton @click="addItem"><i class="ti ti-plus"></i> {{ i18n.ts.addItem }}</MkButton>
		<MkButton v-if="isChanged" @click="save"><i class="ti ti-save"></i> {{ i18n.ts.save }}</MkButton>
		<MkButton danger @click="reset()"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton>
	</div>

	<!-- <MkButton danger @click="reset()"><i class="ti ti-reload"></i> {{ i18n.ts.default }}</MkButton> -->
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { navbarItemDef } from '@/navbar';
import { defaultStore } from '@/store';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { v4 as uuid } from 'uuid';

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

// const items = ref(defaultStore.state.menu.join('\n'));
const items = ref([]);
items.value = defaultStore.state.menu.map(it => it === '-' ? '-:' + uuid() : it);

// const split = computed(() => items.value.trim().split('\n').filter(x => x.trim() !== ''));
const menuDisplay = computed(defaultStore.makeGetterSetter('menuDisplay'));

let isChanged = false;

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

async function addItem() {
	const menu = Object.keys(navbarItemDef).filter(k => !defaultStore.state.menu.includes(k));
	const { canceled, result: item } = await os.select({
		title: i18n.ts.addItem,
		items: [...menu.map(k => ({
			value: k, text: navbarItemDef[k].title,
		})), {
			value: '-:' + uuid(), text: i18n.ts.divider,
		}],
	});
	if (canceled) return;
	items.value = [...items.value, item];
	defaultStore.set('menu', items.value.map(it => it.startsWith('-:') ? '-' : it));
}

async function del(item) {
	items.value = items.value.filter(it => it !== item);
}

async function save() {
	// defaultStore.set('menu', split.value);
	defaultStore.set('menu', items.value.map(it => it.startsWith('-:') ? '-' : it));
	await reloadAsk();
}

function reset() {
	defaultStore.reset('menu');
	// items.value = defaultStore.state.menu.join('\n');
	items.value = defaultStore.state.menu.map(it => it === '-' ? '-:' + uuid() : it);
}

watch(items, async () => {
	// await save();
	isChanged = true;
}, {
	deep: true,
});

watch(menuDisplay, async () => {
	await reloadAsk();
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.navbar,
	icon: 'ti ti-list',
});
</script>

<style lang="scss" scoped>
.asdiokco {
	padding: 16px;

	> .draggable {
		display: flex;
		flex-direction: column;
	}
}

.wthhikgt {
	position: relative;
	display: flex;

	> ::v-deep(*) {
		flex: 1;
		margin: 0;

		&:not(:last-child) {
			margin-right: 16px;
		}
	}

	@media (max-width: 500px) {
		display: block;

		> ::v-deep(*) {
			margin: 0 0 10px 0;
			width: 100%;
			padding: var(--margin);
		}
	}
}

.item, .otherItem {
	display: flex;
	align-items: center;
	border: solid 1px var(--divider);
	border-bottom: none;
	cursor: move;

	> i {
		margin: 0 8px;
	}

	> .del {
		display: flex;
		align-items: center;
		color: var(--error);
		justify-content: center;
		margin-left: auto;
		cursor: pointer;
		width: 36px;
		height: 36px;
	}

	&:last-child {
		border-bottom: solid 1px var(--divider);
	}
}
</style>
