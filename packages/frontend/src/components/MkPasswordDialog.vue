<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="370"
	:height="400"
	@close="onClose"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.authentication }}</template>

	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<div style="padding: 0 0 16px 0; text-align: center;">
			<img src="/client-assets/locked_with_key_3d.png" alt="🔐" style="display: block; margin: 0 auto; width: 48px;">
			<div style="margin-top: 16px;">{{ i18n.ts.authenticationRequiredToContinue }}</div>
		</div>

		<form @submit.prevent="done">
			<div class="_gaps">
				<MkInput ref="passwordInput" v-model="password" :placeholder="i18n.ts.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password webauthn" required :withPasswordToggle="true" @enter.prevent="done" @keydown="checkCapsLock" @focus="checkCapsLock" @click="checkCapsLock">
					<template #prefix><i class="ti ti-password"></i></template>
					<template #suffix>
						<div v-if="isCapsLock" :class="$style.isCapslock"><i class="ti ti-arrow-big-up-line"></i></div>
						<button v-if="password" type="button" :class="$style.passwordToggleBtn" @click="togglePassword"><i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i></button>
					</template>
				</MkInput>

				<MkInput v-if="$i.twoFactorEnabled" v-model="token" type="text" :pattern="isBackupCode ? '^[A-Z0-9]{32}$' :'^[0-9]{6}$'" autocomplete="one-time-code" required :spellcheck="false" :inputmode="isBackupCode ? undefined : 'numeric'" @enter.prevent="done">
					<template #label>{{ i18n.ts.token }} ({{ i18n.ts['2fa'] }})</template>
					<template #prefix><i v-if="isBackupCode" class="ti ti-key"></i><i v-else class="ti ti-123"></i></template>
					<template #caption><button class="_textButton" type="button" @click="isBackupCode = !isBackupCode">{{ isBackupCode ? i18n.ts.useTotp : i18n.ts.useBackupCode }}</button></template>
				</MkInput>

				<MkButton :disabled="(password ?? '') == '' || ($i.twoFactorEnabled && (token ?? '') == '')" type="submit" primary rounded style="margin: 0 auto;"><i class="ti ti-lock-open"></i> {{ i18n.ts.continue }}</MkButton>
			</div>
		</form>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef, ref, onUnmounted } from 'vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import { i18n } from '@/i18n.js';
import { ensureSignin } from '@/i.js';

const $i = ensureSignin();

const emit = defineEmits<{
	(ev: 'done', v: { password: string; token: string | null; }): void;
	(ev: 'closed'): void;
	(ev: 'cancelled'): void;
}>();

const dialog = useTemplateRef('dialog');
const passwordInput = useTemplateRef('passwordInput');
const password = ref('');
const isBackupCode = ref(false);
const token = ref<string | null>(null);

const isCapsLock = ref(false);
const showPassword = ref(false);

function onClose() {
	emit('cancelled');
	if (dialog.value) dialog.value.close();
}

function done() {
	emit('done', { password: password.value, token: token.value });
	if (dialog.value) dialog.value.close();
}

function checkCapsLock(ev: KeyboardEvent) {
	isCapsLock.value = ev.getModifierState('CapsLock');
}

function togglePassword() {
	showPassword.value = !showPassword.value;
}

onMounted(() => {
	if (passwordInput.value) passwordInput.value.focus();

	window.addEventListener('keydown', checkCapsLock);
	window.addEventListener('keyup', checkCapsLock);
});

onUnmounted(() => {
	window.removeEventListener('keydown', checkCapsLock);
	window.removeEventListener('keyup', checkCapsLock);
});
</script>

<style lang="scss" module>
.isCapslock {
	display: inline-block;
	padding: 2px;
	border-radius: 6px;
	margin-right: 4px;
	background: light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
}

.passwordToggleBtn {
	position: relative;
	z-index: 2;
	margin: 0 auto;
	border: none;
	background: none;
	color: var(--MI_THEME-fg);
	font-size: 0.8em;
	cursor: pointer;
	pointer-events: auto;
	-webkit-tap-highlight-color: transparent;
}
</style>
