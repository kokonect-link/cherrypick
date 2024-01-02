<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="900">
		<div class="_gaps">
			<MkFolder v-for="avatarDecoration in avatarDecorations" :key="avatarDecoration.id ?? avatarDecoration._id" :defaultOpen="avatarDecoration.id == null">
				<template #label>{{ avatarDecoration.name }}</template>
				<template #caption>{{ avatarDecoration.description }}</template>

				<div class="_gaps_m">
					<MkInput v-model="avatarDecoration.name">
						<template #label>{{ i18n.ts.name }}</template>
					</MkInput>
					<MkTextarea v-model="avatarDecoration.description">
						<template #label>{{ i18n.ts.description }}</template>
					</MkTextarea>
					<div :class="$style.imageSelectdiv">
						<p>{{ i18n.ts.image }}</p>
						<MkButton @click="ev => changeImage(ev, avatarDecoration)">{{ i18n.ts.selectFile }}</MkButton>
					</div>
					<MkInput v-model="avatarDecoration.url">
						<template #label>{{ i18n.ts.imageUrl }}</template>
					</MkInput>
					<div v-if="avatarDecoration.url !== ''" :class="$style.imgContainer">
						<img src="https://misskey-hub.net/avatar-decoration-template.png" :class="$style.img" style="opacity: .5;"/>
						<img :src="avatarDecoration.url" :class="$style.img"/>
					</div>
					<div class="buttons _buttons">
						<MkButton class="button" inline primary @click="save(avatarDecoration)"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
						<MkButton v-if="avatarDecoration.id != null" class="button" inline danger @click="del(avatarDecoration)"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
					</div>
				</div>
			</MkFolder>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import MkFolder from '@/components/MkFolder.vue';
import { selectFile } from '@/scripts/select-file.js';

const avatarDecorations = ref<Misskey.entities.AdminAvatarDecorationsListResponse>([]);

async function changeImage(ev, avatarDecoration) {
	const file = await selectFile(ev.currentTarget ?? ev.target, null);
	if (file != null) {
		avatarDecoration.url = file.url;
	}
}

function add() {
	avatarDecorations.value.unshift({
		_id: Math.random().toString(36),
		id: null,
		name: '',
		description: '',
		url: '',
	});
}

function del(avatarDecoration) {
	os.confirm({
		type: 'warning',
		text: i18n.t('deleteAreYouSure', { x: avatarDecoration.name }),
	}).then(({ canceled }) => {
		if (canceled) return;
		avatarDecorations.value = avatarDecorations.value.filter(x => x !== avatarDecoration);
		os.api('admin/avatar-decorations/delete', avatarDecoration);
	});
}

async function save(avatarDecoration) {
	if (avatarDecoration.id == null) {
		await os.apiWithDialog('admin/avatar-decorations/create', avatarDecoration);
		load();
	} else {
		os.apiWithDialog('admin/avatar-decorations/update', avatarDecoration);
	}
}

function load() {
	os.api('admin/avatar-decorations/list').then(_avatarDecorations => {
		avatarDecorations.value = _avatarDecorations;
	});
}

load();

const headerActions = computed(() => [{
	asFullButton: true,
	icon: 'ti ti-plus',
	text: i18n.ts.add,
	handler: add,
}]);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.avatarDecorations,
	icon: 'ti ti-sparkles',
});
</script>

<style lang="scss" module>
.imageSelectdiv {
	display: flex;
	align-items: center;
	gap: 1em;

	> p {
		margin: 0;
	}
}

.imgContainer {
	position: relative;
	margin: 8px;
	width: 128px;
	height: 128px;
}

.img {
	display: block;

	position: absolute;
	left: 0;
	top: 0;

	width: 100%;
	height: 100%;

	object-fit: contain;
	pointer-events: none;
}

</style>
