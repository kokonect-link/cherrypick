/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EventEmitter } from 'eventemitter3';
import * as Misskey from 'cherrypick-js';

export const globalEvents = new EventEmitter<{
	themeChanging: () => void;
	themeChanged: () => void;
	clientNotification: (notification: Misskey.entities.Notification) => void;

	// CherryPick
	showEl: (value: boolean) => void;
	showEl2: (value: boolean) => void;
	queueUpdated: (q: number) => void;
	createChat: (ev: MouseEvent) => void;
	showNoteContent: (value: boolean) => void;
	reloadTimeline: () => void;
	reloadNotification: () => void;
}>();
