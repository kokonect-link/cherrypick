/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HttpResponse, http } from 'msw';
import { userDetailed } from '../../.storybook/fakes.js';
import { commonHandlers } from '../../.storybook/mocks.js';
import MkAvatars from './MkAvatars.vue';
import type { StoryObj } from '@storybook/vue3';
export const Default = {
	render(args) {
		return {
			components: {
				MkAvatars,
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
			template: '<MkAvatars v-bind="props" />',
		};
	},
	args: {
		userIds: ['17', '20', '18'],
	},
	parameters: {
		layout: 'centered',
		msw: {
			handlers: [
				...commonHandlers,
				http.post('/api/users/show', () => {
					return HttpResponse.json([
						userDetailed('17'),
						userDetailed('20'),
						userDetailed('18'),
					]);
				}),
			],
		},
	},
} satisfies StoryObj<typeof MkAvatars>;
