<template>
<div>
	<div class="_section" style="padding: 0;" v-if="$i">
		<MkTab class="_content" :class="{ 'friendly': isFriendlyUI || isFriendlyUILegacy }" v-model="tab">
			<option value="featured"><i class="fas fa-fire-alt"></i> {{ $ts._channel.featured }}</option>
			<option value="following"><i class="fas fa-heart"></i> {{ $ts._channel.following }}</option>
			<option value="owned"><i class="fas fa-edit"></i> {{ $ts._channel.owned }}</option>
		</MkTab>
	</div>

	<div class="_section">
		<div class="_content grwlizim featured" v-if="tab === 'featured'">
			<MkPagination :pagination="featuredPagination" #default="{items}">
				<MkChannelPreview v-for="channel in items" class="_gap" :channel="channel" :key="channel.id"/>
			</MkPagination>
		</div>

		<div class="_content grwlizim following" v-if="tab === 'following'">
			<MkPagination :pagination="followingPagination" #default="{items}">
				<MkChannelPreview v-for="channel in items" class="_gap" :channel="channel" :key="channel.id"/>
			</MkPagination>
		</div>

		<div class="_content grwlizim owned" v-if="tab === 'owned'">
			<MkButton v-if="(isWideTablet || isDesktop) && (isFriendlyUI || isFriendlyUILegacy) || !(isFriendlyUI || isFriendlyUILegacy)" class="new" @click="create()"><i class="fas fa-plus"></i></MkButton>
			<MkPagination :pagination="ownedPagination" #default="{items}">
				<MkChannelPreview v-for="channel in items" class="_gap" :channel="channel" :key="channel.id"/>
			</MkPagination>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkChannelPreview from '@client/components/channel-preview.vue';
import MkPagination from '@client/components/ui/pagination.vue';
import MkButton from '@client/components/ui/button.vue';
import MkTab from '@client/components/tab.vue';
import * as symbols from '@client/symbols';

const DESKTOP_THRESHOLD = 1100;
const WIDE_TABLET_THRESHOLD = 850;

export default defineComponent({
	components: {
		MkChannelPreview, MkPagination, MkButton, MkTab
	},
	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.channel,
				icon: 'fas fa-satellite-dish',
				action: {
					icon: 'fas fa-plus',
					handler: this.create
				}
			},
			tab: 'featured',
			featuredPagination: {
				endpoint: 'channels/featured',
				noPaging: true,
			},
			followingPagination: {
				endpoint: 'channels/followed',
				limit: 5,
			},
			ownedPagination: {
				endpoint: 'channels/owned',
				limit: 5,
			},
			isWideTablet: window.innerWidth >= WIDE_TABLET_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
		};
	},
	methods: {
		create() {
			this.$router.push(`/channels/new`);
		}
	}
});
</script>

<style lang="scss" scoped>
._section {
	> .friendly {
		@media (min-width: 601px) {
			margin: -8px -8px auto;
		}
	}
}
</style>
