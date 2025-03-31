/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HttpResponse, http } from 'msw';
import { userDetailed } from '../../.storybook/fakes.js';
import { commonHandlers } from '../../.storybook/mocks.js';
import MkAchievements from './MkAchievements.vue';
import type { StoryObj } from '@storybook/vue3';
import { ACHIEVEMENT_TYPES } from '@/utility/achievements.js';
export const Empty = {
	render(args) {
		return {
			components: {
				MkAchievements,
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
			template: '<MkAchievements v-bind="props" />',
		};
	},
	args: {
		user: userDetailed(),
	},
	parameters: {
		layout: 'fullscreen',
		msw: {
			handlers: [
				...commonHandlers,
				http.post('/api/users/achievements', () => {
					return HttpResponse.json([]);
				}),
			],
		},
	},
} satisfies StoryObj<typeof MkAchievements>;
export const All = {
	...Empty,
	parameters: {
		msw: {
			handlers: [
				...commonHandlers,
				http.post('/api/users/achievements', () => {
					return HttpResponse.json(ACHIEVEMENT_TYPES.map((name) => ({ name, unlockedAt: 0 })));
				}),
			],
		},
	},
} satisfies StoryObj<typeof MkAchievements>;
