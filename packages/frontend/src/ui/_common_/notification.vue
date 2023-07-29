<template>
<div :class="$style.root">
	<XNotification :notification="notification" :class="{ [$style.reduceBlurEffect]: !defaultStore.state.useBlurEffect }" class="notification _acrylic" :full="false"/>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'cherrypick-js';
import XNotification from '@/components/MkNotification.vue';
import { defaultStore } from '@/store';

defineProps<{
	notification: misskey.entities.Notification;
}>();
</script>

<style lang="scss" module>
.root {
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	overflow: clip;
	contain: content;
}

.reduceBlurEffect {
	background: var(--panel) !important;
}
</style>
