/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'cherrypick-js';
import { Cache } from '@/scripts/cache';

export const clipsCache = new Cache<Misskey.entities.Clip[]>(Infinity);
export const rolesCache = new Cache(Infinity);
export const userListsCache = new Cache<Misskey.entities.UserList[]>(Infinity);
export const antennasCache = new Cache<Misskey.entities.Antenna[]>(Infinity);
