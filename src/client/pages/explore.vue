<template>
<div>
	<MkHeader v-if="!isFriendlyUI && !isFriendlyUILegacy" :info="header"/>
	<!-- <MkHeaderCP v-else :info="header"/> -->

	<MkSpacer :content-max="1200">
		<div class="lznhrdub _root">
			<div v-if="tab === 'local'">
				<div class="localfedi7 _block _isolated" v-if="meta && stats && tag == null" :style="{ backgroundImage: meta.bannerUrl ? `url(${meta.bannerUrl})` : null }">
					<header><span>{{ $t('explore', { host: meta.name || 'Misskey' }) }}</span></header>
					<div><span>{{ $t('exploreUsersCount', { count: num(stats.originalUsersCount) }) }}</span></div>
				</div>

				<template v-if="tag == null">
					<MkFolder class="_gap" persist-key="explore-pinned-users">
						<template #header><i class="fas fa-bookmark fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.pinnedUsers }}</template>
						<XUserList :pagination="pinnedUsers"/>
					</MkFolder>
					<MkFolder class="_gap" persist-key="explore-popular-users">
						<template #header><i class="fas fa-chart-line fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.popularUsers }}</template>
						<XUserList :pagination="popularUsers"/>
					</MkFolder>
					<MkFolder class="_gap" persist-key="explore-recently-updated-users">
						<template #header><i class="fas fa-comment-alt fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.recentlyUpdatedUsers }}</template>
						<XUserList :pagination="recentlyUpdatedUsers"/>
					</MkFolder>
					<MkFolder class="_gap" persist-key="explore-recently-registered-users">
						<template #header><i class="fas fa-plus fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.recentlyRegisteredUsers }}</template>
						<XUserList :pagination="recentlyRegisteredUsers"/>
					</MkFolder>
				</template>
			</div>
			<div v-else-if="tab === 'remote'">
				<div class="localfedi7 _block _isolated" v-if="tag == null" :style="{ backgroundImage: `url(/static-assets/client/fedi.jpg)` }">
					<header><span>{{ $ts.exploreFediverse }}</span></header>
				</div>

				<MkFolder :foldable="true" :expanded="false" ref="tags" class="_gap">
					<template #header><i class="fas fa-hashtag fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.popularTags }}</template>

					<div class="vxjfqztj"> <!-- Misskey Default: :to="`/explore/tags/${tag.tag}`" -->
						<MkA v-for="tag in tagsLocal" :to="`/tags/${tag.tag}`" :key="'local:' + tag.tag" class="local">{{ tag.tag }}</MkA>
						<MkA v-for="tag in tagsRemote" :to="`/tags/${tag.tag}`" :key="'remote:' + tag.tag">{{ tag.tag }}</MkA>
					</div>
				</MkFolder>

				<MkFolder v-if="tag != null" :key="`${tag}`" class="_gap">
					<template #header><i class="fas fa-hashtag fa-fw" style="margin-right: 0.5em;"></i>{{ tag }}</template>
					<XUserList :pagination="tagUsers"/>
				</MkFolder>

				<template v-if="tag == null">
					<MkFolder class="_gap">
						<template #header><i class="fas fa-chart-line fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.popularUsers }}</template>
						<XUserList :pagination="popularUsersF"/>
					</MkFolder>
					<MkFolder class="_gap">
						<template #header><i class="fas fa-comment-alt fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.recentlyUpdatedUsers }}</template>
						<XUserList :pagination="recentlyUpdatedUsersF"/>
					</MkFolder>
					<MkFolder class="_gap">
						<template #header><i class="fas fa-rocket fa-fw" style="margin-right: 0.5em;"></i>{{ $ts.recentlyDiscoveredUsers }}</template>
						<XUserList :pagination="recentlyRegisteredUsersF"/>
					</MkFolder>
				</template>
			</div>
			<div v-else-if="tab === 'search'">
				<div class="_isolated">
					<!-- 기존 Misskey 방식 유저 검색
					<MkInput v-model="searchQuery" :debounce="true" type="search">
						<template #prefix><i class="fas fa-search"></i></template>
						<template #label>{{ $ts.searchUser }}</template>
					</MkInput>
					-->
					<XSearch v-model="searchQuery" @search="search"/>
					<MkRadios v-model="searchOrigin">
						<option value="local">{{ $ts.local }}</option>
						<option value="remote">{{ $ts.remote }}</option>
						<option value="both">{{ $ts.both }}</option>
					</MkRadios>
				</div>

				<!-- 기존 Misskey 방식 유저 검색
				<XUserList v-if="searchQuery" class="_gap" :pagination="searchPagination" ref="search"/>
				-->
			</div>
		</div>
	</MkSpacer>
