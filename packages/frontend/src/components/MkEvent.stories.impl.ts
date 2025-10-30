/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MkEvent from './MkEvent.vue';
import type { StoryObj } from '@storybook/vue3';
export const Default = {
	render(args) {
		return {
			components: {
				MkEvent,
			},
			setup() {
				return {
					args,
				};
			},
			beforeMount () {
				document.body.style.background = 'var(--panel)';
			},
			computed: {
				props() {
					return {
						...this.args,
					};
				},
			},
			template: '<MkEvent v-bind="props" />',
		};
	},
	args: {
		note: {
			id: 'story-1',
			createdAt: '2017-10-25T15:00:00+0900',
			text: null,
			userId: 'user-1',
			user: {} as any,
			localOnly: false,
			visibility: 'public' as const,
			renoteCount: 0,
			repliesCount: 0,
			reactionCount: 0,
		event: {
			title: 'Come on a Tea Party!' as any,
			start: new Date('2017-10-25T15:00:00+0900').getTime() as any,
			end: new Date('2017-10-25T18:00:00+0900').getTime() as any,
			metadata: {
				'@type': 'Event',
				location: 'Kawasaki, Japan',
				description: 'Let\'s have a tea party!',
			} as any,
		},
		},
	},
	parameters: {
		layout: 'centered',
	},
} satisfies StoryObj<typeof MkEvent>;
