<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	@close="dialog?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.reactionsList }}</template>
	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<div v-if="note" class="_gaps">
			<MkResult v-if="reactions && reactions.length === 0" type="empty"/>
			<template v-else>
				<div :class="$style.tabs">
					<button v-for="reaction in reactions" :key="reaction" :class="[$style.tab, { [$style.tabActive]: tab === reaction }]" class="_button" @click="tab = reaction">
						<MkReactionIcon :reaction="reaction"/>
						<span style="margin-left: 4px;">{{ note.reactions[reaction] }}</span>
					</button>
				</div>
				<MkA v-for="user in users" :key="user.id" :to="userPage(user)" @click="dialog?.close()">
					<MkUserCardMini :user="user" :withChart="false"/>
				</MkA>
			</template>
		</div>
		<div v-else>
			<MkLoading/>
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import { userPage } from '@/filters/user.js';
import { i18n } from '@/i18n.js';
import { misskeyApi, misskeyApiGet } from '@/utility/misskey-api.js';

const emit = defineEmits<{
	(ev: 'closed'): void,
}>();

const props = defineProps<{
	noteId: Misskey.entities.Note['id'];
}>();

const dialog = useTemplateRef('dialog');

const note = ref<Misskey.entities.Note>();
const tab = ref<string>();
const reactions = ref<string[]>();
const users = ref();

watch(tab, async () => {
	const res = await misskeyApiGet('notes/reactions', {
		noteId: props.noteId,
		type: tab.value,
		limit: 30,
	});

	users.value = res.map(x => x.user);
});

onMounted(() => {
	misskeyApi('notes/show', {
		noteId: props.noteId,
	}).then((res) => {
		reactions.value = Object.keys(res.reactions);
		tab.value = reactions.value[0];
		note.value = res;
	});
});
</script>

<style lang="scss" module>
.tabs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.tab {
	padding: 0 12px;
	border: solid 1px var(--MI_THEME-divider);
	border-radius: 999px;
  height: 30px;
}

.tabActive {
	background: var(--MI_THEME-accentedBg);
  color: var(--MI_THEME-accent);
  box-shadow: 0 0 0 1px var(--MI_THEME-accent) inset;
}
</style>
