<template>
	<div>
		<MkTab v-model="tab" style="border-bottom: solid 1px var(--divider);">
			<option value="form">
				{{ $ts.emojiSuggestion }}
			</option>
			<option value="history">
				{{ $ts.history }}
			</option>
		</MkTab>
		<div class="remaining">
			<b v-text="$ts.suggestionRemaining"/>:
			<MkEllipsis v-if="remaining === undefined" />
			<span v-else v-text="remaining === null ? '∞' : remaining"/>
		</div>
		<FormBase v-if="tab === 'form'">
			<div v-if="file" class="_formItem preview">
				<img class="preview" :src="file.url" :alt="file.name"/>
			</div>
			<div v-else class="_formItem placeholder" />
			<FormButton primary @click="selectFile">{{ $ts.selectFile }}</FormButton>
			<MkInfo warn v-if="isWrongName">
				{{ $ts.suggestionEmojiWarnNameMalform }}
			</MkInfo>
			<MkInfo warn v-if="isWrongFileSize">
				{{ $ts.suggestionEmojiWarnFileSize }}
			</MkInfo>
			<MkInfo warn v-if="isWrongFileFormat">
				{{ $ts.suggestionEmojiWarnFileType }}
			</MkInfo>
			<template v-if="file">
				<FormInput v-model="name">
					<span>{{ $ts.name }}</span>
				</FormInput>
				<FormInput v-model="aliases">
					<span>{{ $ts.tags }}</span>
					<template #desc>{{ $ts.tagsDescription }}</template>
				</FormInput>
				<FormTextarea v-model="description" :use-autocomplete="true" :max="500">
					<span>{{ $ts.emojiSuggestionMessage }}</span>
					<template #desc>{{ $ts.emojiSuggestionMessageDescription }}</template>
				</FormTextarea>
				<FormButton primary :disabled="!canSend" @click="send">
					<i class="fas fa-paper-plane" fixed-width/>{{ $ts.sendSuggestion }}
				</FormButton>
			</template>
		</FormBase>
		<section v-if="tab === 'history'">
			<div class="_section _inputs filter">
				<MkSwitch v-model="includesPending"><i class="fas fa-clock" fixed-width/>{{ $ts.pending }}</MkSwitch>
				<MkSwitch v-model="includesRejected"><i class="fas fa-times-circle" fixed-width/>{{ $ts.rejected }}</MkSwitch>
				<MkSwitch v-model="includesAccepted"><i class="fas fa-check-circle" fixed-width/>{{ $ts.accepted }}</MkSwitch>
			</div>
			<div class="_section">
				<MkPagination :pagination="pagination" class="suggestions" ref="pagination">
					<template #empty><span>{{ $ts.noSuggestions }}</span></template>
					<template #default="{items}">
						<div class="item" v-for="item in items" :key="item.id">
							<img :src="item.file.url" class="img" :alt="item.name"/>
							<div class="body">
								<div class="name">
									<i :class="getIconOf(item.state)" :title="$t(item.state)" fixed-width/>
									{{ item.name }}
								</div>
								<div class="aliases" v-if="item.aliases.length > 0">
									<span class="alias" v-for="a in item.aliases" :key="a" v-text="a"/>
								</div>
								<Mfm class="description" :text="item.description"/>
								<div class="moderator-comment" v-if="item.moderatorComment">
									<h1 v-text="$ts.commentFromModerators"/>
									<Mfm class="description" :text="item.moderatorComment"/>
								</div>
							</div>
							<button class="delete" @click.stop="del(item.id)">
								<i class="fas fa-times"/>
							</button>
						</div>
					</template>
				</MkPagination>
			</div>
		</section>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkButton from '@client/components/ui/button.vue';
import MkInput from '@client/components/form/input.vue';
import MkTextarea from '@client/components/form/textarea.vue';
import MkSwitch from '@client/components/form/switch.vue';
import MkPagination from '@client/components/ui/pagination.vue';
import MkTab from '@client/components/tab.vue';
import MkInfo from '@client/components/ui/info.vue';
import FormBase from '@client/components/debobigego/base.vue';
import FormButton from '@client/components/debobigego/button.vue';
import FormInput from '@client/components/debobigego/input.vue';
import FormTextarea from '@client/components/debobigego/textarea.vue';
import { PackedDriveFile } from '@/models/repositories/drive-file';
import { selectFile } from '@client/scripts/select-file';
import { PackedEmojiRequest } from '@/models/repositories/emoji-request';
import * as os from '@client/os';
import * as symbols from "@client/symbols";

