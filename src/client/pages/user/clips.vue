<template>
<div class="_content">
	<MkPagination :pagination="pagination" #default="{items}" ref="list" class="list">
		<MkA v-for="item in items" :key="item.id" :to="`/clips/${item.id}`" class="item _panel _gap">
			<b>{{ item.name }}</b>
			<div v-if="item.description" class="description">{{ item.description }}</div>
			<footer>
				<img class="icon" :src="item.user.avatarUrl"/>
				<p>{{ userName(item.user) }}</p>
			</footer>
		</MkA>
	</MkPagination>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkPagination from '@client/components/ui/pagination.vue';
import { userPage, acct } from '../../filters/user';
import { userName } from '@client/filters/user';

export default defineComponent({
	components: {
		MkPagination,
	},

	props: {
		user: {
			type: Object,
			required: true
		},
	},

	data() {
		return {
			pagination: {
				endpoint: 'users/clips',
				limit: 20,
				params: {
					userId: this.user.id,
				}
			},
		};
	},

	watch: {
		user() {
			this.$refs.list.reload();
		}
	},

	methods: {
		userPage,
		userName,
		
		acct
	}
});
</script>

<style lang="scss" scoped>
._content {
	> .list {
		> .item {
			display: block;
			padding: 16px;

			&:hover {
				text-decoration: none;
				color: var(--accent);
			}

			> .description {
				margin-top: 8px;
				padding-top: 8px;
				border-top: solid 0.5px var(--divider);
			}

			> footer {
				margin-top: 8px;
				height: 16px;

				> img {
					display: inline-block;
					width: 16px;
					height: 16px;
					margin-right: 4px;
					vertical-align: top;
				}

				> p {
					display: inline-block;
					margin: 0;
					color: var(--urlPreviewInfo);
					font-size: 0.8em;
					line-height: 16px;
					vertical-align: top;
				}
			}
		}
	}
}
</style>
