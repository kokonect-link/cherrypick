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
	showEl: () => void;
	showEl2: () => void;
	queueUpdated: () => void;
	openMessage: () => void;
	showNoteContent: () => void;
	reloadTimeline: () => void;
	reloadNotification: () => void;
}>();
