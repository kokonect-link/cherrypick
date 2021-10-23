<template>
<div class="ogwlenmc">
	<MkHeader v-if="!isFriendlyUI && !isFriendlyUILegacy" :info="header"/>
	<!-- <MkHeaderCP v-else :info="header"/> -->

	<div class="local" v-if="tab === 'local'">
		<MkInput v-model="query" :debounce="true" type="search" style="margin: var(--margin);">
			<template #prefix><i class="fas fa-search"></i></template>
			<template #label>{{ $ts.search }}</template>
		</MkInput>
		<MkPagination :pagination="pagination" ref="emojis">
			<template #empty><span>{{ $ts.noCustomEmojis }}</span></template>
			<template #default="{items}">
				<div class="ldhfsamy">
					<button class="emoji _panel _button" v-for="emoji in items" :key="emoji.id" @click="edit(emoji)">
						<img :src="emoji.url" class="img" :alt="emoji.name"/>
						<div class="body">
							<div class="name _monospace">{{ emoji.name }}</div>
							<div class="info">{{ emoji.category }}</div>
						</div>
					</button>
				</div>
			</template>
		</MkPagination>
	</div>

	<div class="suggestions" v-else-if="tab === 'suggestion'">
		<MkSwitch v-model="pendingOnly">{{ $ts.pendingOnly }}</MkSwitch>
		<MkPagination :pagination="suggestionPagination" class="emojis" ref="suggestions">
			<template #empty><span>{{ $ts.noSuggestions }}</span></template>
			<template #default="{items}">
				<div class="emoji" v-for="req in items" :key="req.id">
					<img :src="req.file.url" class="img" :alt="req.name"/>
					<div class="body">
						<div>
							<span class="name">{{ req.name }}</span>
							<span class="alias" v-for="a in req.aliases" :key="a" v-text="a"/>
						</div>
						<div class="proposer">
							{{ $ts.proposer }}:
							<MkA :to="userPage(req.proposer)"><MkAcct :user="req.proposer"/></MkA>
						</div>
						<Mfm class="description" :text="req.description"/>
						<span class="state" v-if="req.state !== 'pending'">
								<i :class="req.state === 'accepted' ? 'fas fa-check' : 'fas fa-times'"/>
								{{ $t(req.state) }}
							</span>
						<MkButton inline primary v-if="req.state !== 'accepted'" @click="accept(req.id)">
							<i class="fas fa-check"/>
							{{ $ts.accept }}
						</MkButton>
						<MkButton inline v-if="req.state === 'pending'" @click="reject(req.id)">
							<i class="fas fa-times"/>
							{{ $ts.reject }}
						</MkButton>
					</div>
				</div>
			</template>
		</MkPagination>
	</div>

	<div class="remote" v-else-if="tab === 'remote'">
		<MkInput v-model="queryRemote" :debounce="true" type="search" style="margin: var(--margin);">
			<template #prefix><i class="fas fa-search"></i></template>
			<template #label>{{ $ts.search }}</template>
		</MkInput>
		<MkInput v-model="host" :debounce="true" style="margin: var(--margin);">
			<template #label>{{ $ts.host }}</template>
		</MkInput>
		<MkPagination :pagination="remotePagination" ref="remoteEmojis">
			<template #empty><span>{{ $ts.noCustomEmojis }}</span></template>
			<template #default="{items}">
				<div class="ldhfsamy">
					<div class="emoji _panel _button" v-for="emoji in items" :key="emoji.id" @click="remoteMenu(emoji, $event)">
						<img :src="emoji.url" class="img" :alt="emoji.name"/>
						<div class="body">
							<div class="name _monospace">{{ emoji.name }}</div>
							<div class="info">{{ emoji.host }}</div>
						</div>
					</div>
				</div>
			</template>
		</MkPagination>
	</div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import MkButton from '@client/components/ui/button.vue';
import MkInput from '@client/components/form/input.vue';
import MkSwitch from '@client/components/form/switch.vue';
import MkPagination from '@client/components/ui/pagination.vue';
import MkTab from '@client/components/tab.vue';
import { selectFile } from '@client/scripts/select-file';
import * as os from '@client/os';
import * as symbols from '@client/symbols';
import { userPage } from '@client/filters/user';

