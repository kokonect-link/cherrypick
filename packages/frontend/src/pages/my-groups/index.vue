<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<div v-if="tab === 'owned'">
			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="ownedPagination">
				<MkA v-for="group in items" :key="group.id" :class="$style.group" class="_panel" :to="`/my/groups/${ group.id }`">
					<div :class="$style.name">{{ group.name }}</div>
					<MkAvatars :class="$style.avatars" :userIds="group.userIds"/>
				</MkA>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'joined'">
			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="joinedPagination">
				<div v-for="group in items" :class="$style.group" class="_panel">
					<MkA :key="group.id" :class="$style.groupTop" :to="`/my/groups/${ group.id }`">
						<div :class="$style.name">{{ group.name }}</div>
						<MkAvatars :class="$style.avatars" :userIds="group.userIds"/>
					</MkA>
					<div :class="$style.actions">
						<MkButton rounded danger @click="leave(group)">{{ i18n.ts.leaveGroup }}</MkButton>
					</div>
				</div>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'invites'">
			<MkPagination v-slot="{items}" ref="pagingComponent" :pagination="invitationPagination">
				<MkA v-for="invitation in items" :key="invitation.id" :class="$style.group" class="_panel">
					<div :class="$style.name">{{ invitation.group.name }}</div>
					<MkAvatars :class="$style.avatars" :userIds="invitation.group.userIds"/>
					<div :class="$style.actions">
						<MkButton primary rounded inline :class="$style.invitesButton" @click="acceptInvite(invitation)"><i class="ti ti-check"></i> {{ i18n.ts.accept }}</MkButton>
						<MkButton rounded inline :class="$style.invitesButton" @click="rejectInvite(invitation)"><i class="ti ti-x"></i> {{ i18n.ts.reject }}</MkButton>
					</div>
				</MkA>
			</MkPagination>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import MkAvatars from '@/components/MkAvatars.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';

const pagingComponent = useTemplateRef('pagingComponent');

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

const tab = ref('owned');

async function create() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.groupName,
	});
	if (canceled) return;
	await os.apiWithDialog('users/groups/create', { name: name });
	pagingComponent.value.reload();
}

async function acceptInvite(invitation) {
	os.apiWithDialog('users/groups/invitations/accept', {
		invitationId: invitation.id,
	}).then(() => {
		os.success();
		pagingComponent.value.reload();
	});
}

function rejectInvite(invitation) {
	os.apiWithDialog('users/groups/invitations/reject', {
		invitationId: invitation.id,
	}).then(() => {
		pagingComponent.value.reload();
		// this.$refs.invitations.reload();
	});
}

async function leave(group) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.tsx.leaveGroupConfirm({ name: group.name }),
	});
	if (canceled) return;
	os.apiWithDialog('users/groups/leave', {
		groupId: group.id,
	}).then(() => {
		pagingComponent.value.reload();
	});
}

const headerActions = computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.createGroup,
	handler: create,
}]);

const headerTabs = computed(() => [{
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

definePage(() => ({
	title: i18n.ts.groups,
	icon: 'ti ti-users',
}));
</script>

<style lang="scss" module>
.actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
	padding: 0 24px 16px;
}

.add {
	margin: 0 auto var(--MI-margin) auto;
}

.group {
	display: block;
	border: solid 1px var(--MI_THEME-divider);
	border-radius: 6px;

	&:hover {
		border: solid 1px var(--MI_THEME-accent);
		text-decoration: none;
	}

	&:not(:last-child) {
		margin-bottom: 8px;
	}
}

.groupTop {
	&:hover {
		text-decoration: none;
	}
}

.name {
	margin-bottom: 12px;
	border-bottom: solid 1px var(--MI_THEME-divider);
	padding: 16px 24px;
	font-weight: bold;
}

.avatars {
	padding: 8px 24px 16px;
}

.invitesButton {
	&:not(:last-child) {
		margin-right: 5px;
	}
}
</style>
