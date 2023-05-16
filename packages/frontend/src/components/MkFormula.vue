<template>
<XFormula :formula="formula" :block="block"/>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';

export default defineComponent({
	components: {
		XFormula: defineAsyncComponent(() => import('@/components/MkFormulaCore.vue')),
	},
	props: {
		formula: {
			type: String,
			required: true,
		},
		block: {
			type: Boolean,
			required: true,
		},
	},
});
</script>
