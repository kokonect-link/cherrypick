/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EventEmitter } from 'eventemitter3';
import * as Misskey from 'cherrypick-js';

export const globalEvents = new EventEmitter<{
	themeChanged: () => void;
	clientNotification: (notification: Misskey.entities.Notification) => void;
	requestClearPageCache: () => void;
}>();
