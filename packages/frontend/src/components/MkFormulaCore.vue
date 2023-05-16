<!-- eslint-disable vue/no-v-html -->
<template>
<div v-if="block" v-html="compiledFormula"></div>
<span v-else v-html="compiledFormula"></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import temml from '../../node_modules/temml/dist/temml.cjs';

export default defineComponent({
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
	computed: {
		compiledFormula(): any {
			return temml.renderToString(this.formula, {
				throwOnError: false,
			} as any);
		},
	},
});
</script>

<style>
@import "../../node_modules/temml/dist/Temml-Local.css";
</style>
