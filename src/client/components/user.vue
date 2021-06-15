경<template>
	<div class="user _panel">
		<MkAvatar class="avatar" :user="user" :show-indicator="true"/>
		<div class="body">
			<div class="name">
				<MkA class="name" :to="userPage(user)" v-user-preview="user.id"><MkUserName :user="user"/><span class="username"><MkAcct :user="user"/></span></MkA>
			</div>
			<div class="description">
				<Mfm v-if="user.description" :text="user.description" :is-note="false" :author="user" :i="$i" :custom-emojis="user.emojis"/>
				<span v-else class="empty">{{ $ts.noAccountDescription }}</span>
			</div>
		</div>
		<MkFollowButton class="koudoku-button" v-if="$i && user.id != $i.id" :user="user" mini/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkFollowButton from './follow-button.vue';
import { userPage } from '@client/filters/user';

export default defineComponent({
	components: {
		MkFollowButton,
	},

	props: {
		user: {
			required: true
		},
	},
	methods: {
		userPage,
	}
});
</script>

<style lang="scss" scoped>
.user {
	position: relative;
	display: flex;
	padding: 16px;
	// border-bottom: solid 1px var(--divider);
	margin: 10px 0;

	&:last-child {
		border-bottom: none;
	}

	> .avatar {
		display: block;
		flex-shrink: 0;
		margin: 0 12px 0 0;
		width: 42px;
		height: 42px;
		border-radius: 8px;
	}

	> .body {
		flex: 1;
		overflow: auto;

		> .name {
			font-weight: bold;
			overflow: hidden;
			text-overflow: ellipsis;
			padding-right: 10px;

			> .name {
				> .username {
					opacity: 0.7;
					margin-left: 8px;
				}

				&:hover {
					color: var(--accent);
					text-decoration: none;
				}
			}
		}

		> .description {
			font-size: 90%;
			overflow: hidden;
			text-overflow: ellipsis;
			max-height: 100px;

			> .empty {
				opacity: 0.7;
			}
		}
	}

	> .koudoku-button {
		flex-shrink: 0;
	}
}
</style>
