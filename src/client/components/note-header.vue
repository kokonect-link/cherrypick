<template>
<header class="kkwtjztg">
	<MkA class="name" :to="userPage(note.user)" v-user-preview="isDesktop ? note.user.id : undefined">
		<MkUserName :user="note.user"/>
		<MkAcct class="username" :user="note.user"/>
	</MkA>
	<div class="is-bot" v-if="note.user.isBot">bot</div>
	<div class="locked" v-if="note.user.isLocked" :title="$ts.isLocked"><i class="fas fa-lock"></i></div>
	<div class="admin" v-if="note.user.isAdmin" :title="$ts.administrator"><i class="fas fa-crown"></i></div>
	<div class="moderator" v-if="!note.user.isAdmin && note.user.isModerator" :title="$ts.moderator"><i class="fas fa-chess-queen"></i></div>
	<template v-if="note.user.isPatron">
		<div class="patron" v-if="note.user.isVip" :title="$ts.vip"><i class="fas fa-gem"></i></div>
		<div class="patron" v-else :title="$ts.patron"><i class="fas fa-heart"></i></div>
	</template>
	<div class="info">
		<span class="mobile" v-if="note.viaMobile"><i class="fas fa-mobile-alt"></i></span>
		<MkA class="created-at" :to="notePage(note)">
			<MkTime :time="note.createdAt"/>
		</MkA>
		<span class="visibility" v-if="note.visibility !== 'public'">
			<i v-if="note.visibility === 'home'" class="fas fa-home"></i>
			<i v-else-if="note.visibility === 'followers'" class="fas fa-unlock"></i>
			<i v-else-if="note.visibility === 'specified'" class="fas fa-envelope"></i>
		</span>
		<span class="localOnly" v-if="note.localOnly"><i class="fas fa-network-wired"></i></span>
		<span class="remoteFollowersOnly" v-if="note.remoteFollowersOnly"><i class="fas fa-heartbeat"></i></span>
	</div>
</header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import notePage from '@client/filters/note';
import { userPage } from '@client/filters/user';
import * as os from '@client/os';

const DESKTOP_THRESHOLD = 1100;

export default defineComponent({
	props: {
		note: {
			type: Object,
			required: true
		},
	},

	data() {
		return {
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
		};
	},

	methods: {
		notePage,
		userPage
	}
});
</script>

<style lang="scss" scoped>
.kkwtjztg {
	display: flex;
	align-items: baseline;
	white-space: nowrap;

	> .name {
		flex-shrink: 1;
		display: block;
		margin: 0 .5em 0 0;
		padding: 0;
		overflow: hidden;
		font-size: 1em;
		font-weight: bold;
		text-decoration: none;
		text-overflow: ellipsis;

		&:hover {
			color: var(--accent);
		}

		> .username {
			flex-shrink: 9999999;
			margin: 0 0 0 .5em;
			overflow: hidden;
			text-overflow: ellipsis;
			font-weight: normal;
		}
	}

	> .is-bot {
		flex-shrink: 0;
		align-self: center;
		margin: 0 .5em 0 0;
		padding: 1px 6px;
		font-size: 80%;
		border: solid 0.5px var(--divider);
		border-radius: 3px;
	}

	> .admin,
	> .moderator {
		flex-shrink: 0;
		margin-right: 0.5em;
		color: var(--badge);
	}

	> .locked {
		margin-right: 0.5em;
	}

	> .patron {
		margin-right: 0.5em;
		color: var(--patron);
	}

	> .info {
		flex-shrink: 0;
		margin-left: auto;
		font-size: 0.9em;

		> .mobile {
			margin-right: 8px;
		}

		> .visibility {
			margin-left: 8px;
		}

		> .localOnly, .remoteFollowersOnly {
			margin-left: 8px;
		}
	}
}
</style>
