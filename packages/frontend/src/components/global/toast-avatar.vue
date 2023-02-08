<template>
<span v-if="!link" v-user-preview="preview ? user.id : undefined" :class="$style.root" class="_noSelect" :style="{ color }" :title="acct(user)" @click="onClick">
	<img :class="$style.inner" :src="url" decoding="async"/>
</span>
<MkA v-else v-user-preview="preview ? user.id : undefined" class="_noSelect" :class="$style.root" :style="{ color }" :to="userPage(user)" :title="acct(user)" :target="target">
	<img :class="$style.inner" :src="url" decoding="async"/>
</MkA>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import * as misskey from 'misskey-js';
import { getStaticImageUrl } from '@/scripts/media-proxy';
import { extractAvgColorFromBlurhash } from '@/scripts/extract-avg-color-from-blurhash';
import { acct, userPage } from '@/filters/user';
import { defaultStore } from '@/store';

const props = withDefaults(defineProps<{
	user: misskey.entities.User;
	target?: string | null;
	link?: boolean;
	preview?: boolean;
}>(), {
	target: null,
	link: false,
	preview: false,
});

const emit = defineEmits<{
	(ev: 'click', v: MouseEvent): void;
}>();

const url = $computed(() => defaultStore.state.disableShowingAnimatedImages
	? getStaticImageUrl(props.user.avatarUrl)
	: props.user.avatarUrl);

function onClick(ev: MouseEvent) {
	emit('click', ev);
}

let color = $ref();

watch(() => props.user.avatarBlurhash, () => {
	color = extractAvgColorFromBlurhash(props.user.avatarBlurhash);
}, {
	immediate: true,
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	border-radius: 100%;
	line-height: 16px;
}

.inner {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	top: 0;
	border-radius: 100%;
	z-index: 1;
	overflow: clip;
	object-fit: cover;
	width: 100%;
	height: 100%;
}
</style>
