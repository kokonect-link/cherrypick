<script lang="ts">
import { defineComponent, h, resolveDirective, withDirectives } from 'vue';

export default defineComponent({
	props: {
		value: {
			required: true,
		},
	},
	render() {
		const options = this.$slots.default();

		return withDirectives(h('div', {
			class: 'pxhvhrfw',
		}, options.map(option => withDirectives(h('button', {
			class: ['_button', { active: this.value === option.props.value }],
			key: option.key,
			disabled: this.value === option.props.value,
			onClick: () => {
				this.$emit('update:value', option.props.value);
			}
		}, option.children), [
			[resolveDirective('click-anime')]
		]))), [
			[resolveDirective('size'), { max: [500] }]
		]);
	}
});
</script>

<style lang="scss">
.pxhvhrfw {
	display: flex;
	font-size: 90%;

	> button {
		flex: 1;
		padding: 8px 16px;
		border-bottom: solid 3px transparent;

		&:disabled {
			opacity: 1 !important;
			cursor: default;
		}

		&.active {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}

		&:not(.active):hover {
			color: var(--fgHighlighted);
		}

		> .icon {
			margin-right: 6px;
		}
	}

	&.max-width_500px {
		font-size: 80%;
	}
}
</style>
