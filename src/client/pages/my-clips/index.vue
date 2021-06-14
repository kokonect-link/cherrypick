<template>
<div class="_section qtcaoidl">
	<MkButton v-if="(isWideTablet || isDesktop) && (isFriendlyUI || isFriendlyUILegacy) || !(isFriendlyUI || isFriendlyUILegacy)" @click="create" primary class="add"><i class="fas fa-plus"></i> {{ $ts.add }}</MkButton>

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
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkPagination from '@client/components/ui/pagination.vue';
import MkButton from '@client/components/ui/button.vue';
import * as os from '@client/os';
import * as symbols from '@client/symbols';
import { userName } from '@client/filters/user';

const DESKTOP_THRESHOLD = 1100;
const WIDE_TABLET_THRESHOLD = 850;

export default defineComponent({
	components: {
		MkPagination,
		MkButton,
	},

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.clip,
				icon: 'fas fa-paperclip',
				action: {
					icon: 'fas fa-plus',
					handler: this.create
				}
			},
			pagination: {
				endpoint: 'clips/list',
				limit: 10,
			},
			draft: null,
			isWideTablet: window.innerWidth >= WIDE_TABLET_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
		};
	},

	methods: {
		async create() {
			const { canceled, result } = await os.form(this.$ts.createNewClip, {
				name: {
					type: 'string',
					label: this.$ts.name
				},
				description: {
					type: 'string',
					required: false,
					multiline: true,
					label: this.$ts.description
				},
				isPublic: {
					type: 'boolean',
					label: this.$ts.public,
					default: false
				}
			});
			if (canceled) return;

			os.apiWithDialog('clips/create', result);
		},

		onClipCreated() {
			this.$refs.list.reload();
			this.draft = null;
		},

		onClipDeleted() {
			this.$refs.list.reload();
		},

		userName,
	}
});
</script>

<style lang="scss" scoped>
.qtcaoidl {
	> .add {
		margin: 16px auto;
	}

	> ._content {
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
}
</style>
