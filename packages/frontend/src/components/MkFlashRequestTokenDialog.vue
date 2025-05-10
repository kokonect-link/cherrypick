<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	@close="dialog!.close()"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.additionalPermissionsForFlash }}</template>
	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<p>{{ i18n.ts.thisFlashRequiresTheFollowingPermissions }}</p>
		<ul>
			<li v-for="permission in props.permissions" :key="permission">
				{{ i18n.ts._permissions[permission] }}
			</li>
		</ul>
		<p>{{ i18n.ts.doYouWantToAllowThisPlayToAccessYourAccount }}</p>
		<div>
			<MkButton inline :class="$style.cancel" @click="cancel">{{ i18n.ts.cancel }}</MkButton>
			<MkButton primary inline @click="accept">{{ i18n.ts.accept }}</MkButton>
		</div>
	</div>
</MkModalWindow>
</template>
<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	permissions: string[];
}>();

const emit = defineEmits<{
	(ev: 'closed'): void,
	(ev: 'accept'): void,
	(ev: 'cancel'): void,
}>();

const dialog = useTemplateRef('dialog');

const cancel = () => {
	emit('cancel');
	dialog.value?.close();
};

const accept = () => {
	emit('accept');
	dialog.value?.close();
};
</script>
<style lang="scss" module>
.cancel {
	margin-right: 5px;
}
</style>