export default defineComponent({
	components: {
		MkTab,
		MkButton,
		MkInput,
		MkSwitch,
		MkPagination,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.customEmojis,
				icon: 'fas fa-laugh',
				bg: 'var(--bg)',
			},
			header: computed(() => ({
				title: this.$ts.customEmojis,
				icon: 'fas fa-laugh',
				bg: 'var(--bg)',
				actions: [{
					asFullButton: true,
					icon: 'fas fa-plus',
					text: this.$ts.addEmoji,
					handler: this.add,
				}],
				tabs: [{
					active: this.tab === 'local',
					title: this.$ts.local,
					onClick: () => { this.tab = 'local'; },
				}, {
					active: this.tab === 'suggestion',
					title: this.$ts.emojiSuggestion,
					onClick: () => { this.tab = 'suggestion'; },
				}, {
					active: this.tab === 'remote',
					title: this.$ts.remote,
					onClick: () => { this.tab = 'remote'; },
				},]
			})),
			tab: 'local',
			query: null,
			queryRemote: null,
			host: '',
			pagination: {
				endpoint: 'admin/emoji/list',
				limit: 30,
				params: computed(() => ({
					query: (this.query && this.query !== '') ? this.query : null
				}))
			},
			remotePagination: {
				endpoint: 'admin/emoji/list-remote',
				limit: 30,
				params: computed(() => ({
					query: (this.queryRemote && this.queryRemote !== '') ? this.queryRemote : null,
					host: (this.host && this.host !== '') ? this.host : null
				}))
			},
			pendingOnly: true,
			suggestionPagination: {
				endpoint: 'suggestions/emojis/list',
				limit: 10,
				params: computed(() => ({
					includingStates: this.pendingOnly ? [ 'pending' ] : [],
				}))
			},
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
		}
	},

	async mounted() {
		this.$emit('info', this[symbols.PAGE_INFO]);
	},

	methods: {
		async add(e) {
			const files = await selectFile(e.currentTarget || e.target, null, true);

			const promise = Promise.all(files.map(file => os.api('admin/emoji/add', {
				fileId: file.id,
			})));
			promise.then(() => {
				this.$refs.emojis.reload();
			});
			await os.promiseDialog(promise);
		},

		edit(emoji) {
			os.popup(import('./emoji-edit-dialog.vue'), {
				emoji: emoji
			}, {
				done: result => {
					if (result.updated) {
						this.$refs.emojis.replaceItem(item => item.id === emoji.id, {
							...emoji,
							...result.updated
						});
					} else if (result.deleted) {
						this.$refs.emojis.removeItem(item => item.id === emoji.id);
					}
				},
			}, 'closed');
		},

		im(emoji) {
			os.apiWithDialog('admin/emoji/copy', {
				emojiId: emoji.id,
			});
		},

		remoteMenu(emoji, ev) {
			os.popupMenu([{
				type: 'label',
				text: ':' + emoji.name + ':',
			}, {
				text: this.$ts.import,
				icon: 'fas fa-plus',
				action: () => { this.im(emoji) }
			}], ev.currentTarget || ev.target);
		},

		async accept(suggestionId: string) {
			await os.api('admin/suggestions/emojis/accept', { suggestionId });
			this.$refs.suggestions.reload();
		},

		async reject(suggestionId: string) {
			const { canceled, result: comment } = await os.dialog({
				title: this.$ts.writeRejectReason,
				input: true,
				autoComplete: true
			});

			if (canceled) return;

			await os.api('admin/suggestions/emojis/reject', { suggestionId, comment });
			this.$refs.suggestions.reload();
		},

		userPage,
	}
});
</script>

<style lang="scss" scoped>
.ogwlenmc {
	> .local {
		.ldhfsamy {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
			grid-gap: 12px;
			margin: var(--margin);
	
			> .emoji {
				display: flex;
				align-items: center;
				padding: 12px;
				text-align: left;

				&:hover {
					color: var(--accent);
				}

				> .img {
					width: 42px;
					height: 42px;
				}

				> .body {
					padding: 0 0 0 8px;
					white-space: nowrap;
					overflow: hidden;

					> .name {
						text-overflow: ellipsis;
						overflow: hidden;
					}

					> .info {
						opacity: 0.5;
						text-overflow: ellipsis;
						overflow: hidden;
					}
				}
			}
		}
	}

	> .suggestions {
		> .emojis {
			display: flex;
			flex-direction: column;

			> .emoji {
				display: flex;
				align-items: center;

				> .img {
					width: 50px;
					height: 50px;
				}

				> .body {
					padding: 8px;

					div {
						> .name {
							font-weight: bold;
						}

						> .alias {
							opacity: 0.5;
							margin: 0 0.25em;
						}
					}

					> .proposer {
						opacity: 0.5;
					}

					> .description {
						display: block;
						margin: 8px;
						padding: 6px 0 6px 12px;
						color: var(--fg);
						border-left: solid 3px var(--fg);
						opacity: 0.7;
					}

					> .state {
						opacity: 0.5;
					}
				}
			}
		}
	}

	> .remote {
		.ldhfsamy {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
			grid-gap: 12px;
			margin: var(--margin);

			> .emoji {
				display: flex;
				align-items: center;
				padding: 12px;
				text-align: left;

				&:hover {
					color: var(--accent);
				}

				> .img {
					width: 32px;
					height: 32px;
				}

				> .body {
					padding: 0 0 0 8px;
					white-space: nowrap;
					overflow: hidden;

					> .name {
						text-overflow: ellipsis;
						overflow: hidden;
					}

					> .info {
						opacity: 0.5;
						font-size: 90%;
						text-overflow: ellipsis;
						overflow: hidden;
					}
				}
			}
		}
	}
}
</style>
