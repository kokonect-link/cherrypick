<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700">
		<div class="ieepwinx">
			<div class="">
				<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
					<MkA v-for="antenna in items" :key="antenna.id" class="ljoevbzj" :to="`/my/antennas/${antenna.id}`">
						<div class="name">{{ antenna.name }}</div>
					</MkA>
				</MkPagination>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { useRouter } from '@/router';

const router = useRouter();

const pagination = {
	endpoint: 'antennas/list' as const,
	noPaging: true,
	limit: 10,
};

const headerActions = $computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.add,
	handler: () => {
		router.push('/my/antennas/create');
	},
}]);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.manageAntennas,
	icon: 'ti ti-antenna',
});
</script>

<style lang="scss" scoped>
.ieepwinx {

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
