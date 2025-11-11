<!--
SPDX-FileCopyrightText: noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<div :class="$style.label"><i class="ti ti-clock-hour-9"></i> {{ i18n.ts.scheduledNoteDelete }}</div>

	<div :class="$style.body">
		<section :class="$style.section">
			<div>
				<MkSelect v-model="expiration" :items="expirationDef" small>
					<template #label>{{ i18n.ts._scheduledNoteDelete.expiration }}</template>
				</MkSelect>

				<section v-if="expiration === 'at'">
					<MkInput v-model="atDate" small type="date" class="input">
						<template #label>{{ i18n.ts._scheduledNoteDelete.deadlineDate }}</template>
					</MkInput>

					<MkInput v-model="atTime" small type="time" class="input">
						<template #label>{{ i18n.ts._scheduledNoteDelete.deadlineTime }}</template>
					</MkInput>
				</section>

				<section v-else-if="expiration === 'after'">
					<MkInput v-model="after" small type="number" class="input">
						<template #label>{{ i18n.ts._scheduledNoteDelete.duration }}</template>
					</MkInput>

					<MkSelect v-model="unit" :items="unitDef" small></MkSelect>
				</section>
			</div>
		</section>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import MkInput from './MkInput.vue';
import MkSelect from './MkSelect.vue';
import type { MkSelectItem } from '@/components/MkSelect.vue';
import { formatDateTimeString } from '@/utility/format-time-string.js';
import { addTime } from '@/utility/time.js';
import { i18n } from '@/i18n.js';

export type DeleteScheduleEditorModelValue = {
	deleteAt: number | null;
	deleteAfter: number | null;
};

const props = defineProps<{
	modelValue: DeleteScheduleEditorModelValue;
}>();

const expirationDef = computed(() => {
	const items = [
		{ label: i18n.ts._scheduledNoteDelete.at, value: 'at' },
		{ label: i18n.ts._scheduledNoteDelete.after, value: 'after' },
	] satisfies MkSelectItem[];
	return items;
});

const unitDef = computed(() => {
	const items = [
		{ label: i18n.ts._time.second, value: 'second' },
		{ label: i18n.ts._time.minute, value: 'minute' },
		{ label: i18n.ts._time.hour, value: 'hour' },
		{ label: i18n.ts._time.day, value: 'day' },
	] satisfies MkSelectItem[];
	return items;
});

const emit = defineEmits<{
	(ev: 'update:modelValue', v: DeleteScheduleEditorModelValue): void;
}>();

const expiration = ref('at');
const atDate = ref(formatDateTimeString(addTime(new Date(), 1, 'day'), 'yyyy-MM-dd'));
const atTime = ref('00:00');
const after = ref(0);
const unit = ref('second');

if (props.modelValue.deleteAt) {
	expiration.value = 'at';
	const deleteAt = new Date(props.modelValue.deleteAt);
	atDate.value = formatDateTimeString(deleteAt, 'yyyy-MM-dd');
	atTime.value = formatDateTimeString(deleteAt, 'HH:mm');
} else if (typeof props.modelValue.deleteAfter === 'number') {
	expiration.value = 'after';
	after.value = props.modelValue.deleteAfter / 1000;
}

function get(): DeleteScheduleEditorModelValue {
	const calcAt = () => {
		return new Date(`${ atDate.value } ${ atTime.value }`).getTime();
	};

	const calcAfter = () => {
		let base = parseInt(after.value.toString());
		switch (unit.value) {
			// @ts-expect-error fallthrough
			case 'day': base *= 24;
			// @ts-expect-error fallthrough
			case 'hour': base *= 60;
			// @ts-expect-error fallthrough
			case 'minute': base *= 60;
			// eslint-disable-next-line no-fallthrough
			case 'second': return base *= 1000;
			default: return null;
		}
	};

	return {
		deleteAt: expiration.value === 'at' ? calcAt() : null,
		deleteAfter: expiration.value === 'after' ? calcAfter() : null,
	};
}

watch([
	expiration,
	atDate,
	atTime,
	after,
	unit,
], () => emit('update:modelValue', get()), {
	deep: true,
});

onMounted(() => {
	emit('update:modelValue', get());
});
</script>

<style lang="scss" module>
.root {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px 24px;
}

.label {
	font-size: 0.85em;
	padding: 0 0 8px 0;
	user-select: none;
	color: var(--MI_THEME-accent);
	display: flex;
	align-items: center;
	gap: 4px;
}

.body {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.section {
	> div {
		margin: 0 8px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 12px;

		&:last-child {
			flex: 1 0 auto;

			> div {
				flex-grow: 1;
			}

			> section {
				// MAGIC: Prevent div above from growing unless wrapped to its own line
				flex-grow: 9999;
				align-items: end;
				display: flex;
				gap: 4px;

				> .input {
					flex: 1 1 auto;
				}
			}
		}
	}
}
</style>
