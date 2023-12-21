<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :style="`height: ${widgetProps.height}px;`" :showHeader="widgetProps.showHeader" :scrollable="true" data-cy-mkw-notifications class="mkw-notifications">
	<template #icon><i class="ti ti-bell"></i></template>
	<template #header>{{ i18n.ts.notifications }}</template>
	<template #func="{ buttonStyleClass }">
		<button v-tooltip="i18n.ts.filter" class="_button" :class="buttonStyleClass" @click="setFilter"><i class="ti ti-filter"></i></button>
		<button v-tooltip="i18n.ts.markAllAsRead" class="_button" :class="buttonStyleClass" @click="os.apiWithDialog('notifications/mark-all-as-read')"><i class="ti ti-check"></i></button>
		<button v-tooltip="i18n.ts.settings" class="_button" :class="buttonStyleClass" @click="configureNotification()"><i class="ti ti-settings"></i></button>
	</template>

	<div>
		<XNotifications :includeTypes="includeTypes"/>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import { useWidgetPropsManager, WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import { GetFormResultType } from '@/scripts/form.js';
import MkContainer from '@/components/MkContainer.vue';
import XNotifications from '@/components/MkNotifications.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { notificationTypes } from '@/const.js';

const includeTypes = ref<string[] | null>(null);

const name = 'notifications';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean' as const,
		default: true,
	},
	height: {
		type: 'number' as const,
		default: 300,
	},
	excludeTypes: {
		type: 'array' as const,
		hidden: true,
		default: [],
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure, save } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

const configureNotification = () => {
	os.popup(defineAsyncComponent(() => import('@/components/MkNotificationSelectWindow.vue')), {
		excludeTypes: widgetProps.excludeTypes,
	}, {
		done: async (res) => {
			const { excludeTypes } = res;
			widgetProps.excludeTypes = excludeTypes;
			save();
		},
	}, 'closed');
};

const setFilter = (ev) => {
	const typeItems = notificationTypes.map(t => ({
		text: i18n.t(`_notification._types.${t}`),
		active: includeTypes.value && includeTypes.value.includes(t),
		action: () => {
			includeTypes.value = [t];
		},
	}));
	const items = includeTypes.value != null ? [{
		icon: 'ti ti-x',
		text: i18n.ts.clear,
		action: () => {
			includeTypes.value = null;
		},
	}, null, ...typeItems] : typeItems;
	os.popupMenu(items, ev.currentTarget ?? ev.target);
};

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
