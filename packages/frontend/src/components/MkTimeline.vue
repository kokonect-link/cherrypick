<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkInfo v-if="$i && tlHint && !tlHintClosed" :closeable="true" style="margin-bottom: 16px;" @closed="closeHint">
	<I18n :src="tlHint"><template #icon><i :class="tlIcon"></i></template></I18n>
</MkInfo>
<MkPullToRefresh ref="prComponent" @refresh="() => reloadTimeline(true)">
	<MkNotes ref="tlComponent" :noGap="!defaultStore.state.showGapBetweenNotesInTimeline" :pagination="pagination" @queue="emit('queue', $event)" @status="prComponent.setDisabled($event)"/>
</MkPullToRefresh>
</template>

<script lang="ts" setup>
import { computed, provide, onUnmounted } from 'vue';
import MkNotes from '@/components/MkNotes.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkPullToRefresh from '@/components/MkPullToRefresh.vue';
import { useStream, reloadStream } from '@/stream.js';
import * as sound from '@/scripts/sound.js';
import { $i } from '@/account.js';
import { instance } from '@/instance.js';
import { ColdDeviceStorage, defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { vibrate } from '@/scripts/vibrate.js';

const props = withDefaults(defineProps<{
	src: string;
	list?: string;
	antenna?: string;
	channel?: string;
	role?: string;
	sound?: boolean;
	withRenotes?: boolean;
	withReplies?: boolean;
	onlyFiles?: boolean;
  onlyCats?: boolean;
}>(), {
	withRenotes: true,
	withReplies: false,
	onlyFiles: false,
	onlyCats: false,
});

const emit = defineEmits<{
	(ev: 'note'): void;
	(ev: 'queue', count: number): void;
}>();

provide('inChannel', computed(() => props.src === 'channel'));

const prComponent: InstanceType<typeof MkPullToRefresh> = $ref();
const tlComponent: InstanceType<typeof MkNotes> = $ref();

let tlNotesCount = 0;

const prepend = note => {
	tlNotesCount++;

	if (instance.notesPerOneAd > 0 && tlNotesCount % instance.notesPerOneAd === 0) {
		note._shouldInsertAd_ = true;
	}

	tlComponent.pagingComponent?.prepend(note);

	emit('note');

	if (props.sound) {
		sound.play($i && (note.userId === $i.id) ? 'noteMy' : 'note');
		vibrate($i && (note.userId === $i.id) ? '' : ColdDeviceStorage.get('vibrateNote') ? [30, 20] : '');
	}
};

const prependFilterdMedia = note => {
	if (note.files !== null && note.files.length > 0) {
		tlComponent.pagingComponent?.prepend(note);
	}

	emit('note');

	if (props.sound) {
		sound.play($i && (note.userId === $i.id) ? 'noteMy' : 'note');
		vibrate($i && (note.userId === $i.id) ? '' : ColdDeviceStorage.get('vibrateNote') ? [30, 20] : '');
	}
};

let endpoint;
let query;
let connection;
let connection2;

let tlIcon;
let tlHint;
let tlHintClosed;

const stream = useStream();
const connectChannel = () => {
	if (props.src === 'antenna') {
		connection = stream.useChannel('antenna', {
			antennaId: props.antenna,
		});
		connection.on('note', prepend);
	} else if (props.src === 'home') {
		connection = stream.useChannel('homeTimeline', {
			withRenotes: props.withRenotes,
			withFiles: props.onlyFiles ? true : undefined,
			withCats: props.onlyCats,
		});
		connection.on('note', prepend);
		connection2 = stream.useChannel('main');
		tlIcon = 'ti ti-home';
		tlHint = i18n.ts._tlTutorial.step1_1;
		tlHintClosed = defaultStore.state.tlHomeHintClosed;
	} else if (props.src === 'local') {
		connection = stream.useChannel('localTimeline', {
			withRenotes: props.withRenotes,
			withReplies: props.withReplies,
			withFiles: props.onlyFiles ? true : undefined,
			withCats: props.onlyCats,
		});
		connection.on('note', prepend);
		tlIcon = 'ti ti-planet';
		tlHint = i18n.ts._tlTutorial.step1_2;
		tlHintClosed = defaultStore.state.tlLocalHintClosed;
	} else if (props.src === 'social') {
		connection = stream.useChannel('hybridTimeline', {
			withRenotes: props.withRenotes,
			withReplies: props.withReplies,
			withFiles: props.onlyFiles ? true : undefined,
			withCats: props.onlyCats,
		});
		connection.on('note', prepend);
		tlIcon = 'ti ti-universe';
		tlHint = i18n.ts._tlTutorial.step1_3;
		tlHintClosed = defaultStore.state.tlSocialHintClosed;
	} else if (props.src === 'global') {
		connection = stream.useChannel('globalTimeline', {
			withRenotes: props.withRenotes,
			withFiles: props.onlyFiles ? true : undefined,
			withCats: props.onlyCats,
		});
		connection.on('note', prepend);
		tlIcon = 'ti ti-world';
		tlHint = i18n.ts._tlTutorial.step1_4;
		tlHintClosed = defaultStore.state.tlGlobalHintClosed;
	} else if (props.src === 'mentions') {
		connection = stream.useChannel('main');
		connection.on('mention', prepend);
	} else if (props.src === 'directs') {
		const onNote = note => {
			if (note.visibility === 'specified') {
				prepend(note);
			}
		};
		connection = stream.useChannel('main');
		connection.on('mention', onNote);
	} else if (props.src === 'list') {
		connection = stream.useChannel('userList', {
			withFiles: props.onlyFiles ? true : undefined,
			withCats: props.onlyCats,
			listId: props.list,
		});
		connection.on('note', prepend);
	} else if (props.src === 'channel') {
		connection = stream.useChannel('channel', {
			channelId: props.channel,
		});
		connection.on('note', prepend);
	} else if (props.src === 'role') {
		connection = stream.useChannel('roleTimeline', {
			roleId: props.role,
		});
		connection.on('note', prepend);
	}
};

if (props.src === 'antenna') {
	endpoint = 'antennas/notes';
	query = {
		antennaId: props.antenna,
	};
} else if (props.src === 'home') {
	endpoint = 'notes/timeline';
	query = {
		withRenotes: props.withRenotes,
		withFiles: props.onlyFiles ? true : undefined,
		withCats: props.onlyCats,
	};
	tlIcon = 'ti ti-home';
	tlHint = i18n.ts._tlTutorial.step1_1;
	tlHintClosed = defaultStore.state.tlHomeHintClosed;
} else if (props.src === 'local') {
	endpoint = 'notes/local-timeline';
	query = {
		withRenotes: props.withRenotes,
		withReplies: props.withReplies,
		withFiles: props.onlyFiles ? true : undefined,
		withCats: props.onlyCats,
	};
	tlIcon = 'ti ti-planet';
	tlHint = i18n.ts._tlTutorial.step1_2;
	tlHintClosed = defaultStore.state.tlLocalHintClosed;
} else if (props.src === 'social') {
	endpoint = 'notes/hybrid-timeline';
	query = {
		withRenotes: props.withRenotes,
		withReplies: props.withReplies,
		withFiles: props.onlyFiles ? true : undefined,
		withCats: props.onlyCats,
	};
	tlIcon = 'ti ti-universe';
	tlHint = i18n.ts._tlTutorial.step1_3;
	tlHintClosed = defaultStore.state.tlSocialHintClosed;
} else if (props.src === 'global') {
	endpoint = 'notes/global-timeline';
	query = {
		withRenotes: props.withRenotes,
		withFiles: props.onlyFiles ? true : undefined,
		withCats: props.onlyCats,
	};
	tlIcon = 'ti ti-world';
	tlHint = i18n.ts._tlTutorial.step1_4;
	tlHintClosed = defaultStore.state.tlGlobalHintClosed;
} else if (props.src === 'mentions') {
	endpoint = 'notes/mentions';
} else if (props.src === 'directs') {
	endpoint = 'notes/mentions';
	query = {
		visibility: 'specified',
	};
} else if (props.src === 'list') {
	endpoint = 'notes/user-list-timeline';
	query = {
		withFiles: props.onlyFiles ? true : undefined,
		withCats: props.onlyCats,
		listId: props.list,
	};
} else if (props.src === 'channel') {
	endpoint = 'channels/timeline';
	query = {
		channelId: props.channel,
	};
} else if (props.src === 'role') {
	endpoint = 'roles/notes';
	query = {
		roleId: props.role,
	};
}

if (!defaultStore.state.disableStreamingTimeline) {
	connectChannel();

	onUnmounted(() => {
		connection.dispose();
		if (connection2) connection2.dispose();
	});
}

function closeHint() {
	switch (props.src) {
		case 'home':
			defaultStore.set('tlHomeHintClosed', true);
			break;
		case 'local':
			defaultStore.set('tlLocalHintClosed', true);
			break;
		case 'social':
			defaultStore.set('tlSocialHintClosed', true);
			break;
		case 'global':
			defaultStore.set('tlGlobalHintClosed', true);
			break;
	}
}

const pagination = {
	endpoint: endpoint,
	limit: 10,
	params: query,
};

const reloadTimeline = (fromPR = false) => {
	tlNotesCount = 0;

	tlComponent.pagingComponent?.reload().then(() => {
		reloadStream();
		if (fromPR) prComponent.refreshFinished();
	});
};

//const pullRefresh = () => reloadTimeline(true);

defineExpose({
	reloadTimeline,
});

/* TODO
const timetravel = (date?: Date) => {
	this.date = date;
	this.$refs.tl.reload();
};
*/
</script>
