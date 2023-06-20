<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="800">
		<div>
			<div v-if="messages.length > 0">
				<MkA
					v-for="(message, i) in messages"
					:key="message.id"
					v-anim="i"
					class="_panel"
					:class="[$style.message, { [$style.isRead]: (isMe(message) || (message.groupId ? message.reads.includes($i.id) : message.isRead)) }]"
					:to="message.groupId ? `/my/messaging/group/${message.groupId}` : `/my/messaging/${getAcct(isMe(message) ? message.recipient : message.user)}`"
					:data-index="i"
				>
					<div>
						<span v-if="!(isMe(message) || (message.groupId ? message.reads.includes($i.id) : message.isRead))" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
						<MkAvatar :class="$style.avatar" :user="message.groupId ? message.user : isMe(message) ? message.recipient : message.user" indicator link preview/>
						<header v-if="message.groupId">
							<span :class="$style.name">{{ message.group.name }}</span>
							<MkTime :time="message.createdAt" :class="$style.time"/>
						</header>
						<header v-else>
							<span :class="$style.name"><MkUserName :user="isMe(message) ? message.recipient : message.user"/></span>
							<span :class="$style.username">@{{ acct(isMe(message) ? message.recipient : message.user) }}</span>
							<MkTime :time="message.createdAt" :class="$style.time"/>
						</header>
						<div>
							<p :class="$style.text"><span v-if="isMe(message)" :class="$style.me">{{ i18n.ts.you }}: </span>{{ message.text }}</p>
						</div>
					</div>
				</MkA>
			</div>
			<div v-if="!fetching && messages.length == 0" class="_fullinfo">
				<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost" alt=""/>
				<div>{{ i18n.ts.noHistory }}</div>
			</div>
			<MkLoading v-if="fetching"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { markRaw, onMounted, onUnmounted } from 'vue';
import * as Acct from 'cherrypick-js/built/acct';
import { acct } from '@/filters/user';
import * as os from '@/os';
import { useStream } from '@/stream';
import { useRouter } from '@/router';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { $i } from '@/account';
import { eventBus } from '@/scripts/cherrypick/eventBus';

const router = useRouter();

let fetching = $ref(true);
let messages = $ref([]);
let connection = $ref(null);

const getAcct = Acct.toString;

function isMe(message) {
	return message.userId === $i.id;
}

function onMessage(message) {
	if (message.recipientId) {
		messages = messages.filter(m => !(
			(m.recipientId === message.recipientId && m.userId === message.userId) ||
			(m.recipientId === message.userId && m.userId === message.recipientId)));

		messages.unshift(message);
	} else if (message.groupId) {
		messages = messages.filter(m => m.groupId !== message.groupId);
		messages.unshift(message);
	}
}

function onRead(ids) {
	for (const id of ids) {
		const found = messages.find(m => m.id === id);
		if (found) {
			if (found.recipientId) {
				found.isRead = true;
			} else if (found.groupId) {
				found.reads.push($i.id);
			}
		}
	}
}

function start(ev) {
	os.popupMenu([{
		text: i18n.ts.messagingWithUser,
		icon: 'ti ti-user',
		action: () => { startUser(); },
	}, {
		text: i18n.ts.messagingWithGroup,
		icon: 'ti ti-users',
		action: () => { startGroup(); },
	}], ev.currentTarget ?? ev.target);
}

async function startUser() {
	os.selectUser().then(user => {
		router.push(`/my/messaging/${Acct.toString(user)}`);
	});
}

async function startGroup() {
	const groups1 = await os.api('users/groups/owned');
	const groups2 = await os.api('users/groups/joined');
	if (groups1.length === 0 && groups2.length === 0) {
		os.alert({
			type: 'warning',
			title: i18n.ts.youHaveNoGroups,
			text: i18n.ts.joinOrCreateGroup,
		});
		return;
	}
	const { canceled, result: group } = await os.select({
		title: i18n.ts.group,
		items: groups1.concat(groups2).map(group => ({
			value: group, text: group.name,
		})),
	});
	if (canceled) return;
	router.push(`/my/messaging/group/${group.id}`);
}

onMounted(() => {
	connection = markRaw(useStream().useChannel('messagingIndex'));

	connection.on('message', onMessage);
	connection.on('read', onRead);

	os.api('messaging/history', { group: false }).then(userMessages => {
		os.api('messaging/history', { group: true }).then(groupMessages => {
			const _messages = userMessages.concat(groupMessages);
			_messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			messages = _messages;
			fetching = false;
		});
	});

	eventBus.on('openMessage', (ev) => {
		start(ev);
	});
});

onUnmounted(() => {
	if (connection) connection.dispose();
});

const headerActions = $computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.create,
	handler: start,
}]);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.messaging,
	icon: 'ti ti-messages',
});
</script>

<style lang="scss" module>
.message {
	display: block;
	text-decoration: none !important;
	margin-bottom: var(--margin);

	* {
		pointer-events: none;
		user-select: none;
	}

	&:hover {
		.avatar {
			filter: saturate(200%);
		}
	}

	&:after {
		content: "";
		display: block;
		clear: both;
	}

	> div {
		padding: 25px 30px;

		&:after {
			content: "";
			display: block;
			clear: both;
		}

		> header {
			display: flex;
			align-items: center;
			margin-bottom: 2px;
			white-space: nowrap;
			overflow: hidden;
		}
	}

	&.isRead {
		background: var(--chatReadBg);
	}
}

.indicator {
	position: absolute;
	top: 41px;
	left: 12px;
	color: var(--indicator);
	font-size: 9px;
}

.name {
	margin: 0;
	padding: 0;
	font-weight: bold;
	transition: all 0.1s ease;
}

.username {
	margin: 0 8px;
	overflow: hidden;
	text-overflow: ellipsis;
}

.time {
	margin: 0 0 0 auto;
	font-size: .85em;
}

.avatar {
	float: left;
	width: 42px;
	height: 42px;
	margin: 0 16px 0 0;
	border-radius: 8px;
	transition: all 0.1s ease;
}

.text {
	display: block;
	margin: 0 0 0 0;
	padding: 0;
	overflow: hidden;
	overflow-wrap: break-word;
	line-height: 1.35;
	max-height: 4.05em;
	color: var(--faceText);
}

.me {
	opacity: 0.7;
}

.image {
	display: block;
	max-width: 100%;
	max-height: 512px;
}

@container (max-width: 500px) {
	.message {
		> div {
			padding: 20px 30px;
			font-size: .9em;
		}
	}

	.indicator {
		top: 36px;
		left: 12px;
	}

	.avatar {
		margin: 0 12px 0 0;
	}
}
</style>