</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import XUserList from '@client/components/user-list.vue';
import MkFolder from '@client/components/ui/folder.vue';
import MkInput from '@client/components/form/input.vue';
import MkRadios from '@client/components/form/radios.vue';
import XSearch from '@client/components/search.vue';
import number from '@client/filters/number';
import * as os from '@client/os';
import * as symbols from '@client/symbols';

export default defineComponent({
	components: {
		XUserList,
		MkFolder,
		MkInput,
		MkRadios,
		XSearch,
	},

	inject: {
		navHook: {
			default: null
		},
		sideViewHook: {
			default: null
		}
	},

	props: {
		tag: {
			type: String,
			required: false
		}
	},

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.explore,
				icon: 'fas fa-hashtag',
				bg: 'var(--bg)',
			},
			tab: 'local',
			header: computed(() => ({
				title: this.$ts.explore,
				icon: 'fas fa-hashtag',
				bg: 'var(--bg)',
				tabs: [{
					active: this.tab === 'local',
					title: this.$ts.local,
					onClick: () => { this.tab = 'local'; },
				}, {
					active: this.tab === 'remote',
					title: this.$ts.remote,
					onClick: () => { this.tab = 'remote'; },
				}, {
					active: this.tab === 'search',
					title: this.$ts.search,
					onClick: () => { this.tab = 'search'; },
				},]
			})),
			pinnedUsers: { endpoint: 'pinned-users' },
			popularUsers: { endpoint: 'users', limit: 10, noPaging: true, params: {
				state: 'alive',
				origin: 'local',
				sort: '+follower',
			} },
			recentlyUpdatedUsers: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'local',
				sort: '+updatedAt',
			} },
			recentlyRegisteredUsers: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'local',
				state: 'alive',
				sort: '+createdAt',
			} },
			popularUsersF: { endpoint: 'users', limit: 10, noPaging: true, params: {
				state: 'alive',
				origin: 'remote',
				sort: '+follower',
			} },
			recentlyUpdatedUsersF: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'combined',
				sort: '+updatedAt',
			} },
			recentlyRegisteredUsersF: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'combined',
				sort: '+createdAt',
			} },
			searchPagination: {
				endpoint: 'users/search',
				limit: 10,
				params: computed(() => (this.searchQuery && this.searchQuery !== '') ? {
					query: this.searchQuery,
					origin: this.searchOrigin,
				} : null)
			},
			tagsLocal: [],
			tagsRemote: [],
			stats: null,
			searchQuery: null,
			searchOrigin: 'combined',
			num: number,
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
		};
	},

	computed: {
		meta() {
			return this.$instance;
		},
		tagUsers(): any {
			return {
				endpoint: 'hashtags/users',
				limit: 30,
				params: {
					tag: this.tag,
					origin: 'combined',
					sort: '+follower',
				}
			};
		},
	},

	watch: {
		tag() {
			if (this.$refs.tags) this.$refs.tags.toggleContent(this.tag == null);
		},
	},

	created() {
		os.api('hashtags/list', {
			sort: '+attachedLocalUsers',
			attachedToLocalUserOnly: true,
			limit: 30
		}).then(tags => {
			this.tagsLocal = tags;
		});
		os.api('hashtags/list', {
			sort: '+attachedRemoteUsers',
			attachedToRemoteUserOnly: true,
			limit: 30
		}).then(tags => {
			this.tagsRemote = tags;
		});
		os.api('stats').then(stats => {
			this.stats = stats;
		});
	},

	methods: {
		search() {
			this.push(`/search/notes/${encodeURIComponent(this.query)}`);
		},

		push(path: string) {
			if (this.navHook) {
				this.navHook(path);
			} else {
				if (this.$store.state.defaultSideView && this.sideViewHook && path !== '/') {
					return this.sideViewHook(path);
				}

				if (this.$router.currentRoute.value.path === path) {
					window.scroll({ top: 0, behavior: 'smooth' });
				} else {
					this.$router.push(path);
				}
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.localfedi7 {
	color: #fff;
	padding: 16px;
	height: 80px;
	background-position: 50%;
	background-size: cover;
	margin-bottom: var(--margin);

	> * {
		&:not(:last-child) {
			margin-bottom: 8px;
		}

		> span {
			display: inline-block;
			padding: 6px 8px;
			background: rgba(0, 0, 0, 0.7);
		}
	}

	> header {
		font-size: 20px;
		font-weight: bold;
	}

	> div {
		font-size: 14px;
		opacity: 0.8;
	}
}

.vxjfqztj {
	padding: 0 15px;
	margin-bottom: 25px;

	> * {
		margin-right: 16px;

		&.local {
			font-weight: bold;
		}
	}
}
</style>
