<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<Transition
		:enterActiveClass="defaultStore.state.animation ? $style.transition_toast_enterActive : ''"
		:leaveActiveClass="defaultStore.state.animation ? $style.transition_toast_leaveActive : ''"
		:enterFromClass="defaultStore.state.animation ? $style.transition_toast_enterFrom : ''"
		:leaveToClass="defaultStore.state.animation ? $style.transition_toast_leaveTo : ''"
		appear @afterLeave="emit('closed')"
	>
		<div v-if="showing" class="_acrylic" :class="[$style.root, { [$style.reduceBlurEffect]: !defaultStore.state.useBlurEffect }]" :style="{ zIndex }">
			<CPAvatar :class="$style.avatar" :user="$i"/>
			<Mfm style="display: inherit; margin: 10px;" :text="message" :plain="true"></Mfm>
		</div>
	</Transition>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { $i } from '@/account.js';
import CPAvatar from '@/components/global/ToastAvatar.vue';

defineProps<{
	message: string;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const zIndex = os.claimZIndex('high');
const showing = ref(true);

onMounted(() => {
	window.setTimeout(() => {
		showing.value = false;
	}, 4000);
});
</script>

<style lang="scss" module>
.transition_toast_enterActive,
.transition_toast_leaveActive {
	transition: opacity 0.3s, transform 0.3s !important;
}
.transition_toast_enterFrom,
.transition_toast_leaveTo {
	opacity: 0;
	transform: translateY(-100%);
}

.root {
	position: fixed;
	left: 0;
	right: 0;
	top: 50px;
	margin: 16px auto 0;
	min-width: 300px;
	max-width: calc(100% - 32px);
	width: min-content;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	overflow: clip;
	text-align: center;
	pointer-events: none;

	&.reduceBlurEffect {
		background: var(--panel);
	}

	@media (max-width: 500px) {
		width: 100%;
		top: 0;
	}
}

.avatar {
	position: relative;
	vertical-align: bottom;
	border-radius: 100%;
	width: 48px;
	height: 48px;
	margin-top: 16px;
}
</style>
