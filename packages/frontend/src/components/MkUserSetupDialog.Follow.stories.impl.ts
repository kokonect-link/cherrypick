/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HttpResponse, http } from 'msw';
import { commonHandlers } from '../../.storybook/mocks.js';
import { userDetailed } from '../../.storybook/fakes.js';
import MkUserSetupDialog_Follow from './MkUserSetupDialog.Follow.vue';
import type { StoryObj } from '@storybook/vue3';
export const Default = {
	render(args) {
		return {
			components: {
				MkUserSetupDialog_Follow,
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
			template: '<MkUserSetupDialog_Follow v-bind="props" />',
		};
	},
	args: {

	},
	parameters: {
		layout: 'centered',
		msw: {
			handlers: [
				...commonHandlers,
				http.post('/api/users', () => {
					return HttpResponse.json([
						userDetailed('44'),
						userDetailed('49'),
					]);
				}),
				http.post('/api/pinned-users', () => {
					return HttpResponse.json([
						userDetailed('44'),
						userDetailed('49'),
					]);
				}),
			],
		},
	},
} satisfies StoryObj<typeof MkUserSetupDialog_Follow>;
