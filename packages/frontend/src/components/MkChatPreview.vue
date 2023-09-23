<!--
SPDX-FileCopyrightText: syuilo and noridev and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkA
	v-anim="i"
	class="_panel"
	:class="[$style.message, { [$style.isRead]: (isMe(message) || (message.groupId ? message.reads.includes($i.id) : message.isRead)) }]"
	:to="message.groupId ? `/my/messaging/group/${ message.groupId }` : `/my/messaging/@${Misskey.acct.toString(isMe(message) ? message.recipient : message.user)}`"
	:data-index="i"
>
	<div>
		<span v-if="!(isMe(message) || (message.groupId ? message.reads.includes($i.id) : message.isRead))" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
		<MkAvatar :class="$style.avatar" :user="message.groupId ? message.user : isMe(message) ? message.recipient : message.user" indicator link preview/>
		<header v-if="message.groupId">
			<span :class="$style.name">{{ message.group.name }}</span>
			<MkTime :time="message.createdAt" :class="$style.time"/>
		</header>
		<header v-else>
			<span :class="$style.name"><MkUserName :user="isMe(message) ? message.recipient : message.user"/></span>
			<span :class="$style.username">@{{ Misskey.acct.toString(isMe(message) ? message.recipient : message.user) }}</span>
			<MkTime :time="message.createdAt" :class="$style.time"/>
		</header>
		<div>
			<p :class="$style.text"><span v-if="isMe(message)" :class="$style.me">{{ i18n.ts.you }}: </span>{{ message.text }}</p>
		</div>
	</div>
</MkA>
</template>

<script lang="ts" setup>
import * as Misskey from 'cherrypick-js';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
  message: Record<string, any>;
}>();

function isMe(message) {
	return message.userId === $i.id;
}
</script>

<style lang="scss" module>
.message {
  display: block;
  text-decoration: none !important;
  margin-bottom: var(--margin);

  * {
    pointer-events: none;
    user-select: none;
  }

  &:hover {
    .avatar {
      filter: saturate(200%);
    }
  }

  &:after {
    content: "";
    display: block;
    clear: both;
  }

  > div {
    padding: 25px 30px;

    &:after {
      content: "";
      display: block;
      clear: both;
    }

    > header {
      display: flex;
      align-items: center;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  &.isRead {
    background: var(--chatReadBg);
  }
}

.indicator {
  position: absolute;
  top: 41px;
  left: 12px;
  color: var(--indicator);
  font-size: 9px;
}

.name {
  margin: 0;
  padding: 0;
  font-weight: bold;
  transition: all 0.1s ease;
}

.username {
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  margin: 0 0 0 auto;
  font-size: .85em;
}

.avatar {
  float: left;
  width: 42px;
  height: 42px;
  margin: 0 16px 0 0;
  border-radius: 8px;
  transition: all 0.1s ease;
}

.text {
  display: block;
  margin: 0 0 0 0;
  padding: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  line-height: 1.35;
  max-height: 4.05em;
  color: var(--faceText);
}

.me {
  opacity: 0.7;
}

.image {
  display: block;
  max-width: 100%;
  max-height: 512px;
}

@container (max-width: 500px) {
  .message {
    > div {
      padding: 20px 30px;
      font-size: .9em;
    }
  }

  .indicator {
    top: 36px;
    left: 12px;
  }

  .avatar {
    margin: 0 12px 0 0;
  }
}
</style>
