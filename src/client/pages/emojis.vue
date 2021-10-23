<template>
<div>
	<MkHeader v-if="!isFriendlyUI && !isFriendlyUILegacy" :info="header"/>
	<!-- <MkHeaderCP v-else :info="header"/> -->
	<div :class="$style.root">
		<XCategory v-if="tab === 'category'"/>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import * as os from '@client/os';
import * as symbols from '@client/symbols';
import XCategory from './emojis.category.vue';

export default defineComponent({
	components: {
		XCategory,
	},

	data() {
		return {
			[symbols.PAGE_INFO]: computed(() => ({
				title: this.$ts.customEmojis,
				icon: 'fas fa-laugh',
				bg: 'var(--bg)',
			})),
			header: computed(() => ({
				title: this.$ts.customEmojis,
				icon: 'fas fa-laugh',
				bg: 'var(--bg)',
			})),
			tab: 'category',
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
		}
	},
});
</script>

<style lang="scss" module>
.root {
	max-width: 1000px;
	margin: 0 auto;
}
</style>
