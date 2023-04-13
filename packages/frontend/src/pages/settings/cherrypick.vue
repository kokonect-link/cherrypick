<template>
<div class="_gaps_m">
	<h1>CherryPick</h1>
	<FormSection>
		<template #label>独自機能</template>
		<div class="_gaps_m">
			<div>Ebisskeyが追加する独自機能を有効・無効にします。</div>

			<MkSwitch v-model="nicknameEnabled">
				ニックネーム機能
				<template #caption>
					ユーザーの名前を任意に変更できるようになります。変更は自分にのみ反映されます。<br>
					頻繁に名前を変更するユーザーを識別するときなどに使えます。
				</template>
			</MkSwitch>
			<MkSwitch v-model="numberQuoteEnabled">
				数字引用機能
				<template #caption>
					ノートをコピーした上で末尾に数字をつけて投稿する機能。数字が本文の末尾にある場合はそれ+1、なければ「2」になります。
				</template>
			</MkSwitch>
			<MkSwitch v-model="stealEnabled">
				パクる機能
				<template #caption>
					ノートをコピーしてそのまま投稿する機能。
				</template>
			</MkSwitch>
		</div>
	</FormSection>
	<FormSection>
		<template #label>パッチ</template>
		<div class="_gaps_m">
			<div>Misskeyの機能に変更を加えます。</div>

			<MkSwitch v-model="infoButtonForNoteActionsEnabled">
				ノートに詳細表示ボタンを表示する
				<template #caption>
					オプション「ノートの操作部をホバー時のみ表示する」をオンにしたときに適用されます。
				</template>
			</MkSwitch>
			<MkSwitch v-model="rememberPostFormToggleStateEnabled">
				投稿フォームにて、プレビューのオン・オフを記憶する
			</MkSwitch>
			<MkSwitch v-model="reactableRemoteReactionEnabled">
				リモートのカスタム絵文字リアクションでも、このサーバーに同じ名前の絵文字があればリアクションできるようにする
			</MkSwitch>
		</div>
	</FormSection>
	<FormSection>
		<template #label><i class="ti ti-flask"/> Ebisskey Labs</template>
		<div class="_gaps_m">
			<div>まだ開発中の機能を試してみませんか。一部の機能はちゃんと動かないかもしれません。</div>

			<MkSwitch v-model="usePostFormWindow">
				投稿フォームをウィンドウとして表示
			</MkSwitch>
			<MkSwitch v-model="ebiNoteViewEnabled">
				新しいノートUIを試す
			</MkSwitch>
			<MkNote :note="noteMock" />
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';
import { defaultStore } from '@/store';
import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import MkNote from "@/components/MkNote.vue";
import {Note, User} from "misskey-js/built/entities";
import {$i} from "@/account";

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
const usePostFormWindow = computed(defaultStore.makeGetterSetter('usePostFormWindow'));
const ebiNoteViewEnabled = computed(defaultStore.makeGetterSetter('ebiNoteViewEnabledLab'));

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
	title: 'Ebisskey',
	icon: 'ti ti-bulb-filled',
});
</script>
