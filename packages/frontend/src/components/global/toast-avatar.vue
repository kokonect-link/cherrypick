<template>
<span v-if="disableLink" v-user-preview="disablePreview ? undefined : user.id" class="eiwwqkts _noSelect" :style="{ color }" :title="acct(user)">
	<img class="inner" :src="url" decoding="async"/>
</span>
<MkA v-else v-user-preview="disablePreview ? undefined : user.id" class="eiwwqkts _noSelect" :style="{ color }" :to="userPage(user)" :title="acct(user)" :target="target">
	<img class="inner" :src="url" decoding="async"/>
</MkA>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import * as misskey from 'misskey-js';
import { getStaticImageUrl } from '@/scripts/get-static-image-url';
import { extractAvgColorFromBlurhash } from '@/scripts/extract-avg-color-from-blurhash';
import { acct, userPage } from '@/filters/user';
import MkUserOnlineIndicator from '@/components/user-online-indicator.vue';
import { defaultStore } from '@/store';

const props = withDefaults(defineProps<{
	user: misskey.entities.User;
	target?: string | null;
	disableLink?: boolean;
	disablePreview?: boolean;
}>(), {
	target: null,
	disableLink: false,
	disablePreview: false,
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

<style lang="scss" scoped>
.eiwwqkts {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	border-radius: 100%;
	line-height: 16px;

	> .inner {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 0;
		border-radius: 100%;
		z-index: 1;
		overflow: hidden;
		object-fit: cover;
		width: 100%;
		height: 100%;
	}
}
</style>
