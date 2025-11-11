<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<div class="_gaps_m">
			<div class="_panel" style="padding: 16px;">
				<MkSwitch v-model="enableReceivePrerelease">
					<template #label>{{ i18n.ts.enableReceivePrerelease }}</template>
				</MkSwitch>
			</div>

			<template v-if="(version && version.length > 0) && (releasesCherryPick && releasesCherryPick.length > 0)">
				<FormInfo v-if="compareVersions(version, releasesCherryPick[0].tag_name) > 0">{{ i18n.ts.youAreRunningBetaClient }}</FormInfo>
				<FormInfo v-else-if="compareVersions(version, releasesCherryPick[0].tag_name) === 0" check>{{ i18n.ts.youAreRunningUpToDateClient }}</FormInfo>
				<FormInfo v-else warn>{{ i18n.ts.newVersionOfClientAvailable }}</FormInfo>
			</template>
			<FormInfo v-else>{{ i18n.ts.loading }}</FormInfo>

			<FormSection first>
				<template #label>{{ instanceName }}</template>
				<MkKeyValue @click="whatIsNewCherryPick">
					<template #key>{{ i18n.ts.currentVersion }} <i class="ti ti-external-link"></i></template>
					<template #value>{{ version }} <span :class="$style.commitHash" @click.stop="openCommitPage('kokonect-link/cherrypick', gitHash)">({{ gitHash.substring(0, 8) }})</span></template>
				</MkKeyValue>
				<MkKeyValue v-if="version < releasesCherryPick[0].tag_name && !skipVersion" style="margin-top: 10px;" @click="whatIsNewLatestCherryPick">
					<template #key>{{ i18n.ts.latestVersion }} <i class="ti ti-external-link"></i></template>
					<template #value>{{ releasesCherryPick[0].tag_name }} <span :class="$style.commitHash" @click.stop="openCommitPage('kokonect-link/cherrypick', cherryPickTagsMap.get(releasesCherryPick[0].tag_name) || '')">({{ (cherryPickTagsMap.get(releasesCherryPick[0].tag_name) || 'unknown').substring(0, 8) }})</span></template>
				</MkKeyValue>
				<MkButton v-if="releasesCherryPick.length > 0 && !skipVersion && (compareVersions(version, releasesCherryPick[0].tag_name) < 0)" style="margin-top: 10px;" @click="skipThisVersion">{{ i18n.ts.skipThisVersion }}</MkButton>
			</FormSection>

			<FormSection @click="whatIsNewLatestCherryPick">
				<template #label>CherryPick <i class="ti ti-external-link"></i></template>
				<MkKeyValue>
					<template #key>{{ i18n.ts.latestVersion }}</template>
					<template v-if="releasesCherryPick" #value>{{ releasesCherryPick[0].tag_name }} <span :class="$style.commitHash" @click.stop="openCommitPage('kokonect-link/cherrypick', cherryPickTagsMap.get(releasesCherryPick[0].tag_name) || '')">({{ (cherryPickTagsMap.get(releasesCherryPick[0].tag_name) || 'unknown').substring(0, 8) }})</span></template>
					<template v-else #value><MkEllipsis/></template>
				</MkKeyValue>
				<MkKeyValue style="margin: 8px 0 0; color: color(from var(--MI_THEME-fg) srgb r g b / 0.75); font-size: 0.85em;">
					<template v-if="releasesCherryPick" #value><MkTime :time="releasesCherryPick[0].published_at" mode="detail"/></template>
					<template v-else #value><MkEllipsis/></template>
				</MkKeyValue>
			</FormSection>

			<FormSection @click="whatIsNewLatestMisskey">
				<template #label>Misskey <i class="ti ti-external-link"></i></template>
				<MkKeyValue>
					<template #key>{{ i18n.ts.latestVersion }}</template>
					<template v-if="releasesMisskey" #value>{{ releasesMisskey[0].tag_name }} <span :class="$style.commitHash" @click.stop="openCommitPage('misskey-dev/misskey', misskeyTagsMap.get(releasesMisskey[0].tag_name) || '')">({{ (misskeyTagsMap.get(releasesMisskey[0].tag_name) || 'unknown').substring(0, 8) }})</span></template>
					<template v-else #value><MkEllipsis/></template>
				</MkKeyValue>
				<MkKeyValue style="margin: 8px 0 0; color: color(from var(--MI_THEME-fg) srgb r g b / 0.75); font-size: 0.85em;">
					<template v-if="releasesMisskey" #value><MkTime :time="releasesMisskey[0].published_at" mode="detail"/></template>
					<template v-else #value><MkEllipsis/></template>
				</MkKeyValue>
			</FormSection>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { version, instanceName, basedMisskeyVersion, gitHash } from '@@/js/config.js';
