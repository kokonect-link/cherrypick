<template>
	<section class="_section gts30kac">
		<div class="_content" style="text-align: center; margin-bottom: var(--margin)">
			<div v-if="error" class="_fullinfo error">
				<i class="fas fa-dizzy" />
				<p v-text="$ts.themeStoreError"/>
				<I18n :src="$ts.themeStoreError2" tag="p">
					<template #link>
						<MkLink url="https://assets.msky.cafe">Misskey Assets Store</MkLink>
					</template>
				</I18n>
			</div>
			<MkLoading v-else-if="list === null"/>
			<template v-else>
				<h1 style="text-align: center">CherryPick Theme Store</h1>
				<small>Powered by <MkLink url="https://assets.msky.cafe">Misskey Assets Store</MkLink></small>
				<div class="themes">
					<div v-for="item in list" class="theme _card" :key="item.id" :style="genStyleFrom(item.theme)">
						<div class="_content content">
							<div><b v-text="item.theme.name"></b></div>
							<div><small>{{item.theme.author}}</small></div>
							<div v-text="item.theme.desc"/>
							<div>
								<span style="color: var(--accent)">Accent</span>&nbsp;
								<span style="color: var(--hashtag)">#Hashtag</span>&nbsp;
								<span style="color: var(--link)">Link</span>&nbsp;
							</div>
							<div class="commands">
								<button class="_buttonPrimary button" style="margin-right: 8px" v-text="$ts.preview" @click="preview(item.theme)"/>
								<button class="_buttonPrimary button" v-text="$ts.install" @click="install(item.theme)"/>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
	</section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as JSON5 from 'json5';
import MkButton from '@client/components/ui/button.vue';
import { Theme as MiTheme, compile, lightTheme, darkTheme, applyTheme } from '@client/scripts/theme';
import MkLink from '@client/components/link.vue';
import { dialog } from '@client/os';
import { addTheme } from '@client/theme-store';
import * as symbols from '@client/symbols';

const endpoint = 'https://mias-api.msky.cafe/api/';

namespace MiAS {
	export type Theme = {
		id: number;
		theme: MiTheme;
	};

	export const list = async (): Promise<Theme[]> => {
		const res = await fetch(endpoint + 'themes/list');
		return (await res.json() as Record<string, any>[])
			.filter(t => t.version !== 11)
			.map(t => ({
				id: t.id,
				theme: JSON5.parse(t.theme),
			} as Theme));
	}
}

export default defineComponent({
	components: {
		MkButton,
		MkLink,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts._theme.explore,
				icon: 'fas fa-globe'
			},
			list: null as MiAS.Theme[] | null,
			error: null as null | Error,
		}
	},

	computed: {
	},

	async mounted() {
		this.$emit('info', this[symbols.PAGE_INFO]);
		this.fetch();
	},

	methods: {
		genStyleFrom(theme: MiTheme) {
			// Deep copy
			const _theme = JSON.parse(JSON.stringify(theme));

			const base = [lightTheme, darkTheme].find(x => x.id === theme.base);
			_theme.props = Object.assign({}, base.props, _theme.props);
			try {
				const compiled = compile(_theme);
				console.log(compiled);
				return Object.entries(compiled).map(([key, value]) => `--${key}: ${value};`).join('');
			} catch (err) {
				console.error(err);
				return null;
			}
		},

		preview(theme: MiTheme) {
			applyTheme(theme, false);
		},

		async install(theme: MiTheme) {
			await addTheme(theme);
			dialog({
				text: this.$t('_theme.installed', { name: theme.name }),
			});
		},

		reset() {
			applyTheme(JSON.parse(localStorage['theme']));
		},

		async fetch() {
			try {
				this.error = null;
				this.list = await MiAS.list();
			} catch (e) {
				console.error(e);
				this.error = e;
			}
		},
	}
});
</script>

<style lang="scss" scoped>
.gts30kac {
	.error {
		opacity: 0.7;

		i {
			font-size: 3rem;
		}
	}

	.themes {
		display: grid;
		margin-top: var(--margin);
		grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
		grid-gap: var(--margin);

		> .theme {
			color: var(--fg);
			background: var(--bg);

			> .content {
				> small {
					opacity: 0.7;
					font-style: oblique;
				}

				> .commands {
					margin-top: var(--margin);

					> .button {
						padding: 4px 8px;
						border-radius: var(--radius);
					}
				}
			}
		}
	}
}
</style>
