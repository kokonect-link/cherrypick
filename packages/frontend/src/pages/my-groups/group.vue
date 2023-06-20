<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-if="group && $i.id === group.ownerId" :actions="headerActions" :tabs="headerTabs"/>
		<MkPageHeader v-else :tabs="headerTabs"/>
	</template>
	<MkSpacer :contentMax="700">
		<div>
			<transition :name="defaultStore.state.animation ? 'zoom' : ''" mode="out-in">
				<div v-if="group" class="_gaps_s">
					<div style="margin-top: var(--margin);">{{ i18n.ts.members }}</div>
					<div :class="$style.content">
						<div :class="$style.users">
							<div v-for="user in users" :key="user.id" :class="$style.user" class="_panel">
								<MkAvatar :user="user" :class="$style.avatar" link preview/>
								<div :class="$style.body">
									<MkA v-user-preview="user" :class="$style.username" :to="userPage(user)">
										<MkUserName :user="user" :class="$style.name"/>
									</MkA>
									<MkAcct :user="user" :class="$style.acct"/>
								</div>
								<div v-if="user.id === group.ownerId" v-tooltip="i18n.ts._group.leader" style="color: var(--badge);"><i class="ti ti-crown"></i></div>
								<div v-else-if="group && $i.id === group.ownerId">
									<button v-tooltip="i18n.ts._group.banish" class="_button" @click="removeUser(user)"><i class="ti ti-x"></i></button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</transition>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import * as os from '@/os';
import { $i } from '@/account';
import { mainRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import { userPage } from '@/filters/user';

const props = defineProps<{
	groupId: string;
}>();

let group = $ref(null);
let users = $ref([]);

function fetchGroup() {
	os.api('users/groups/show', {
		groupId: props.groupId,
	}).then(_group => {
		group = _group;
		os.api('users/show', {
			userIds: group.userIds,
		}).then(_users => {
			users = _users;
		});
	});
}

function invite() {
	os.selectUser().then(user => {
		os.apiWithDialog('users/groups/invite', {
			groupId: group.id,
			userId: user.id,
		});
	});
}

async function removeUser(user) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.t('_group.banishConfirm', { name: user.name || user.username, group: group.name }),
	});
	if (canceled) return;

	os.apiWithDialog('users/groups/pull', {
		groupId: group.id,
		userId: user.id,
	}).then(() => {
		users = users.filter(x => x.id !== user.id);
	});
}

async function renameGroup() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.groupName,
		default: group.name,
	});
	if (canceled) return;

	await os.apiWithDialog('users/groups/update', {	
		groupId: group.id,
		name: name,
	});

	group.name = name;
}

function transfer() {
	os.selectUser().then(user => {
		os.apiWithDialog('users/groups/transfer', {
			groupId: group.id,
			userId: user.id,
		});
	});
}

async function deleteGroup() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.t('removeAreYouSure', { x: group.name }),
	});
	if (canceled) return;

	await os.apiWithDialog('users/groups/delete', {
		groupId: group.id,
	});
	mainRouter.push('/my/groups');
}

watch(() => props.listId, fetchGroup, { immediate: true });

const headerActions = $computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.invite,
	handler: () => {
		invite();
	},
}, {
	icon: 'ti ti-edit',
	text: i18n.ts.rename,
	handler: () => {
		renameGroup();
	},
}, {
	icon: 'ti ti-arrows-exchange',
	text: i18n.ts.transfer,
	handler: () => {
		transfer();
	},
}, {
	icon: 'ti ti-trash',
	text: i18n.ts.delete,
	handler: () => {
		deleteGroup();
	},
}]);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => group ? {
	title: group.name,
	icon: 'ti ti-briefcase',
} : null));

</script>

<style lang="scss" module>
.content {
	display: flex;
	flex-wrap: wrap;
	gap: var(--margin);
}

.users {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
	grid-gap: 12px;
	width: 100%;
}

.user {
	display: flex;
	align-items: center;
	padding: 16px;
}

.avatar {
	width: 50px;
	height: 50px;
}

.body {
	flex: 1;
	padding: 8px;
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
}

.username {
	font-weight: bold;
	text-decoration: none;

	&:hover {
		color: var(--renoteHover);
		text-decoration: none;
	}
}

.name {
	display: block;
	font-weight: bold;
}

.acct {
	opacity: 0.5;
}
</style>
