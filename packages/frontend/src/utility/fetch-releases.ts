/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { compareVersions } from 'compare-versions';
import { version } from '@@/js/config.js';
import { misskeyApi } from '@/utility/misskey-api.js';

export const openCommitPage = (repo: string, hash: string) => {
	if (hash && hash !== 'unknown') {
		window.open(`https://github.com/${repo}/commit/${hash}`, '_blank');
	}
};

export async function fetchCherrypickReleases(): Promise<boolean> {
	try {
		const meta = await misskeyApi('admin/meta');
		const response = await window.fetch('https://api.github.com/repos/kokonect-link/cherrypick/releases');
		const releasesData = await response.json();

		if (!Array.isArray(releasesData) || releasesData.length === 0) {
			console.warn('No CherryPick releases found.');
			return false;
		}

		const latestRelease = meta.enableReceivePrerelease
			? releasesData[0]
			: releasesData.filter((x: any) => !x.prerelease)[0];

		if (!latestRelease || !latestRelease.tag_name || typeof latestRelease.tag_name !== 'string') {
			console.warn('Invalid latest CherryPick release:', latestRelease);
			return false;
		}

		return (
			compareVersions(version, latestRelease.tag_name) < 0 &&
			compareVersions(<string>meta.skipCherryPickVersion || version, latestRelease.tag_name) < 0
		);
	} catch (error) {
		console.error('Failed to fetch CherryPick releases:', error);
		return false;
	}
}

export async function getCommitHashForRelease(repo: string, release: any): Promise<string> {
	try {
		const response = await window.fetch(`https://api.github.com/repos/${repo}/commits/${release.tag_name}`);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const commitData = await response.json();
		return commitData.sha || 'unknown';
	} catch (error) {
		console.error(`Failed to fetch commit hash for ${release.tag_name}:`, error);
		return 'unknown';
	}
}
