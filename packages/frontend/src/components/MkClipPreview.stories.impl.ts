/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { clip } from '../../.storybook/fakes.js';
import MkClipPreview from './MkClipPreview.vue';
import type { StoryObj } from '@storybook/vue3';
export const Default = {
	render(args) {
		return {
			components: {
				MkClipPreview,
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
			},
			template: '<MkClipPreview v-bind="props" />',
		};
	},
	args: {
		clip: clip(),
		noUserInfo: false,
	},
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		() => ({
			template: '<div style="display: flex; align-items: center; justify-content: center; height: 100vh"><div style="max-width: 700px; width: 100%; margin: 3rem"><story/></div></div>',
		}),
	],
} satisfies StoryObj<typeof MkClipPreview>;
