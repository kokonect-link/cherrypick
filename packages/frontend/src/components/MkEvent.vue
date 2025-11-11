<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="note?.event" :class="$style.container">
	<div :class="$style.title">
		<i class="ti ti-calendar-event icon"></i>
		{{ note.event.title }}
	</div>

	<dl :class="$style.details">
		<dt :class="$style.key">{{ i18n.ts._event.startDateTime }}</dt>
		<dd :class="$style.value">
			<MkTime :time="note.event.start" mode="detail"/>
		</dd>

		<template v-if="note.event.end">
			<dt :class="$style.key">{{ i18n.ts._event.endDateTime }}</dt>
			<dd :class="$style.value">
				<MkTime :time="note.event.end" mode="detail"/>
			</dd>
		</template>

		<template v-if="eventMetadata && 'doorTime' in eventMetadata && eventMetadata.doorTime">
			<dt :class="$style.key">{{ i18n.ts._event.doorTime }}</dt>
			<dd :class="$style.value">{{ eventMetadata.doorTime }}</dd>
		</template>

		<template v-if="eventMetadata && 'location' in eventMetadata && eventMetadata.location">
			<dt :class="$style.key">{{ i18n.ts._event.location }}</dt>
			<dd :class="$style.value">{{ eventMetadata.location }}</dd>
		</template>

		<template v-if="eventMetadata && 'url' in eventMetadata && eventMetadata.url">
			<dt :class="$style.key">URL</dt>
			<dd :class="$style.value"><a :href="eventMetadata.url as string">{{ eventMetadata.url }}</a></dd>
		</template>

		<template v-if="eventMetadata && 'organizer' in eventMetadata && eventMetadata.organizer">
			<dt :class="$style.key">{{ i18n.ts._event.organizer }}</dt>
			<dd :class="$style.value">{{ (eventMetadata.organizer as { name?: string }).name }}</dd>
		</template>

		<template v-if="eventMetadata && 'audience' in eventMetadata && eventMetadata.audience">
			<dt :class="$style.key">{{ i18n.ts._event.audience }}</dt>
			<dd :class="$style.value">{{ (eventMetadata.audience as { name?: string }).name }}</dd>
		</template>

		<template v-if="eventMetadata && 'inLanguage' in eventMetadata && eventMetadata.inLanguage">
			<dt :class="$style.key">{{ i18n.ts._event.language }}</dt>
			<dd :class="$style.value">{{ eventMetadata.inLanguage }}</dd>
		</template>

		<template v-if="eventMetadata && 'typicalAgeRange' in eventMetadata && eventMetadata.typicalAgeRange">
			<dt :class="$style.key">{{ i18n.ts._event.ageRange }}</dt>
			<dd :class="$style.value">{{ eventMetadata.typicalAgeRange }}</dd>
		</template>

		<template v-if="eventMetadata && 'performer' in eventMetadata && eventMetadata.performer">
			<dt :class="$style.key">{{ i18n.ts._event.performers }}</dt>
			<dd :class="$style.value">{{ (eventMetadata.performer as string[]).join(', ') }}</dd>
		</template>

		<template v-if="eventMetadata && 'offers' in eventMetadata && (eventMetadata.offers as { url?: string })?.url">
			<dt :class="$style.key">{{ i18n.ts._event.ticketsUrl }}</dt>
			<dd :class="$style.value"><a :href="(eventMetadata.offers as { url: string }).url">{{ (eventMetadata.offers as { url: string }).url }}</a></dd>
		</template>

		<template v-if="eventMetadata && 'isAccessibleForFree' in eventMetadata && eventMetadata.isAccessibleForFree">
			<dt :class="$style.key">{{ i18n.ts._event.isFree }}</dt>
			<dd :class="$style.value">{{ i18n.ts.yes }}</dd>
		</template>

		<template v-if="eventMetadata && 'offers' in eventMetadata && (eventMetadata.offers as { price?: string })?.price">
			<dt :class="$style.key">{{ i18n.ts._event.price }}</dt>
			<dd :class="$style.value">{{ (eventMetadata.offers as { price: string }).price }}</dd>
		</template>

		<template v-if="eventMetadata && 'offers' in eventMetadata && ((eventMetadata.offers as { availabilityStarts?: string; availabilityEnds?: string })?.availabilityStarts || (eventMetadata.offers as { availabilityStarts?: string; availabilityEnds?: string })?.availabilityEnds)">
			<dt :class="$style.key">{{ i18n.ts._event.availability }}</dt>
			<dd :class="$style.value">
				{{ [
					((eventMetadata.offers as { availabilityStarts?: string }).availabilityStarts ? i18n.ts._event.from + ' ' + (eventMetadata.offers as { availabilityStarts: string }).availabilityStarts : ''),
					((eventMetadata.offers as { availabilityEnds?: string }).availabilityEnds ? i18n.ts._event.until + ' ' + (eventMetadata.offers as { availabilityEnds: string }).availabilityEnds : '')]
					.join(' ') }}
			</dd>
		</template>

		<template v-if="eventMetadata && 'keywords' in eventMetadata && eventMetadata.keywords">
			<dt :class="$style.key">{{ i18n.ts._event.keywords }}</dt>
			<dd :class="$style.value">{{ eventMetadata.keywords }}</dd>
		</template>
	</dl>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as Misskey from 'cherrypick-js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	note: Misskey.entities.Note | null;
}>();

const eventMetadata = computed(() => {
	return props.note?.event?.metadata as Record<string, unknown> | undefined;
});
</script>

<style lang="scss" module>
.container {
	background: var(--MI_THEME-bg);
	border-radius: var(--MI-radius);
	padding: 1rem;
	margin-bottom: 10px;
}

.title {
	font-size: 1.6rem;
	line-height: 1.25;
	font-weight: bold;
	padding-bottom: 1rem;
	border-bottom: .5px solid var(--MI_THEME-divider);
}

.details {
	display: grid;
	grid-template-columns: auto 1fr;
	grid-gap: 1rem;
	padding-top: 1rem;
	margin: 0;
}

.key {
	opacity: 0.75;
}

.value {
	margin: 0;
	opacity: 0.75;
}
</style>
