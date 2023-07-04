<template>
<div class="_gaps_m">
	<FormSection first>
		<template #label>{{ i18n.ts._cherrypick.function }}</template>
		<div class="_gaps_m">
			<div>{{ i18n.ts._cherrypick.functionDescription }}</div>

			<MkSwitch v-model="nicknameEnabled">
				{{ i18n.ts._cherrypick.nickname }}
				<template #caption>{{ i18n.ts._cherrypick.nicknameDescription }}</template>
			</MkSwitch>
		</div>
	</FormSection>
	<FormSection>
		<template #label>{{ i18n.ts._cherrypick.patch }}</template>
		<div class="_gaps_m">
			<div>{{ i18n.ts._cherrypick.patchDescription }}</div>

			<MkSwitch v-model="infoButtonForNoteActionsEnabled">
				{{ i18n.ts._cherrypick.infoButtonForNoteActions }}
				<template #caption>{{ i18n.ts._cherrypick.infoButtonForNoteActionsDescription }}</template>
			</MkSwitch>
			<MkSwitch v-model="rememberPostFormToggleStateEnabled">{{ i18n.ts._cherrypick.rememberPostFormToggleState }}</MkSwitch>
			<MkSwitch v-model="reactableRemoteReactionEnabled">{{ i18n.ts._cherrypick.reactableRemoteReaction }}</MkSwitch>
			<MkSwitch v-model="showFollowingMessageInsteadOfButtonEnabled">{{ i18n.ts._cherrypick.showFollowingMessageInsteadOfButton }}</MkSwitch>
			<MkSwitch v-model="mobileTimelineHeaderChange">{{ i18n.ts._cherrypick.mobileTimelineHeaderChange }}</MkSwitch>
		</div>
	</FormSection>
	<!--
	<FormSection>
		<template #label><i class="ti ti-flask"/> CherryPick Labs</template>
		<div class="_gaps_m">
			<div>まだ開発中の機能を試してみませんか。一部の機能はちゃんと動かないかもしれません。</div>

			<MkSwitch v-model="usePostFormWindow">
				投稿フォームをウィンドウとして表示
			</MkSwitch>
			<MkSwitch v-model="cherrypickNoteViewEnabled">
				新しいノートUIを試す
			</MkSwitch>
			<MkNote :note="noteMock"/>
		</div>
	</FormSection>
	-->
</div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
// import { Note, User } from 'cherrypick-js/src/entities';
import MkSwitch from '@/components/MkSwitch.vue';
// import MkNote from '@/components/MkNote.vue';
import FormSection from '@/components/form/section.vue';
import { defaultStore } from '@/store';
import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
// import { $i } from '@/account';
import { definePageMetadata } from '@/scripts/page-metadata';

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

const nicknameEnabled = computed(defaultStore.makeGetterSetter('nicknameEnabled'));
const numberQuoteEnabled = computed(defaultStore.makeGetterSetter('numberQuoteEnabled'));
const stealEnabled = computed(defaultStore.makeGetterSetter('stealEnabled'));
const infoButtonForNoteActionsEnabled = computed(defaultStore.makeGetterSetter('infoButtonForNoteActionsEnabled'));
const reactableRemoteReactionEnabled = computed(defaultStore.makeGetterSetter('reactableRemoteReactionEnabled'));
const rememberPostFormToggleStateEnabled = computed(defaultStore.makeGetterSetter('rememberPostFormToggleStateEnabled'));
// const usePostFormWindow = computed(defaultStore.makeGetterSetter('usePostFormWindow'));
// const cherrypickNoteViewEnabled = computed(defaultStore.makeGetterSetter('cherrypickNoteViewEnabledLab'));
const showFollowingMessageInsteadOfButtonEnabled = computed(defaultStore.makeGetterSetter('showFollowingMessageInsteadOfButtonEnabled'));
const mobileTimelineHeaderChange = computed(defaultStore.makeGetterSetter('mobileTimelineHeaderChange'));

/*
const noteMock: Note = {
	id: 'abc',
	createdAt: new Date().toISOString(),
	text: '> **エビ**（海老・蝦・魵）は、節足動物門・甲殻亜門・軟甲綱・十脚目（エビ目）のうち、カニ下目（短尾類）とヤドカリ下目（異尾類）以外の全ての種の総称である。すなわち、かつての**長尾類**（長尾亜目 Macrura）にあたる。現在、長尾亜目という分類群は廃止されており、学術的な分類ではなく便宜上の区分である。\n\n出典：https://ja.wikipedia.org/wiki/%E3%82%A8%E3%83%93',
	cw: null,
	user: $i as User,
	userId: $i.id,
	replyId: '',
	renoteId: '',
	files: [],
	fileIds: [],
	visibility: 'home',
	reactions: {},
	renoteCount: 20,
	repliesCount: 10,
	emojis: [],
	localOnly: true,
};
 */

watch([
	numberQuoteEnabled,
	stealEnabled,
	infoButtonForNoteActionsEnabled,
	reactableRemoteReactionEnabled,
], async () => {
	await reloadAsk();
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: 'CherryPick',
	icon: 'ti ti-bulb-filled',
});
</script>
