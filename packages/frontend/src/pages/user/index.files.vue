<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :max-height="300" :foldable="true">
	<template #icon><i class="ti ti-photo"></i></template>
	<template #header>{{ i18n.ts.files }}</template>
	<div :class="$style.root">
		<MkLoading v-if="fetching"/>
		<div v-if="!fetching && files.length > 0" :class="$style.stream">
			<template v-for="file in files" :key="file.note.id + file.file.id">
				<div v-if="file.file.isSensitive && !showingFiles.includes(file.file.id)" :class="$style.img" @click="showingFiles.push(file.file.id)">
					<!-- TODO: 画像以外のファイルに対応 -->
					<ImgWithBlurhash :class="$style.sensitiveImg" :hash="file.file.blurhash" :src="thumbnail(file.file)" :title="file.file.name" :forceBlurhash="true"/>
					<div :class="$style.sensitive">
						<div>
							<div><i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}</div>
							<div>{{ i18n.ts.clickToShow }}</div>
						</div>
					</div>
				</div>
				<MkA v-else :class="$style.img" :to="notePage(file.note)">
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
			</template>
		</div>
		<p v-if="!fetching && files.length == 0" :class="$style.empty">{{ i18n.ts.nothing }}</p>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import { notePage } from '@/filters/note.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import MkContainer from '@/components/MkContainer.vue';
import ImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';
import MkA from '@/components/global/MkA.vue';
import MkLoading from '@/components/global/MkLoading.vue';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const fetching = ref(true);
const files = ref<{
	note: Misskey.entities.Note;
	file: Misskey.entities.DriveFile;
}[]>([]);
const showingFiles = ref<string[]>([]);

const playAnimation = ref(true);
if (defaultStore.state.showingAnimatedImages === 'interaction') playAnimation.value = false;
let playAnimationTimer = setTimeout(() => playAnimation.value = false, 5000);

function thumbnail(image: Misskey.entities.DriveFile): string | null {
	return (defaultStore.state.disableShowingAnimatedImages || defaultStore.state.dataSaver.media) || (['interaction', 'inactive'].includes(<string>defaultStore.state.showingAnimatedImages) && !playAnimation.value)
		? getStaticImageUrl(image.url)
		: image.thumbnailUrl;
}

function resetTimer() {
	playAnimation.value = true;
	clearTimeout(playAnimationTimer);
	playAnimationTimer = setTimeout(() => playAnimation.value = false, 5000);
}

onMounted(() => {
	if (defaultStore.state.showingAnimatedImages === 'inactive') {
		window.addEventListener('mousemove', resetTimer);
		window.addEventListener('touchstart', resetTimer);
		window.addEventListener('touchend', resetTimer);
	}

	misskeyApi('users/notes', {
		userId: props.user.id,
		withFiles: true,
		limit: 15,
	}).then(notes => {
		for (const note of notes) {
			for (const file of note.files) {
				files.value.push({
					note,
					file,
				});
			}
		}
		fetching.value = false;
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
	position: relative;
	height: 128px;
	border-radius: 6px;
	overflow: clip;
}

.empty {
	margin: 0;
	padding: 16px;
	text-align: center;
}

.sensitiveImg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	filter: brightness(0.7);
}
.sensitive {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: grid;
  place-items: center;
	font-size: 0.8em;
	color: #fff;
	cursor: pointer;
}
</style>
