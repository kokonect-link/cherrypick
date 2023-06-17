<template>
<div :class="[$style.root, { [$style.collapsed]: collapsed }]">
	<div style="display: grid;">
		<span v-if="note.isHidden" style="opacity: 0.5">({{ i18n.ts.private }})</span>
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ i18n.ts.deleted }})</span>
		<MkA v-if="note.replyId" :class="$style.reply" :to="`/notes/${note.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
		<Mfm v-if="note.text" :text="note.text" :author="note.user" :i="$i" :emojiUrls="note.emojis"/>
		<MkA v-if="note.renoteId" :class="$style.rp" :to="`/notes/${note.renoteId}`">RN: ...</MkA>
		<div v-if="defaultStore.state.showTranslateButtonInNote" style="padding-top: 5px; color: var(--accent);">
			<button v-if="!(translating || translation)" ref="translateButton" class="_button" @mousedown="translate()">{{ i18n.ts.translateNote }}</button>
			<button v-else class="_button" @mousedown="translation = null">{{ i18n.ts.closeTranslate }}</button>
		</div>
		<div v-if="translating || translation" :class="$style.translation">
			<MkLoading v-if="translating" mini/>
			<div v-else>
				<b>{{ i18n.t('translatedFrom', { x: translation.sourceLang }) }}:</b><hr style="margin: 10px 0;">
				<Mfm :text="translation.text" :author="note.user" :i="$i" :emojiUrls="note.emojis"/>
				<div v-if="translation.translator == 'ctav3'" style="margin-top: 10px; padding: 0 0 15px;">
					<img v-if="!defaultStore.state.darkMode" src="/client-assets/color-short.svg" alt="" style="float: right;">
					<img v-else src="/client-assets/white-short.svg" alt="" style="float: right;"/>
				</div>
			</div>
		</div>
		<MkDetailsButton v-if="note.files.length > 0 || note.poll" v-model="showContent" :note="note"/>
		<div v-show="showContent">
			<div v-if="note.files.length > 0">
				<MkMediaList v-if="note.disableRightClick" :mediaList="note.files" @contextmenu.prevent/>
				<MkMediaList v-else :mediaList="note.files"/>
			</div>
			<div v-if="note.poll">
				<MkPoll :note="note"/>
			</div>
		</div>
	</div>
	<button v-if="collapsed" :class="$style.fade" class="_button" @click="collapsed = false">
		<span :class="$style.fadeLabel">{{ i18n.ts.showMore }}</span>
	</button>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as misskey from 'cherrypick-js';
import * as os from '@/os';
import MkMediaList from '@/components/MkMediaList.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkDetailsButton from '@/components/MkDetailsButton.vue';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import { defaultStore } from '@/store';
import { miLocalStorage } from '@/local-storage';

const showContent = ref(false);
const translation = ref<any>(null);
const translating = ref(false);

const props = defineProps<{
	note: misskey.entities.Note;
}>();

const collapsed = $ref(
	props.note.cw == null && props.note.text != null && (
		(props.note.text.split('\n').length > 9) ||
		(props.note.text.length > 500)
	));

async function translate(): Promise<void> {
	if (translation.value != null) return;
	translating.value = true;
	const res = await os.api('notes/translate', {
		noteId: props.note.id,
		targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
	});
	translating.value = false;
	translation.value = res;
}
</script>

<style lang="scss" module>
.root {
	overflow-wrap: break-word;

	&.collapsed {
		position: relative;
		max-height: 9em;
		overflow: clip;

		> .fade {
			display: block;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 64px;
			background: linear-gradient(0deg, var(--panel), var(--X15));

			> .fadeLabel {
				display: inline-block;
				background: var(--panel);
				padding: 6px 10px;
				font-size: 0.8em;
				border-radius: 999px;
				box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
			}

			&:hover {
				> .fadeLabel {
					background: var(--panelHighlight);
				}
			}
		}
	}
}

.reply {
	margin-right: 6px;
	color: var(--accent);
}

.rp {
	margin-left: 4px;
	font-style: oblique;
	color: var(--renote);
}

.translation {
	border: solid 0.5px var(--divider);
	border-radius: var(--radius);
	padding: 12px;
	margin-top: 8px;
}
</style>
