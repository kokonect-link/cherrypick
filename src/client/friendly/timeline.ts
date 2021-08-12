import { i18n } from '@client/i18n';
import { $i } from '@client/account';
import { instance } from '@client/instance';

const ts = i18n.locale;

export type TimelineMenuitem = {
	src: string,
	icon: string,
	name: string,
	show?: () => boolean,
};

export const timelineMenuItems: TimelineMenuitem[] = [
	{
		src: 'home',
		icon: 'fas fa-home',
		name: ts._timelines.home,
	}, {
		src: 'local',
		icon: 'fas fa-comments',
		name: ts._timelines.local,
		show: () => !instance.disableLocalTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'social',
		icon: 'fas fa-share-alt',
		name: ts._timelines.social,
		show: () => !instance.disableLocalTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'global',
		icon: 'fas fa-globe',
		name: ts._timelines.global,
		show: () => !instance.disableGlobalTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'cat',
		icon: 'fas fa-cat',
		name: ts._timelines.cat,
		show: () => !instance.disableCatTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'remoteFollowing',
		icon: 'fas fa-project-diagram',
		name: ts._timelines.remoteFollowing,
	}, {
		src: 'followers',
		icon: 'fas fa-comment-alt',
		name: ts._timelines.followers,
	}, {
		src: 'mentions',
		icon: 'fas fa-at',
		name: ts.mentions,
	}, {
		src: 'directs',
		icon: 'fas fa-envelope',
		name: ts.directNotes,
	},
];

export const timelineMenuSources = timelineMenuItems.map(i => i.src);

export const timelineMenuMap = Object.fromEntries(timelineMenuItems.map(it => [it.src, {
	name: it.name,
	icon: it.icon,
	show: it.show,
}]));
