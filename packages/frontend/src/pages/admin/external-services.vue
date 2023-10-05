<!--
SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<FormSuspense :p="init">
			<FormSection>
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
import { } from 'vue';
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

let provider: string | null = $ref(null);
let deeplAuthKey: string = $ref('');
let deeplIsPro: boolean = $ref(false);
let ctav3SaKey: string = $ref('');
let ctav3ProjectId: string = $ref('');
let ctav3Location: string = $ref('');
let ctav3Model: string = $ref('');
let ctav3Glossary: string = $ref('');

async function init() {
	const meta = await os.api('admin/meta');
	provider = meta.translatorType;
	deeplAuthKey = meta.deeplAuthKey;
	deeplIsPro = meta.deeplIsPro;
	ctav3SaKey = meta.ctav3SaKey;
	ctav3ProjectId = meta.ctav3ProjectId;
	ctav3Location = meta.ctav3Location;
	ctav3Model = meta.ctav3Model;
	ctav3Glossary = meta.ctav3Glossary;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		translatorType: provider,
		deeplAuthKey,
		deeplIsPro,
		ctav3SaKey,
		ctav3ProjectId,
		ctav3Location,
		ctav3Model,
		ctav3Glossary,
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

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
