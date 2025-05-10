<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<Transition :name="prefer.s.animation ? '_transition_zoom' : ''" appear>
	<div :class="[$style.root, { [$style.warn]: type === 'notFound', [$style.error]: type === 'error' }]" class="_gaps">
		<img v-if="type === 'empty' && instance.infoImageUrl" :src="instance.infoImageUrl" draggable="false" :class="$style.img"/>
		<MkSystemIcon v-else-if="type === 'empty'" type="info" :class="$style.icon"/>
		<img v-if="type === 'notFound' && instance.notFoundImageUrl" :src="instance.notFoundImageUrl" draggable="false" :class="$style.img"/>
		<MkSystemIcon v-else-if="type === 'notFound'" type="question" :class="$style.icon"/>
		<img v-if="type === 'error' && instance.serverErrorImageUrl" :src="instance.serverErrorImageUrl" draggable="false" :class="$style.img"/>
		<MkSystemIcon v-else-if="type === 'error'" type="error" :class="$style.icon"/>
		<img v-if="type === 'blocked' && instance.youBlockedImageUrl" :src="instance.youBlockedImageUrl" draggable="false" :class="$style.img"/>
		<MkSystemIcon v-else-if="type === 'blocked'" type="error" :class="$style.icon"/>

		<div v-if="type === 'blocked'" style="font-size: 1.4rem; font-weight: bold; padding-bottom: 4px;">{{ i18n.ts.youBlocked }}</div>
		<div style="opacity: 0.7;">{{ props.text ?? (type === 'empty' ? i18n.ts.nothing : type === 'notFound' ? i18n.ts.notFound : type === 'error' ? i18n.ts.somethingHappened : type === 'blocked' ? i18n.tsx.youBlockedDescription({ user: `@${ props.user ? props.user.username : null }` }) : null) }}</div>
		<slot></slot>
	</div>
</Transition>
</template>

<script lang="ts" setup>
import {} from 'vue';
import * as Misskey from 'cherrypick-js';
import { instance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences.js';

const props = defineProps<{
	type: 'empty' | 'notFound' | 'error' | 'blocked';
	text?: string;
	user?: Misskey.entities.UserDetailed | null;
}>();
</script>

<style lang="scss" module>
.root {
	position: relative;
	text-align: center;
	padding: 32px;
}

.img {
	vertical-align: bottom;
	height: 128px;
	margin-bottom: 16px;
	border-radius: 16px;
}

.icon {
	width: 65px;
	height: 65px;
	margin: 0 auto;
}
</style>
