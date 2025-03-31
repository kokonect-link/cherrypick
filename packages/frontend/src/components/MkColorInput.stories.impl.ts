/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { action } from '@storybook/addon-actions';
import MkColorInput from './MkColorInput.vue';
import type { StoryObj } from '@storybook/vue3';
export const Default = {
	render(args) {
		return {
			components: {
				MkColorInput,
			},
			data() {
				return {
					color: '#cccccc',
				};
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
						'update:modelValue': action('update:modelValue'),
					};
				},
			},
			template: '<MkColorInput v-model="color" v-bind="props" v-on="events" />',
		};
	},
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		() => ({
			template: '<div style="display: flex; align-items: center; justify-content: center; height: 100vh"><div style="max-width: 800px; width: 100%; margin: 3rem"><story/></div></div>',
		}),
	],
} satisfies StoryObj<typeof MkColorInput>;
