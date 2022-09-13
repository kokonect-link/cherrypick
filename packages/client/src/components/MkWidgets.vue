<template>
<div class="vjoppmmu">
	<template v-if="edit">
		<header>
			<MkSelect v-model="widgetAdderSelected" style="margin-bottom: var(--margin)" class="mk-widget-select">
				<template #label>{{ i18n.ts.selectWidget }}</template>
				<option v-for="widget in widgetDefs" :key="widget" :value="widget">{{ i18n.t(`_widgets.${widget}`) }}</option>
			</MkSelect>
			<MkButton primary class="mk-widget-add btn" @click="addWidget"><i class="fas fa-plus"></i> {{ i18n.ts.add }}</MkButton>
			<MkButton class="btn" @click="$emit('exit')">{{ i18n.ts.close }}</MkButton>
		</header>
		<XDraggable
			v-model="widgets_"
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
						<button class="remove _button" @click.prevent.stop="removeWidget(element)"><i class="fas fa-times"></i></button>
					</header>
					<div @click="configWidget(element.id)">
						<component :is="`mkw-${element.name}`" :ref="el => widgetRefs[element.id] = el" class="widget" :widget="element" @updateProps="updateWidget(element.id, $event)"/>
					</div>
				</div>
			</template>
		</XDraggable>
	</template>
	<component :is="`mkw-${widget.name}`" v-for="widget in widgets" v-else :key="widget.id" :ref="el => widgetRefs[widget.id] = el" class="widget" :widget="widget" @updateProps="updateWidget(widget.id, $event)" @contextmenu.stop="onContextmenu(widget, $event)"/>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, reactive, ref, computed } from 'vue';
import { v4 as uuid } from 'uuid';
import MkSelect from '@/components/form/select.vue';
import MkButton from '@/components/MkButton.vue';
import { widgets as widgetDefs } from '@/widgets';
import * as os from '@/os';
import { i18n } from '@/i18n';

const XDraggable = defineAsyncComponent(() => import('vuedraggable'));

type Widget = {
	name: string;
	id: string;
	data: Record<string, any>;
};

const props = defineProps<{
	widgets: Widget[];
	edit: boolean;
}>();

const emit = defineEmits<{
	(ev: 'updateWidgets', widgets: Widget[]): void;
	(ev: 'addWidget', widget: Widget): void;
	(ev: 'removeWidget', widget: Widget): void;
	(ev: 'updateWidget', widget: Partial<Widget>): void;
	(ev: 'exit'): void;
}>();

const widgetRefs = {};
const configWidget = (id: string) => {
	widgetRefs[id].configure();
};
const widgetAdderSelected = ref(null);
const addWidget = () => {
	if (widgetAdderSelected.value == null) return;

	emit('addWidget', {
		name: widgetAdderSelected.value,
		id: uuid(),
		data: {},
	});

	widgetAdderSelected.value = null;
};
const removeWidget = (widget) => {
	emit('removeWidget', widget);
};
const updateWidget = (id, data) => {
	emit('updateWidget', { id, data });
};
const widgets_ = computed({
	get: () => props.widgets,
	set: (value) => {
		emit('updateWidgets', value);
	},
});

function onContextmenu(widget: Widget, ev: MouseEvent) {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === 'A') return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (['INPUT', 'TEXTAREA', 'IMG', 'VIDEO', 'CANVAS'].includes(ev.target.tagName) || ev.target.attributes['contenteditable']) return;
	if (window.getSelection()?.toString() !== '') return;

	os.contextMenu([{
		type: 'label',
		text: i18n.t(`_widgets.${widget.name}`),
	}, {
		icon: 'fas fa-cog',
		text: i18n.ts.settings,
		action: () => {
			configWidget(widget.id);
		},
	}], ev);
}
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
			margin: 5px 0;
			padding: 6px;
		}
	}

	> .widget, .customize-container {
		contain: content;
		margin: var(--margin) 0;

		&:first-of-type {
			margin-top: 0;
		}
	}

	.customize-container {
		position: relative;
		// cursor: move;

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

		> .handle {
			> .widget {
				pointer-events: none;
			}
		}
	}
}
</style>
