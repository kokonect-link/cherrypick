<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="thvuemwp" :class="{ isMe }">
	<MkAvatar class="avatar" :user="message.user" indicator link preview/>
	<div class="content">
		<div class="balloon" :class="{ noText: message.text == null }">
			<button v-if="isMe" class="delete-button" :title="i18n.ts.delete" @click="del">
				<img src="/client-assets/remove.png" alt="Delete"/>
			</button>
			<div v-if="!message.isDeleted" class="content">
				<div v-if="message.text" class="text">
					<Mfm :text="message.text" :nyaize="false" :enableEmojiMenu="true" :enableEmojiMenuReaction="true"/>
				</div>
				<div v-if="message.file" class="file">
					<a :href="message.file.url" rel="noopener" target="_blank" :title="message.file.name">
						<img v-if="message.file.type.split('/')[0] == 'image'" :src="message.file.url" :alt="message.file.name"/>
						<p v-else>{{ message.file.name }}</p>
					</a>
				</div>
			</div>
			<div v-else class="content">
				<p class="is-deleted">{{ i18n.ts.deleted }}</p>
			</div>
		</div>
		<div></div>
		<MkUrlPreview v-for="url in urls" :key="url" :url="url" style="margin: 8px 0;"/>
		<footer>
			<MkTime :time="message.createdAt"/>
			<template v-if="isGroup">
				<span v-if="message.reads.length > 0" class="read">
					<span style="margin-right: 4px;">•</span>
					<I18n :src="i18n.ts.nUsersRead" textTag="span">
						<template #n>{{ message.reads.length }}</template>
					</I18n>
				</span>
			</template>
			<template v-else-if="isMe">
				<span v-if="!message.isRead" class="read"><span style="margin-right: 4px;">•</span>{{ i18n.ts.messageSend }}</span>
				<span v-else class="read"><span style="margin-right: 4px;">•</span>{{ i18n.ts.messageRead }}</span>
			</template>
			<template v-if="message.is_edited"><i class="ti ti-pencil"></i></template>
		</footer>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as mfm from 'cherrypick-mfm-js';
import * as Misskey from 'cherrypick-js';
import * as os from '@/os.js';
import MkUrlPreview from '@/components/MkUrlPreview.vue';
import MkAvatar from '@/components/global/MkAvatar.vue';
import MkTime from '@/components/global/MkTime.vue';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/account.js';
import { misskeyApi } from '@/scripts/misskey-api.js';

const props = defineProps<{
	message: Misskey.entities.MessagingMessage;
	isGroup?: boolean;
}>();

const isMe = computed(() => props.message.userId === $i?.id);
const urls = computed(() => props.message.text ? extractUrlFromMfm(mfm.parse(props.message.text)) : []);

function del(): void {
	misskeyApi('messaging/messages/delete', {
		messageId: props.message.id,
	});
}
</script>

<style lang="scss" scoped>
.thvuemwp {
	$me-balloon-color: var(--accent);

	position: relative;
	background-color: transparent;
	display: flex;

	> .avatar {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		display: block;
		width: 48px;
		height: 48px;
		transition: all 0.1s ease;
	}

	> .content {
		min-width: 0;

		> .balloon {
			position: relative;
			display: inline-flex;
			align-items: center;
			padding: 0;
			min-height: 38px;
			border-radius: 16px;
			max-width: 100%;

			&::before {
				content: "";
				pointer-events: none;
				display: block;
				position: absolute;
				top: 12px;
			}

			& + * {
				clear: both;
			}

			&:hover {
				> .delete-button {
					display: block;
				}
			}

			> .delete-button {
				display: none;
				position: absolute;
				z-index: 1;
				top: -4px;
				right: -4px;
				margin: 0;
				padding: 0;
				cursor: pointer;
				outline: none;
				border: none;
				border-radius: 0;
				box-shadow: none;
				background: transparent;

				> img {
					vertical-align: bottom;
					width: 16px;
					height: 16px;
					cursor: pointer;
				}
			}

			> .content {
				max-width: 100%;

				> .is-deleted {
					display: block;
					margin: 0;
					padding: 0;
					overflow: hidden;
					overflow-wrap: break-word;
					font-size: 1em;
					color: rgba(#000, 0.5);
				}

				> .text {
					display: block;
					margin: 0;
					padding: 8px 12px;
					overflow: hidden;
					overflow-wrap: break-word;
					word-break: break-word;
					font-size: 1em;
					color: rgba(#000, 0.8);

					& + .file {
						> a {
							border-radius: 0 0 16px 16px;
						}
					}
				}

				> .file {
					> a {
						display: block;
						max-width: 100%;
						border-radius: 16px;
						overflow: hidden;
						text-decoration: none;

						&:hover {
							text-decoration: none;

							> p {
								background: #ccc;
							}
						}

						> * {
							display: block;
							margin: 0;
							width: 100%;
							max-height: 512px;
							object-fit: contain;
							box-sizing: border-box;
						}

						> p {
							padding: 30px;
							text-align: center;
							color: #555;
							background: #ddd;
						}
					}
				}
			}
		}

		> footer {
			display: block;
			margin: 2px 0 0 0;
			font-size: 0.65em;

			> .read {
				margin: 0 4px;
			}

			> i {
				margin-left: 4px;
			}
		}
	}

	&:not(.isMe) {
		padding-left: var(--margin);

		> .content {
			padding-left: 16px;
			padding-right: 32px;

			> .balloon {
				$color: var(--messageBg);
				background: $color;

				&.noText {
					background: transparent;
				}

				&:not(.noText):before {
					left: -14px;
					border-top: solid 8px transparent;
					border-right: solid 8px $color;
					border-bottom: solid 8px transparent;
					border-left: solid 8px transparent;
				}

				> .content {
					> .text {
						color: var(--fg);
					}
				}
			}

			> footer {
				text-align: left;
			}
		}
	}

	&.isMe {
		flex-direction: row-reverse;
		padding-right: var(--margin);
		//right: var(--margin); // 削除時にposition: absoluteになったときに使う

		> .content {
			padding-right: 16px;
			padding-left: 32px;
			text-align: right;

			> .balloon {
				background: $me-balloon-color;
				text-align: left;

				::selection {
					color: var(--accent);
					background-color: #fff;
				}

				&.noText {
					background: transparent;
				}

				&:not(.noText):before {
					right: -14px;
					left: auto;
					border-top: solid 8px transparent;
					border-right: solid 8px transparent;
					border-bottom: solid 8px transparent;
					border-left: solid 8px $me-balloon-color;
				}

				> .content {
					> p.is-deleted {
						color: rgba(#fff, 0.5);
					}

					> .text {
						&, ::v-deep(*) {
							color: var(--fgOnAccent) !important;
						}
					}
				}
			}

			> footer {
				text-align: right;

				> .read {
					user-select: none;
				}
			}
		}
	}
}

@container (max-width: 500px) {
	.thvuemwp {
		> .content {
			> .balloon {
				> .content {
					> .text {
						font-size: 0.9em;
					}
				}
			}
		}

    &:not(.isMe) {
      padding-left: initial;
    }

    &.isMe {
      padding-right: initial;
    }
	}
}
</style>
