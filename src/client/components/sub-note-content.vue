<template>
<div class="wrmlmaau">
	<div class="body">
		<span v-if="note.isHidden" style="opacity: 0.5">({{ $ts.private }})</span>
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ $ts.deleted }})</span>
		<MkA class="reply" v-if="note.replyId" :to="`/notes/${note.replyId}`"><i class="fas fa-reply"></i></MkA>
		<MkA class="text-group" :to="notePage(note)">
			<Mfm v-if="note.text" :text="note.text" :author="note.user" :i="$i" :custom-emojis="note.emojis"/>
		</MkA>
		<MkA class="rp" v-if="note.renoteId" :to="`/notes/${note.renoteId}`">RN: ...</MkA>
	</div>
	<XMediaList v-if="note.files.length > 0 && $store.state.showMediaDetails" :media-list="note.files"/>
	<details v-else-if="note.files.length > 0">
		<summary>({{ $t('withNFiles', { n: note.files.length }) }})</summary>
		<XMediaList :media-list="note.files"/>
	</details>
	<XPoll v-if="note.poll && $store.state.showMediaDetails" :note="note"/>
	<details v-else-if="note.poll">
		<summary>{{ $ts.poll }}</summary>
		<XPoll :note="note"/>
	</details>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import XPoll from './poll.vue';
import XMediaList from './media-list.vue';
import * as os from '@client/os';
import notePage from "@client/filters/note";

export default defineComponent({
	components: {
		XPoll,
		XMediaList,
	},
	props: {
		note: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
		};
	},
	methods: {
		notePage
	}
});
</script>

<style lang="scss" scoped>
.wrmlmaau {
	overflow-wrap: break-word;

	> .body {
		> .reply {
			margin-right: 6px;
			color: var(--accent);
		}

		> .text-group {
			text-decoration: none;

			&:hover {
				color: var(--accent);
			}
		}

		> .rp {
			margin-left: 4px;
			font-style: oblique;
			color: var(--renote);
		}
	}
}
</style>
