<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<FormSuspense :p="init">
			<FormSection first>
				<template #label>Translation</template>
				<div class="_gaps_m">
					<!--
					<template #label>DeepL Translation</template>

					<div class="_gaps_m">
						<MkInput v-model="deeplAuthKey">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>DeepL Auth Key</template>
						</MkInput>
						<MkSwitch v-model="deeplIsPro">
							<template #label>Pro account</template>
						</MkSwitch>
					</div>
					-->

					<MkRadios v-model="provider">
						<template #label>Translator type</template>
						<option :value="null">{{ i18n.ts.none }}</option>
						<option value="deepl">DeepL</option>
						<option value="google_no_api">Google Translate(without API)</option>
						<option value="ctav3">Cloud Translation - Advanced(v3)</option>
					</MkRadios>

					<template v-if="provider === 'deepl'">
						<div class="_gaps_m">
							<MkInput v-model="deeplAuthKey">
								<template #prefix><i class="ti ti-key"></i></template>
								<template #label>DeepL Auth Key</template>
							</MkInput>
							<MkSwitch v-model="deeplIsPro">
								<template #label>Pro account</template>
							</MkSwitch>
						</div>
					</template>
					<template v-else-if="provider === 'ctav3'">
						<MkInput v-model="ctav3SaKey" type="password">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>Service account key(json)</template>
						</MkInput>
						<MkInput v-model="ctav3ProjectId">
							<template #label>Project ID</template>
						</MkInput>
						<MkInput v-model="ctav3Location">
							<template #label>Location</template>
						</MkInput>
						<MkInput v-model="ctav3Model">
							<template #label>Model ID</template>
						</MkInput>
						<MkInput v-model="ctav3Glossary">
							<template #label>Glossary ID</template>
						</MkInput>
					</template>
				</div>
			</FormSection>
		</FormSuspense>
	</MkSpacer>
	<template #footer>
		<div :class="$style.footer">
			<MkSpacer :contentMax="700" :marginMin="16" :marginMax="16">
				<MkButton primary rounded @click="save"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
			</MkSpacer>
		</div>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import XHeader from './_header_.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormSection from '@/components/form/section.vue';
import * as os from '@/os.js';
import { fetchInstance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

const provider = ref<string | null>(null);
const deeplAuthKey = ref<string>('');
const deeplIsPro = ref<boolean>(false);
const ctav3SaKey = ref<string>('');
const ctav3ProjectId = ref<string>('');
const ctav3Location = ref<string>('');
const ctav3Model = ref<string>('');
const ctav3Glossary = ref<string>('');

async function init() {
	const meta = await os.api('admin/meta');
	provider.value = meta.translatorType;
	deeplAuthKey.value = meta.deeplAuthKey;
	deeplIsPro.value = meta.deeplIsPro;
	ctav3SaKey.value = meta.ctav3SaKey;
	ctav3ProjectId.value = meta.ctav3ProjectId;
	ctav3Location.value = meta.ctav3Location;
	ctav3Model.value = meta.ctav3Model;
	ctav3Glossary.value = meta.ctav3Glossary;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		translatorType: provider.value,
		deeplAuthKey: deeplAuthKey.value,
		deeplIsPro: deeplIsPro.value,
		ctav3SaKey: ctav3SaKey.value,
		ctav3ProjectId: ctav3ProjectId.value,
		ctav3Location: ctav3Location.value,
		ctav3Model: ctav3Model.value,
		ctav3Glossary: ctav3Glossary.value,
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.externalServices,
	icon: 'ti ti-link',
});
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
}
</style>
