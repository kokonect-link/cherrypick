<template>
	<MkPagination :pagination="pagination" class="users" ref="list">
		<template #empty><span>{{ $ts.noUsers }}</span></template>
		<template #default="{items}">
			<XUser v-for="user in items" :user="user" :key="user.id" />
		</template>
	</MkPagination>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import XUser from './user.vue';
import MkPagination from './ui/pagination.vue';

export default defineComponent({
	components: {
		XUser,
		MkPagination,
	},

	props: {
		pagination: {
			required: true
		},
	},
});
</script>
