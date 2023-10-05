<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :max-height="300" :foldable="true">
	<template #icon><i class="ti ti-photo"></i></template>
	<template #header>{{ i18n.ts.files }}</template>
	<div :class="$style.root">
		<MkLoading v-if="fetching"/>
		<div v-if="!fetching && files.length > 0" :class="$style.stream">
			<MkA
				v-for="file in files"
				:key="file.note.id + file.file.id"
				:class="$style.img"
				:to="notePage(file.note)"
			>
				<!-- TODO: 画像以外のファイルに対応 -->
				<ImgWithBlurhash
					:hash="file.file.blurhash"
					:src="thumbnail(file.file)"
					:title="file.file.name"
					@mouseover="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
					@mouseout="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
					@touchstart="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = true : ''"
					@touchend="defaultStore.state.showingAnimatedImages === 'interaction' ? playAnimation = false : ''"
				/>
			</MkA>
		</div>
		<p v-if="!fetching && files.length == 0" :class="$style.empty">{{ i18n.ts.nothing }}</p>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import * as Misskey from 'cherrypick-js';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import { notePage } from '@/filters/note.js';
import * as os from '@/os.js';
import MkContainer from '@/components/MkContainer.vue';
import ImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

let fetching = $ref(true);
let files = $ref<{
	note: Misskey.entities.Note;
	file: Misskey.entities.DriveFile;
}[]>([]);

let playAnimation = $ref(true);
if (defaultStore.state.showingAnimatedImages === 'interaction') playAnimation = false;
let playAnimationTimer = setTimeout(() => playAnimation = false, 5000);
function thumbnail(image: Misskey.entities.DriveFile): string {
	return defaultStore.state.disableShowingAnimatedImages || (['interaction', 'inactive'].includes(<string>defaultStore.state.showingAnimatedImages) && !playAnimation)
		? getStaticImageUrl(image.url)
		: image.thumbnailUrl;
}

function resetTimer() {
	playAnimation = true;
	clearTimeout(playAnimationTimer);
	playAnimationTimer = setTimeout(() => playAnimation = false, 5000);
}

onMounted(() => {
	if (defaultStore.state.showingAnimatedImages === 'inactive') {
		window.addEventListener('mousemove', resetTimer);
		window.addEventListener('touchstart', resetTimer);
		window.addEventListener('touchend', resetTimer);
	}

	os.api('users/notes', {
		userId: props.user.id,
		withFiles: true,
		excludeNsfw: defaultStore.state.nsfw !== 'ignore',
		limit: 15,
	}).then(notes => {
		for (const note of notes) {
			for (const file of note.files) {
				files.push({
					note,
					file,
				});
			}
		}
		fetching = false;
	});
});

onUnmounted(() => {
	if (defaultStore.state.showingAnimatedImages === 'inactive') {
		window.removeEventListener('mousemove', resetTimer);
		window.removeEventListener('touchstart', resetTimer);
		window.removeEventListener('touchend', resetTimer);
	}
});
</script>

<style lang="scss" module>
.root {
	padding: 8px;
}

.stream {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	grid-gap: 6px;
}

.img {
	height: 128px;
	border-radius: 6px;
	overflow: clip;
}

.empty {
	margin: 0;
	padding: 16px;
	text-align: center;
}
</style>
