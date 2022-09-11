<template>
<div class="mk-notification-toast" :style="{ zIndex }">
	<transition :name="$store.state.animation ? 'notification-toast' : ''" appear @after-leave="$emit('closed')">
		<div v-if="showing" class="notification _acrylic" :style="isMoving ? `transition: none; transform: translateX(${x}px)` : ''" @mousedown="startSwipe" @touchstart="startSwipe">
			<XNotification class="inner" :notification="notification"/>
			<button class="_button x _shadow" @click="showing = false">
				<i class="fas fa-times"></i>
			</button>
		</div>
	</transition>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, nextTick } from 'vue';
import XNotification from '@/components/MkNotification.vue';
import * as os from '@/os';

defineProps<{
	notification: any; // TODO
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
	}, 6000);
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
	}, 6000);
}

function clearTimeout() {
	window.clearTimeout(currentTimeout);
}

function timeout() {
	clearTimeout();
	currentTimeout = window.setTimeout(() => {
		showing = false;
	}, 6000);
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
.notification-toast-enter-active, .notification-toast-leave-active {
	// transition: opacity 0.3s, transform 0.3s !important;
}
.notification-toast-enter-from, .notification-toast-leave-to {
	opacity: 0;
	transform: translateX(-250px);

	@media (max-width: 850px) {
		transform: translateY(-250px);
	}
}

.mk-notification-toast {
	position: fixed;
	left: 0;
	width: 250px;
	top: 32px;
	padding: 0 32px;
	// pointer-events: none;

	/*
	@media (max-width: 700px) {
		top: initial;
		bottom: 112px;
		padding: 0 16px;
	}

	@media (max-width: 500px) {
		bottom: calc(env(safe-area-inset-bottom, 0px) + 92px);
		padding: 0 8px;
	}
	 */

	@media (max-width: 850px) {
		top: 10px;
		bottom: initial;
		padding: 0 8px;
		width: 95%;
		right: 0;
		margin: 0 auto;
	}

	> .notification {
		height: 100%;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		// overflow: hidden;
		user-select: none;
		transition: opacity 0.5s, transform 0.5s;
		padding: 8px;

		> .inner {
			pointer-events: none;
			overflow: hidden;
		}

		> .x {
			position: absolute;
			top: -8px;
			left: -8px;
			width: 24px;
			height: 24px;
			opacity: 0;
			border-radius: 100%;
			background: var(--panel);
			border: 1px solid var(--divider);
			pointer-events: none;
			transition: opacity 0.2s ease;

			@media (max-width: 1099px) {
				display: none;
			}
		}

		&:hover > .x {
			opacity: 1;
			pointer-events: unset;
		}
	}
}
</style>
