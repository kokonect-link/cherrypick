<template>
<div class="_formRoot">
	<FormRadios v-model="menuDisplay" class="_formBlock">
		<template #label>{{ i18n.ts.display }}</template>
		<option value="sideFull">{{ i18n.ts._menuDisplay.sideFull }}</option>
		<option value="sideIcon">{{ i18n.ts._menuDisplay.sideIcon }}</option>
		<option value="top">{{ i18n.ts._menuDisplay.top }}</option>
		<!-- <MkRadio v-model="menuDisplay" value="hide" disabled>{{ i18n.ts._menuDisplay.hide }}</MkRadio>--> <!-- TODO: サイドバーを完全に隠せるようにすると、別途ハンバーガーボタンのようなものをUIに表示する必要があり面倒 -->
	</FormRadios>

	<div class="asdiokco _formItem _formPanel">
		<XDraggable class="draggable" v-model="items" :item-key="item => item" animation="150" delay="100" delay-on-touch-only="true">
			<template #item="{element: item}">
				<div class="item">
					<i v-if="!item.startsWith('-:')" :class="navbarItemDef[item].icon" />
					<template v-if="item.startsWith('-:')">
						<i class="fas fa-minus" />
						<span v-text="$ts.divider"/>
					</template>
					<span v-else v-text="$t(navbarItemDef[item] ? navbarItemDef[item].title : item)"/>
					<div class="del" @click="del(item)"><i class="fas fa-times" /></div>
				</div>
			</template>
		</XDraggable>
	</div>

	<div class="wthhikgt">
		<FormButton class="_formBlock" @click="addItem"><i class="fas fa-plus"></i> {{ i18n.ts.addItem }}</FormButton>
		<FormButton v-if="isChanged" class="_formBlock" @click="save"><i class="fas fa-save"></i> {{ i18n.ts.save }}</FormButton>
		<FormButton danger class="_formBlock" @click="reset()"><i class="fas fa-redo"></i> {{ i18n.ts.default }}</FormButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormRadios from '@/components/form/radios.vue';
import FormButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { navbarItemDef } from '@/navbar';
import { defaultStore } from '@/store';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { v4 as uuid } from 'uuid';

const XDraggable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

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
			value: k, text: i18n.ts[navbarItemDef[k].title],
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
	icon: 'fas fa-list-ul',
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
