<template>
<div>
	<XDrive ref="drive" @cd="x => folder = x"/>
</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import XDrive from '@client/components/drive.vue';
import * as os from '@client/os';
import * as symbols from '@client/symbols';

export default defineComponent({
	components: {
		XDrive
	},

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: computed(() => this.folder ? this.folder.name : this.$ts.drive),
				icon: 'fas fa-cloud',
				action: {
					icon: 'fas fa-plus',
					handler: this.menu
				}
			},
			folder: null,
		};
	},

	methods: {
		menu(ev) {
			os.popupMenu(this.$refs.drive.getMenu(), ev.currentTarget || ev.target);
		}
	}
});
</script>
