<template>
<FormBase>
	<FormRadios v-model="menuDisplay">
		<template #desc>{{ $ts.display }}</template>
		<option value="sideFull">{{ $ts._menuDisplay.sideFull }}</option>
		<option value="sideIcon">{{ $ts._menuDisplay.sideIcon }}</option>
		<option value="top">{{ $ts._menuDisplay.top }}</option>
		<!-- <MkRadio v-model="menuDisplay" value="hide" disabled>{{ $ts._menuDisplay.hide }}</MkRadio>--> <!-- TODO: サイドバーを完全に隠せるようにすると、別途ハンバーガーボタンのようなものをUIに表示する必要があり面倒 -->
	</FormRadios>

	<div class="mcc329a0 _formItem _formPanel">
		<XDraggable class="draggable" v-model="items" :item-key="item => item" animation="150" delay="100" delay-on-touch-only="true">
			<template #item="{element: item}">
				<div class="item">
					<i v-if="!item.startsWith('-:')" :class="menuDef[item].icon" />
					<template v-if="item.startsWith('-:')">
						<i class="fas fa-minus" />
						<span v-text="$ts.divider"/>
					</template>
					<span v-else v-text="$t(menuDef[item] ? menuDef[item].title : item)"/>
					<div class="del" @click="del(item)"><i class="fas fa-times" /></div>
				</div>
			</template>
		</XDraggable>
	</div>

	<FormTuple>
		<FormButton @click="addItem" primary><i class="fas fa-plus"/> {{ $ts.add }}</FormButton>
		<FormButton @click="reset()" danger><i class="fas fa-redo"/> {{ $ts.default }}</FormButton>
	</FormTuple>
</FormBase>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { v4 as uuid } from 'uuid';
import FormSwitch from '@client/components/form/switch.vue';
import FormRadios from '@client/components/form/radios.vue';
import FormBase from '@client/components/form/base.vue';
import FormTuple from '@client/components/form/tuple.vue';
import FormButton from '@client/components/form/button.vue';
import * as os from '@client/os';
import { menuDef } from '@client/menu';
import { defaultStore } from '@client/store';
import * as symbols from '@client/symbols';
import { unisonReload } from '@client/scripts/unison-reload';

export default defineComponent({
	components: {
		FormBase,
		FormSwitch,
		FormButton,
		FormRadios,
		FormTuple,
		XDraggable: defineAsyncComponent(() => import('vuedraggable').then(x => x.default)),
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.menu,
				icon: 'fas fa-list-ul'
			},
			menuDef: menuDef,
			items: [],
		}
	},

	computed: {
		menuDisplay: defaultStore.makeGetterSetter('menuDisplay')
	},

	created() {
		this.items = this.$store.state.menu.map(it => it === '-' ? '-:' + uuid() : it);
	},

	mounted() {
		this.$emit('info', this[symbols.PAGE_INFO]);
	},

	watch: {
		menuDisplay() {
			this.reloadAsk();
		},

		items: {
			handler() {
				console.log('save');
				this.save();
			},
			deep: true,
		}
	},

	methods: {
		async addItem() {
			const menu = Object.keys(this.menuDef).filter(k => !this.$store.state.menu.includes(k));
			const { canceled, result: item } = await os.dialog({
				type: null,
				title: this.$ts.addItem,
				select: {
					items: [...menu.map(k => ({
						value: k, text: this.$ts[this.menuDef[k].title]
					})), ...[{
						value: '-:' + uuid(), text: this.$ts.divider
					}]]
				},
				showCancelButton: true
			});
			if (canceled) return;
			this.items = [...this.items, item];
		},

		del(item) {
			this.items = this.items.filter(it => it !== item);
		},

		save() {
			this.$store.set('menu', this.items.map(it => it.startsWith('-:') ? '-' : it));
		},

		reset() {
			this.$store.reset('menu');
			this.items = this.$store.state.menu.map(it => it === '-' ? '-:' + uuid() : it);
		},

		async reloadAsk() {
			const { canceled } = await os.dialog({
				type: 'info',
				text: this.$ts.reloadToApplySetting,
				showCancelButton: true
			});
			if (canceled) return;
			unisonReload();
		}
	},
});
</script>

<style lang="scss" scoped>

.mcc329a0 {
	padding: 16px;
	> .draggable {
		display: flex;
		flex-direction: column;
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