export default defineComponent({
	components: {
		MkButton,
		MkInput,
		MkTextarea,
		MkSwitch,
		MkPagination,
		MkTab,
		MkInfo,
		FormBase,
		FormButton,
		FormInput,
		FormTextarea,
	},
	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.emojiSuggestion,
				icon: 'fas fa-laugh'
			},
			name: '',
			aliases: '',
			description: '',
			includesPending: true,
			includesRejected: true,
			includesAccepted: true,
			remaining: undefined as (number | undefined),
			tab: 'form',
			file: null as PackedDriveFile | null,
			pagination: {
				endpoint: 'suggestions/emojis/list',
				limit: 10,
				params: () => ({
					proposerId: this.$i.id,
					includingStates: this.includingStates,
				})
			},
			autocomplete: null,
			selectedRequest: null as PackedEmojiRequest | null,
		}
	},
	computed: {
		includingStates() {
			const r = [] as string[];
			if (this.includesPending) r.push('pending');
			if (this.includesRejected) r.push('rejected');
			if (this.includesAccepted) r.push('accepted');
			return r;
		},
		canSend() {
			return this.file && this.name && this.description;
		},
		isWrongName() {
			return this.name && !(/^[a-z0-9_]+$/.test(this.name));
		},
		isWrongFileSize() {
			return this.file && Math.round(this.file.size / 1024) > 50;
		},
		isWrongFileFormat() {
			return this.file && this.file.type !== 'image/png' && this.file.type !== 'image/gif';
		},
	},
	watch: {
		includesPending() { this.$refs.pagination.reload(); },
		includesAccepted() { this.$refs.pagination.reload(); },
		includesRejected() { this.$refs.pagination.reload(); },
	},
	mounted() {
		this.updateRemaining();
	},
	methods: {
		getIconOf(state: string) {
			switch (state) {
				case 'pending': return 'fas fa-clock';
				case 'rejected': return 'fas fa-times-circle';
				case 'accepted': return 'fas fa-check-circle';
				default: return null;
			}
		},
		updateRemaining() {
			os.api('suggestions/emojis/remaining', {}).then(({limit}) => this.remaining = limit);
		},
		async selectFile(e: any) {
			this.file = await selectFile(e.currentTarget || e.target, null, false) as PackedDriveFile;
			// 画像じゃなければエラー
			if (!this.file.type.startsWith('image')) {
				this.file = null;
				os.dialog({
					type: 'error',
					text: this.$ts.theFileIsNotImage,
				});
			} else {
				this.name = this.file.name ? this.file.name.replace(/\.[^/.]+$/, "") : '';
			}
		},
		send() {
			if (!this.file) return;
			os.api('suggestions/emojis/create', {
				name: this.name,
				aliases: this.aliases.split(' ').filter(a => a),
				fileId: this.file.id,
				description: this.description
			}).then(() => {
				os.dialog({
					type: 'success',
					text: this.$ts.emojiSuggestionSent
				});
				this.name = this.aliases = this.description = '';
				this.file = null;
				this.updateRemaining();
			}).catch(e => {
				os.dialog({
					type: 'error',
					text: e.message
				});
			});
		},
		async del(id: string) {
			const { canceled } = await os.dialog({
				type: 'warning',
				showCancelButton: true,
				text: this.$ts.emojiSuggestionDeleteConfirm,
			});
			if (canceled) return;

			try {
				await os.api('suggestions/emojis/delete', { id });
				this.updateRemaining();
			} catch (e) {
				os.dialog({
					type: 'error',
					text: e.message
				});
			}
		}
	}
})
</script>

<style lang="scss" scoped>
.preview, .placeholder {
	display: block;
	margin: 0 auto;
	height: 64px;
}

.placeholder {
	width: 64px;
	border: 1px solid var(--divider);
}

.remaining {
	width: 100%;
	text-align: center;
	margin: 16px 0;
}

.suggestions {
	width: 100%;

	> .item {
		display: flex;
		align-items: flex-start;

		&.selected {
			background: var(--accent);
			box-shadow: 0 0 0 8px var(--accent);
			color: #fff;

			> .delete {
				color: #fff;
			}
		}

		> .img {
			width: 64px;
			height: 64px;
			object-fit: contain;
		}

		> .body {
			padding: 8px;

			> .name {
				display: block;
				font-weight: bold;
			}

			> .aliases {
				opacity: 0.5;

				> .alias {
					margin-right: 0.5em;
				}
			}

			.description {
				display: block;
				margin: 8px;
				padding: 6px 0 6px 12px;
				color: var(--fg);
				border-left: solid 3px var(--fg);
				opacity: 0.7;
			}

			> .moderator-comment {
				> h1 {
					font-size: 1em;
					margin: 0;
				}
			}
		}

		> .delete {
			margin-left: auto;
			border: none;
			background: transparent;
			color: var(--accent);
			cursor: pointer;
			height: 32px;
			width: 32px;
			outline: none;

			&:hover {
				background: rgba(0, 0, 0, 0.05);
			}

			&:active {
				background: rgba(0, 0, 0, 0.1);
			}
		}
	}
}
</style>
