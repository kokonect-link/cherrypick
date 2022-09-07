<template>
<div class="mk-toast">
	<transition :name="$store.state.animation ? 'toast' : ''" appear @after-leave="emit('closed')">
		<div v-if="showing" class="body _acrylic" :style="[ isMoving ? `transition: none; transform: translateX(${x}px)` : '', { zIndex }]" @mousedown="startSwipe" @touchstart="startSwipe">
			<div class="inner">
				<CPAvatar class="avatar" :user="$i" :disable-preview="true" :show-indicator="false"/>
				<div class="message">
					{{ message }}
				</div>
			</div>
		</div>
	</transition>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, nextTick, ref } from 'vue';
import * as os from '@/os';
import { $i } from '@/account';
import CPAvatar from '@/components/global/toast-avatar.vue';

defineProps<{
	message: string;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const zIndex = os.claimZIndex('high');
let showing = $ref(true);

let isMoving = $ref(false);
let x = $ref(0);
let currentTimeout = $ref(0);
let previousTouchX = $ref(0);

onMounted(() => {
	/*
	window.setTimeout(() => {
		showing = false;
	}, 4000);
	 */

	autoTimeout();

	window.addEventListener('mouseup', endSwipe, { passive: false });
	window.addEventListener('touchend', endSwipe, { passive: false });
	window.addEventListener('mousemove', onMouseMove, { passive: false });
	window.addEventListener('touchmove', onTouchMove, { passive: false });
});

onBeforeUnmount(() => {
	window.removeEventListener('mouseup', endSwipe);
	window.removeEventListener('touchend', endSwipe);
	window.removeEventListener('mousemove', onMouseMove);
	window.removeEventListener('touchmove', onTouchMove);
});

function autoTimeout() {
	currentTimeout = window.setTimeout(() => {
		showing = false;
	}, 4000);
}

function clearTimeout() {
	window.clearTimeout(currentTimeout);
}

function timeout() {
	clearTimeout();
	currentTimeout = window.setTimeout(() => {
		showing = false;
	}, 4000);
}
function onMouseMove(ev: MouseEvent) {
	processSwipe(ev.movementX);
}

function onTouchMove(ev: TouchEvent) {
	if (previousTouchX === 0) {
		previousTouchX = ev.touches[0].clientX;
	}
	processSwipe(ev.touches[0].clientX - previousTouchX);
	previousTouchX = ev.touches[0].clientX;
}

function startSwipe() {
	isMoving = true;
	clearTimeout();
}

function processSwipe(movementX: number) {
	if (!isMoving) return;
	x = Math.max(0, x + movementX);
}

function endSwipe() {
	isMoving = false;
	if (x > 150) {
		x = 0;
		nextTick(() => showing = false);
	} else {
		x = 0;
		timeout();
	}
	previousTouchX = 0;
}
</script>

<style lang="scss" scoped>
.toast-enter-active, .toast-leave-active {
	// transition: opacity 0.3s, transform 0.3s !important;
}
.toast-enter-from, .toast-leave-to {
	opacity: 0;
	transform: translateY(-100%);
}

.mk-toast {
	> .body {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		margin: 0 auto;
		margin-top: 16px;
		min-width: 300px;
		max-width: calc(100% - 32px);
		width: min-content;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		overflow: clip;
		text-align: center;
		transition: opacity 0.5s, transform 0.5s;

		@media (max-width: 500px) {
			width: 100%;
		}

		> .inner {
			pointer-events: none;

			> .avatar {
				position: relative;
				vertical-align: bottom;
				border-radius: 100%;
				width: 64px;
				height: 64px;
				margin-top: 16px;
			}

			> .message {
				padding: 16px 24px;
			}
		}
	}
}
</style>
