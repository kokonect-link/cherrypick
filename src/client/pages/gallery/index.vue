<template>
<div class="xprsixdl _root" :class="{ isFriendlyUI }">
	<MkTab v-model:value="tab" v-if="$i">
		<option value="explore"><i class="fas fa-icons"></i> {{ $ts.gallery }}</option>
		<option value="liked"><i class="fas fa-heart"></i> {{ $ts._gallery.liked }}</option>
		<option value="my"><i class="fas fa-edit"></i> {{ $ts._gallery.my }}</option>
	</MkTab>

	<div v-if="tab === 'explore'">
		<MkFolder class="_gap">
			<template #header><i class="fas fa-clock"></i>{{ $ts.recentPosts }}</template>
			<MkPagination :pagination="recentPostsPagination" #default="{items}" :disable-auto-load="true">
				<div class="vfpdbgtk">
					<MkGalleryPostPreview v-for="post in items" :post="post" :key="post.id" class="post"/>
				</div>
			</MkPagination>
		</MkFolder>
		<MkFolder class="_gap">
			<template #header><i class="fas fa-fire-alt"></i>{{ $ts.popularPosts }}</template>
			<MkPagination :pagination="popularPostsPagination" #default="{items}" :disable-auto-load="true">
				<div class="vfpdbgtk">
					<MkGalleryPostPreview v-for="post in items" :post="post" :key="post.id" class="post"/>
				</div>
			</MkPagination>
		</MkFolder>
	</div>
	<div v-else-if="tab === 'liked'">
		<MkPagination :pagination="likedPostsPagination" #default="{items}">
			<div class="vfpdbgtk">
				<MkGalleryPostPreview v-for="like in items" :post="like.post" :key="like.id" class="post"/>
			</div>
		</MkPagination>
	</div>
	<div v-else-if="tab === 'my'">
		<MkA v-if="(isWideTablet || isDesktop) && (isFriendlyUI || isFriendlyUIBeta) || !(isFriendlyUI || isFriendlyUIBeta)" to="/gallery/new" class="_link" style="margin: 16px;"><i class="fas fa-plus"></i> {{ $ts.postToGallery }}</MkA>
		<MkPagination :pagination="myPostsPagination" #default="{items}">
			<div class="vfpdbgtk">
				<MkGalleryPostPreview v-for="post in items" :post="post" :key="post.id" class="post"/>
			</div>
		</MkPagination>
	</div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import XUserList from '@client/components/user-list.vue';
import MkFolder from '@client/components/ui/folder.vue';
import MkInput from '@client/components/ui/input.vue';
import MkButton from '@client/components/ui/button.vue';
import MkTab from '@client/components/tab.vue';
import MkPagination from '@client/components/ui/pagination.vue';
import MkGalleryPostPreview from '@client/components/gallery-post-preview.vue';
import number from '@client/filters/number';
import * as os from '@client/os';
import * as symbols from '@client/symbols';

const DESKTOP_THRESHOLD = 1100;
const WIDE_TABLET_THRESHOLD = 850;
const MOBILE_THRESHOLD = 600;

export default defineComponent({
	components: {
		XUserList,
		MkFolder,
		MkInput,
		MkButton,
		MkTab,
		MkPagination,
		MkGalleryPostPreview,
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
				title: this.$ts.gallery,
				icon: 'fas fa-icons',
				action: {
					icon: 'fas fa-plus',
					handler: () => {
						this.$router.push('/gallery/new');
					}
				}
			},
			tab: 'explore',
			recentPostsPagination: {
				endpoint: 'gallery/posts',
				limit: 6,
			},
			popularPostsPagination: {
				endpoint: 'gallery/featured',
				limit: 5,
			},
			myPostsPagination: {
				endpoint: 'i/gallery/posts',
				limit: 5,
			},
			likedPostsPagination: {
				endpoint: 'i/gallery/likes',
				limit: 5,
			},
			tags: [],
			isMobile: window.innerWidth <= MOBILE_THRESHOLD,
			isWideTablet: window.innerWidth >= WIDE_TABLET_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUIBeta: localStorage.getItem('ui') == "friendly-beta",
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

	created() {},

	methods: {

	}
});
</script>

<style lang="scss" scoped>
.xprsixdl {
	max-width: 1400px;
	margin: 0 auto;

	&.isFriendlyUI {
		margin: -8px;
	}
}

.vfpdbgtk {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	grid-gap: 12px;
	margin: 0 var(--margin);
}
</style>
