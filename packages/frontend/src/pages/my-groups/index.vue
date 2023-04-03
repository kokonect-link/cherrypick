<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="700">
		<div v-if="tab === 'owned'" class="_content">
			<MkButton primary class="add" style="margin: 0 auto var(--margin) auto;" @click="create"><i class="ti ti-plus"></i> {{ i18n.ts.createGroup }}</MkButton>

			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="ownedPagination" class="groups">
				<MkA v-for="group in items" :key="group.id" class="group _panel" :to="`/my/groups/${ group.id }`">
					<div class="name">{{ group.name }}</div>
					<MkAvatars :user-ids="group.userIds"/>
				</MkA>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'joined'" class="_content">
			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="joinedPagination" class="groups">
				<MkA v-for="group in items" :key="group.id" class="group _panel" :to="`/my/groups/${ group.id }`">
					<div class="name">{{ group.name }}</div>
					<MkAvatars :user-ids="group.userIds"/>
					<div class="actions">
						<MkButton danger @click="leave(group)">{{ i18n.ts.leaveGroup }}</MkButton>
					</div>
				</MkA>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'invites'" class="_content">
			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="invitationPagination">
				<MkA v-for="invitation in items" :key="invitation.id" class="group _panel">
					<div class="name">{{ invitation.group.name }}</div>
					<MkAvatars :user-ids="invitation.group.userIds"/>
					<div class="actions">
						<MkButton primary inline @click="acceptInvite(invitation)"><i class="ti ti-check"></i> {{ i18n.ts.accept }}</MkButton>
						<MkButton primary inline @click="rejectInvite(invitation)"><i class="ti ti-x"></i> {{ i18n.ts.reject }}</MkButton>
					</div>
				</MkA>
			</MkPagination>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import MkAvatars from '@/components/MkAvatars.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const pagingComponent = $ref<InstanceType<typeof MkPagination>>();

const ownedPagination = {
	endpoint: 'users/groups/owned' as const,
	limit: 10,
	// sort: '+createdAt/updatedAt',
};
const joinedPagination = {
	endpoint: 'users/groups/joined' as const,
	limit: 10,
};
const invitationPagination = {
	endpoint: 'i/user-group-invites' as const,
	limit: 10,
};

let tab = $ref('owned');

async function create() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.groupName,
	});
	if (canceled) return;
	await os.apiWithDialog('users/groups/create', { name: name });
	pagingComponent.reload();
}

async function acceptInvite(invitation) {
	os.apiWithDialog('users/groups/invitations/accept', {
		invitationId: invitation.id,
	}).then(() => {
		os.success();
		pagingComponent.reload();
	});
}

function rejectInvite(invitation) {
	os.apiWithDialog('users/groups/invitations/reject', {
		invitationId: invitation.id,
	}).then(() => {
		pagingComponent.reload();
		// this.$refs.invitations.reload();
	});
}

async function leave(group) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.t('leaveGroupConfirm', { name: group.name }),
	});
	if (canceled) return;
	os.apiWithDialog('users/groups/leave', {
		groupId: group.id,
	}).then(() => {
		pagingComponent.reload();
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'owned',
	title: i18n.ts.ownedGroups,
	icon: 'ti ti-flag',
}, {
	key: 'joined',
	title: i18n.ts.joinedGroups,
	icon: 'ti ti-id-badge',
}, {
	key: 'invites',
	title: i18n.ts.invites,
	icon: 'ti ti-mail-opened',
}]);

definePageMetadata({
	title: i18n.ts.groups,
	icon: 'ti ti-users',
	actions: [{
		icon: 'ti ti-plus',
		text: i18n.ts.createGroup,
		handler: create,
	}],
});

</script>

<style lang="scss" scoped>
._content {
	> .add {
		margin: 0 auto var(--margin) auto;
	}

	> .groups {
		> .group {
			display: block;
			padding: 16px;
			border: solid 1px var(--divider);
			border-radius: 6px;

			&:hover {
				border: solid 1px var(--accent);
				text-decoration: none;
			}

			> .name {
				margin-bottom: 4px;
			}
		}
	}
}
</style>
