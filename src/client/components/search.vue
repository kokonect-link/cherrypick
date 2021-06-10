<template>
	<MkInput :value="value" type="search" @keydown="searchKeypress" @input="$emit('update:value', $event.target.value)">
		<span>{{ $ts.search }}</span>
		<template #prefix><i class="fas fa-search"/></template>
	</MkInput>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkInput from './ui/input.vue';

export default defineComponent({
	components: {
		MkInput,
	},
	props: {
		value: {
			default: '',
		}
	},
	emits: ['update:value', 'search'],
	data() {
		return {
		}
	},
	methods: {
		searchKeypress(e) {
			if (e.keyCode === 13) {
				this.$emit('search');
			}
		},
	},
});
</script>
