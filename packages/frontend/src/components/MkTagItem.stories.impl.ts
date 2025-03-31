/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { action } from '@storybook/addon-actions';
import MkTagItem from './MkTagItem.vue';
import type { StoryObj } from '@storybook/vue3';

export const Default = {
	render(args) {
		return {
			components: {
				MkTagItem: MkTagItem,
			},
			setup() {
				return {
					args,
				};
			},
			computed: {
				props() {
					return {
						...this.args,
					};
				},
				events() {
					return {
						click: action('click'),
						exButtonClick: action('exButtonClick'),
					};
				},
			},
			template: '<MkTagItem v-bind="props" v-on="events"></MkTagItem>',
		};
	},
	args: {
		content: 'name',
	},
	parameters: {
		layout: 'centered',
	},
} satisfies StoryObj<typeof MkTagItem>;

export const Icon = {
	...Default,
	args: {
		...Default.args,
		iconClass: 'ti ti-arrow-up',
	},
} satisfies StoryObj<typeof MkTagItem>;

export const ExButton = {
	...Default,
	args: {
		...Default.args,
		exButtonIconClass: 'ti ti-x',
	},
} satisfies StoryObj<typeof MkTagItem>;

export const IconExButton = {
	...Default,
	args: {
		...Default.args,
		iconClass: 'ti ti-arrow-up',
		exButtonIconClass: 'ti ti-x',
	},
} satisfies StoryObj<typeof MkTagItem>;