import { compareVersions } from 'compare-versions';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import { i18n } from '@/i18n.js';
import { fetchInstance } from '@/instance.js';
import { openCommitPage, getCommitHashForRelease } from '@/utility/fetch-releases.js';
import FormInfo from '@/components/MkInfo.vue';
import FormSection from '@/components/form/section.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkButton from '@/components/MkButton.vue';
import MkSwitch from '@/components/MkSwitch.vue';

const meta = await misskeyApi('admin/meta');

const enableReceivePrerelease = ref(meta.enableReceivePrerelease);
const skipVersion = ref(meta.skipVersion);
const skipCherryPickVersion = ref(meta.skipCherryPickVersion);
const cherryPickResponse = await window.fetch('https://api.github.com/repos/kokonect-link/cherrypick/releases');
const cherryPickData = await cherryPickResponse.json();
const releasesCherryPick = ref(meta.enableReceivePrerelease ? cherryPickData : cherryPickData.filter(x => !x.prerelease));
const misskeyResponse = await window.fetch('https://api.github.com/repos/misskey-dev/misskey/releases');
const misskeyData = await misskeyResponse.json();
const releasesMisskey = ref(meta.enableReceivePrerelease ? misskeyData : misskeyData.filter(x => !x.prerelease));
const cherryPickTagsMap = new Map<string, string>();
const misskeyTagsMap = new Map<string, string>();

if (releasesCherryPick.value.length > 0) {
	const hash = await getCommitHashForRelease('kokonect-link/cherrypick', releasesCherryPick.value[0]);
	cherryPickTagsMap.set(releasesCherryPick.value[0].tag_name, hash);
}

if (releasesMisskey.value.length > 0) {
	const hash = await getCommitHashForRelease('misskey-dev/misskey', releasesMisskey.value[0]);
	misskeyTagsMap.set(releasesMisskey.value[0].tag_name, hash);
}

const whatIsNewCherryPick = () => {
	window.open(`https://github.com/kokonect-link/cherrypick/blob/develop/CHANGELOG_CHERRYPICK.md#${version.replace(/\./g, '')}`, '_blank');
};

const whatIsNewLatestCherryPick = () => {
	window.open(`https://github.com/kokonect-link/cherrypick/blob/develop/CHANGELOG_CHERRYPICK.md#${releasesCherryPick.value[0].tag_name.replace(/\./g, '')}`, '_blank');
};

/**
 * const whatIsNewMisskey = () => {
 * 	window.open(`https://misskey-hub.net/docs/releases/#_${basedMisskeyVersion.replace(/\./g, '')}`, '_blank');
 * };
 */

const whatIsNewLatestMisskey = () => {
	window.open(`https://github.com/misskey-dev/misskey/blob/develop/CHANGELOG.md#${releasesMisskey.value[0].tag_name.replace(/\./g, '')}`, '_blank');
};

function save() {
	os.apiWithDialog('admin/update-meta', {
		enableReceivePrerelease: enableReceivePrerelease.value,
	}).then(() => {
		fetchInstance(true);
	});
}

function skipThisVersion() {
	skipCherryPickVersion.value = releasesCherryPick.value[0].tag_name;
	skipVersion.value = true;

	os.apiWithDialog('admin/update-meta', {
		skipVersion: skipVersion.value,
		skipCherryPickVersion: skipCherryPickVersion.value,
	}).then(() => {
		fetchInstance(true);
	});
}

watch([
	enableReceivePrerelease,
], () => {
	save();
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.cherrypickUpdate,
	icon: 'ti ti-refresh',
}));
</script>

<style lang="scss" module>
.commitHash {
	font-size: 11px;
	opacity: 0.5;
	cursor: pointer;

	&:hover {
		opacity: 1 !important;
		text-decoration: underline;
		color: var(--MI_THEME-link);
	}
}
</style>
