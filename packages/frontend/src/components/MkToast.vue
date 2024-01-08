<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
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
			<div style="padding: 16px 24px;">
				<i v-if="icon" :class="icon === 'posted' ? 'ti-check' : icon === 'reply' ? 'ti-arrow-back-up' : icon === 'renote' ? 'ti-repeat' : icon === 'quote' ? 'ti-quote' : icon === 'edited' ? 'ti ti-pencil' : icon === 'copied' ? 'ti-copy' : 'ti-check'" class="ti"></i>
				{{ message }}
			</div>
		</div>
	</Transition>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';

defineProps<{
	message: string;
	icon?: string;
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

	@media (max-width: 500px) {
		&.reduceBlurEffect {
			background: var(--panel);
		}
	}
}
</style>
