/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { $i } from '@/account.js';
import { instance } from '@/instance.js';
import { defaultStore } from '@/store.js';

export const basicTimelineTypes = [
	'home',
	'local',
	'social',
	'global',
	'bubble',
] as const;

export type BasicTimelineType = typeof basicTimelineTypes[number];

export function isBasicTimeline(timeline: string): timeline is BasicTimelineType {
	return basicTimelineTypes.includes(timeline as BasicTimelineType);
}

export function basicTimelineIconClass(timeline: BasicTimelineType): string {
	switch (timeline) {
		case 'home':
			return 'ti ti-home';
		case 'local':
			return 'ti ti-planet';
		case 'social':
			return 'ti ti-universe';
		case 'global':
			return 'ti ti-world';
		case 'bubble':
			return 'ti ti-droplet';
	}
}

export function isAvailableBasicTimeline(timeline: BasicTimelineType | undefined | null): boolean {
	switch (timeline) {
		case 'home':
			return $i != null && defaultStore.state.enableHomeTimeline;
		case 'local':
			return ($i == null && instance.policies.ltlAvailable) || ($i != null && $i.policies.ltlAvailable && defaultStore.state.enableLocalTimeline);
		case 'social':
			return $i != null && $i.policies.ltlAvailable && defaultStore.state.enableSocialTimeline;
		case 'global':
			return ($i == null && instance.policies.gtlAvailable) || ($i != null && $i.policies.gtlAvailable && defaultStore.state.enableGlobalTimeline);
		case 'bubble':
			return ($i == null && instance.policies.btlAvailable) || ($i != null && $i.policies.btlAvailable && defaultStore.state.enableBubbleTimeline);
		default:
			return false;
	}
}

export function availableBasicTimelines(): BasicTimelineType[] {
	return basicTimelineTypes.filter(isAvailableBasicTimeline);
}

export function hasWithReplies(timeline: BasicTimelineType | undefined | null): boolean {
	return timeline === 'local' || timeline === 'social';
}
