<template>
	<FormBase>
		<FormTextarea v-model:value="faces" :max="500">
			<span>{{ $ts.gachaFaces }}</span>
			<template #desc>{{ $ts.gachaSettingDescription }}</template>
		</FormTextarea>
		<FormTuple>
			<FormButton @click="reset()"><i class="fas fa-undo"/> {{ $ts.default }}</FormButton>
			<FormButton @click="save()" primary :disabled="!changed"><i class="fas fa-save"/> {{ $ts.save }}</FormButton>
		</FormTuple>
	</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormTextarea from '@client/components/form/textarea.vue';
import FormBase from '@client/components/form/base.vue';
import FormGroup from '@client/components/form/group.vue';
import FormTuple from '@client/components/form/tuple.vue';
import FormButton from '@client/components/form/button.vue';
import defaultFaces from '@client/scripts/default-faces';
import * as os from '@client/os';
import * as symbols from '@client/symbols';

export default defineComponent({
	components: {
		FormTextarea,
		FormBase,
		FormButton,
		FormGroup,
		FormTuple,
	},

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.gacha,
				icon: 'fas fa-fish'
			},
			faces: this.$store.state.faces.join('\n') as string,
			changed: false
		}
	},

	watch: {
		faces() {
			this.changed = true;
		}
	},

	mounted() {
		this.$emit('info', this[symbols.PAGE_INFO]);
	},

	methods: {
		save() {
			this.$store.set('faces', this.faces.trim().split('\n'));
			this.changed = false;
			os.dialog({
				type: 'success',
				iconOnly: true,
				autoClose: true
			});
		},
		reset() {
			this.faces = defaultFaces.join('\n');
			this.changed = true;
		},
	}
});
</script>
