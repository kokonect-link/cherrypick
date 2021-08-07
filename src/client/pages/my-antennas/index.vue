<template>
<div class="ieepwinx _section">
	<MkButton v-if="(isWideTablet || isDesktop) && (isFriendlyUI || isFriendlyUILegacy) || !(isFriendlyUI || isFriendlyUILegacy)" :link="true" to="/my/antennas/create" primary class="add"><i class="fas fa-plus"></i> {{ $ts.add }}</MkButton>

	<div class="_content">
		<MkPagination :pagination="pagination" #default="{items}" ref="list">
			<MkA class="ljoevbzj" v-for="antenna in items" :key="antenna.id" :to="`/my/antennas/${antenna.id}`">
				<div class="name">{{ antenna.name }}</div>
			</MkA>
		</MkPagination>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkPagination from '@client/components/ui/pagination.vue';
import MkButton from '@client/components/ui/button.vue';
import * as symbols from '@client/symbols';

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
				title: this.$ts.manageAntennas,
				icon: 'fas fa-satellite',
				action: {
					icon: 'fas fa-plus',
					handler: this.create
				}
			},
			pagination: {
				endpoint: 'antennas/list',
				limit: 10,
			},
			draft: null,
			isWideTablet: window.innerWidth >= WIDE_TABLET_THRESHOLD,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
		};
	},
});
</script>

<style lang="scss" scoped>
.ieepwinx {
	padding: 16px;

	> .add {
		margin: 0 auto 16px auto;
	}

	.ljoevbzj {
		display: block;
		padding: 16px;
		margin-bottom: 8px;
		border: solid 1px var(--divider);
		border-radius: 6px;

		&:hover {
			border: solid 1px var(--accent);
			text-decoration: none;
		}

		> .name {
			font-weight: bold;
		}
	}
}
</style>
