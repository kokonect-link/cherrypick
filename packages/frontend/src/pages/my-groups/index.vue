<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="700">
		<div v-if="tab === 'owned'" class="_content">
			<MkButton primary style="margin: 0 auto var(--margin) auto;" @click="create"><i class="fas fa-plus"></i> {{ $ts.createGroup }}</MkButton>

			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="ownedPagination">
				<div v-for="group in items" :key="group.id" class="_card">
					<div class="_title"><MkA :to="`/my/groups/${ group.id }`" class="_link">{{ group.name }}</MkA></div>
					<div class="_content"><MkAvatars :user-ids="group.userIds"/></div>
				</div>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'joined'" class="_content">
			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="joinedPagination">
				<div v-for="group in items" :key="group.id" class="_card">
					<div class="_title">{{ group.name }}</div>
					<div class="_content"><MkAvatars :user-ids="group.userIds"/></div>
					<div class="_footer">
						<MkButton danger @click="leave(group)">{{ $ts.leaveGroup }}</MkButton>
					</div>
				</div>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'invites'" class="_content">
			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="invitationPagination">
				<div v-for="invitation in items" :key="invitation.id" class="_card">
					<div class="_title">{{ invitation.group.name }}</div>
					<div class="_content"><MkAvatars :user-ids="invitation.group.userIds"/></div>
					<div class="_footer">
						<MkButton primary inline @click="acceptInvite(invitation)"><i class="fas fa-check"></i> {{ $ts.accept }}</MkButton>
						<MkButton primary inline @click="rejectInvite(invitation)"><i class="fas fa-ban"></i> {{ $ts.reject }}</MkButton>
					</div>
				</div>
			</MkPagination>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
// import MkContainer from '@/components/ui/container.vue';
import MkAvatars from '@/components/MkAvatars.vue';
// import MkTab from '@/components/tab.vue';
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
	icon: 'fas fa-user-tie',
}, {
	key: 'joined',
	title: i18n.ts.joinedGroups,
	icon: 'fas fa-id-badge',
}, {
	key: 'invites',
	title: i18n.ts.invites,
	icon: 'fas fa-envelope-open-text',
}]);

definePageMetadata({
	title: i18n.ts.groups,
	icon: 'fas fa-users',
	actions: [{
		icon: 'fas fa-plus',
		text: i18n.ts.createGroup,
		handler: create,
	}],
});

</script>

<style lang="scss" scoped>
</style>
