<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModal ref="modal" :preferType="'dialog'" @click="modal.close()" @closed="onModalClosed()">
	<MkPostForm ref="form" :class="$style.form" v-bind="props" autofocus freezeAfterPosted @posted="onPosted" @cancel="modal.close()" @esc="modal.close()"/>
</MkModal>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkModal from '@/components/MkModal.vue';
import MkPostForm from '@/components/MkPostForm.vue';

const props = defineProps<{
	reply?: Misskey.entities.Note;
	renote?: Misskey.entities.Note;
	channel?: any; // TODO
	mention?: Misskey.entities.User;
	specified?: Misskey.entities.User;
	initialText?: string;
	initialVisibility?: typeof Misskey.noteVisibilities;
	initialFiles?: Misskey.entities.DriveFile[];
	initialLocalOnly?: boolean;
	initialVisibleUsers?: Misskey.entities.User[];
	initialNote?: Misskey.entities.Note;
	instant?: boolean;
	fixed?: boolean;
	autofocus?: boolean;
	updateMode?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

let modal = $shallowRef<InstanceType<typeof MkModal>>();
let form = $shallowRef<InstanceType<typeof MkPostForm>>();

function onPosted() {
	modal.close({
		useSendAnimation: true,
	});
}

function onModalClosed() {
	emit('closed');
}
</script>

<style lang="scss" module>
.form {
	max-height: calc(100% - env(safe-area-inset-bottom));
	margin: 0 auto auto auto;
	overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
