<template>
<div class="vjoppmmu">
	<template v-if="edit">
		<header>
			<MkSelect v-model="widgetAdderSelected" style="margin-bottom: var(--margin)">
				<template #label>{{ $ts.selectWidget }}</template>
				<option v-for="widget in widgetDefs" :value="widget" :key="widget">{{ $t(`_widgets.${widget}`) }}</option>
			</MkSelect>
			<MkButton class="btn" @click="addWidget" primary><i class="fas fa-plus"></i> {{ $ts.add }}</MkButton>
			<MkButton class="btn" @click="$emit('exit')">{{ $ts.close }}</MkButton>
		</header>
		<XDraggable
			v-model="_widgets"
			item-key="id"
			handle=".handle"
			animation="150"
			class="sortable"
		>
			<template #item="{element}">
				<div class="customize-container _panel">
					<header>
						<span class="handle"><i class="fas fa-bars"/></span>
						<div style="position: absolute; top: 0; left: 35px; font-size: 14px; font-weight: bold; line-height: 32.5px;">
							{{ $t('_widgets.' + element.name) }}
						</div>
						<button class="config _button" @click.prevent.stop="configWidget(element.id)"><i class="fas fa-cog"></i></button>
						<button class="remove _button" @click.prevent.stop="removeWidget(element)"><i class="fas fa-times"/></button>
					</header>
					<div @click="configWidget(element.id)">
						<component :is="`mkw-${element.name}`" :widget="element" :setting-callback="setting => settings[element.id] = setting" @updateProps="updateWidget(element.id, $event)"/>
					</div>
				</div>
			</template>
		</XDraggable>
	</template>
	<component v-else class="widget" v-for="widget in widgets" :is="`mkw-${widget.name}`" :key="widget.id" :widget="widget" @updateProps="updateWidget(widget.id, $event)"/>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { v4 as uuid } from 'uuid';
import MkSelect from '@client/components/form/select.vue';
import MkButton from '@client/components/ui/button.vue';
import { widgets as widgetDefs } from '@client/widgets';

export default defineComponent({
	components: {
		XDraggable: defineAsyncComponent(() => import('vuedraggable').then(x => x.default)),
		MkSelect,
		MkButton,
	},

	props: {
		widgets: {
			type: Array,
			required: true,
		},
		edit: {
			type: Boolean,
			required: true,
		},
	},

	emits: ['updateWidgets', 'addWidget', 'removeWidget', 'updateWidget', 'exit'],

	data() {
		return {
			widgetAdderSelected: null,
			widgetDefs,
			settings: {},
		};
	},

	computed: {
		_widgets: {
			get() {
				return this.widgets;
			},
			set(value) {
				this.$emit('updateWidgets', value);
			}
		}
	},

	methods: {
		configWidget(id) {
			this.settings[id]();
		},

		addWidget() {
			if (this.widgetAdderSelected == null) return;

			this.$emit('addWidget', {
				name: this.widgetAdderSelected,
				id: uuid(),
				data: {}
			});

			this.widgetAdderSelected = null;
		},

		removeWidget(widget) {
			this.$emit('removeWidget', widget);
		},

		updateWidget(id, data) {
			this.$emit('updateWidget', { id, data });
		},
	}
});
</script>

<style lang="scss" scoped>
.vjoppmmu {
	> header {
		margin: 16px 0;

		> * {
			width: 100%;
			padding: 4px;
		}

		> .btn {
			margin: -5px 0;
			padding: 6px;
		}
	}

	> .widget, .customize-container {
		margin: var(--margin) 0;

		&:first-of-type {
			margin-top: 0;
		}
	}

	.customize-container {
		position: relative;

		> header {
			position: relative;
			line-height: 25px;

			> .handle {
				padding: 0 10px;
				cursor: move;
				line-height: 32px;
			}

			> .config,
			> .remove {
				position: absolute;
				top: 0;
				padding: 0 8px;
				line-height: 32px;
			}

			> .config {
				right: 30px;
			}

			> .remove {
				right: 5px;
			}
		}

		> div {
			padding: 8px;

			> * {
				pointer-events: none;
			}
		}
	}
}
</style>
