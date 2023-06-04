<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700">
		<div class="mk-group-page">
			<transition :name="defaultStore.state.animation ? 'zoom' : ''" mode="out-in">
				<div v-if="group && $i.id === group.ownerId" class="_section actions">
					<div class="_content" style="">
						<MkButton inline @click="invite()">{{ i18n.ts.invite }}</MkButton>
						<MkButton inline @click="renameGroup()">{{ i18n.ts.rename }}</MkButton>
						<MkButton inline @click="transfer()">{{ i18n.ts.transfer }}</MkButton>
						<MkButton inline danger @click="deleteGroup()">{{ i18n.ts.delete }}</MkButton>
					</div>
				</div>
			</transition>

			<transition :name="defaultStore.state.animation ? 'zoom' : ''" mode="out-in">
				<div v-if="group" class="_section members _gap">
					<div class="_title">{{ i18n.ts.members }}</div>
					<div class="_content">
						<div class="users">
							<div v-for="user in users" :key="user.id" class="user _panel">
								<MkAvatar :user="user" class="avatar" :showIndicator="true"/>
								<div class="body">
									<MkUserName :user="user" class="name"/>
									<MkAcct :user="user" class="acct"/>
								</div>
								<div v-if="user.id === group.ownerId" :title="i18n.ts.leader" style="color: var(--badge);"><i class="ti ti-crown"></i></div>
								<div v-else-if="group && $i.id === group.ownerId" class="action">
									<button class="_button" :title="i18n.ts.banish" @click="removeUser(user)"><i class="ti ti-x"></i></button>
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
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { mainRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';

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
		text: i18n.t('banishConfirm', { name: user.name || user.username }),
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

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => group ? {
	title: group.name,
	icon: 'ti ti-briefcase',
} : null));

</script>

<style lang="scss" scoped>
.mk-group-page {
	> .actions {
		._content {
			display: flex;
			flex-wrap: wrap;
			gap: var(--margin);
		}
	}
	> .members {
		> ._content {
			display: flex;
			gap: var(--margin);
			flex-wrap: wrap;
			> .users {
				margin-top: var(--margin);
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
				grid-gap: 12px;
				width: 100%;

				> .user {
					display: flex;
					align-items: center;
					padding: 16px;

					> .avatar {
						width: 50px;
						height: 50px;
					}

					> .body {
						flex: 1;
						padding: 8px;
						width: 100%;
						white-space: nowrap;
						overflow: hidden;

						> .name {
							display: block;
							font-weight: bold;
						}

						> .acct {
							opacity: 0.5;
						}
					}
				}
			}
		}
	}
}
</style>
