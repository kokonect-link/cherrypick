<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<FormSuspense :p="init">
			<div class="_gaps_m">
				<MkFolder>
					<template #label>Google Analytics<span class="_beta" style="vertical-align: middle;">{{ i18n.ts.beta }}</span></template>

					<div class="_gaps_m">
						<MkInput v-model="googleAnalyticsMeasurementId">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>Measurement ID</template>
						</MkInput>
						<MkButton primary @click="save_googleAnalytics">Save</MkButton>
					</div>
				</MkFolder>

				<MkFolder>
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
							<MkButton primary @click="save_deepl">Save</MkButton>
						</div>
						-->

						<MkRadios v-model="provider">
							<template #label>Translator type</template>
							<option :value="null">{{ i18n.ts.none }}</option>
							<option value="deepl">DeepL</option>
							<option value="google_no_api">Google Translate(without API)</option>
							<option value="ctav3">Cloud Translation - Advanced(v3)</option>
							<option value="libretranslate">LibreTranslate</option>
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

						<template v-else-if="provider === 'libretranslate'">
							<div class="_gaps_m">
								<MkInput v-model="libreTranslateEndPoint">
									<template #prefix><i class="ti ti-server"></i></template>
									<template #label>Api Endpoint</template>
								</MkInput>
								<MkInput v-model="libreTranslateApiKey">
									<template #prefix><i class="ti ti-key"></i></template>
									<template #label>ApiKey</template>
								</MkInput>
							</div>
						</template>
						<MkButton primary rounded @click="save_deepl"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
					</div>
				</MkFolder>
			</div>
		</FormSuspense>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { fetchInstance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import MkFolder from '@/components/MkFolder.vue';

const provider = ref<string | null>(null);
const deeplAuthKey = ref<string>('');
const deeplIsPro = ref<boolean>(false);
const ctav3SaKey = ref<string>('');
const ctav3ProjectId = ref<string>('');
const ctav3Location = ref<string>('');
const ctav3Model = ref<string>('');
const ctav3Glossary = ref<string>('');
const libreTranslateEndPoint = ref<string>('');
const libreTranslateApiKey = ref<string>('');

const googleAnalyticsMeasurementId = ref<string>('');

async function init() {
	const meta = await misskeyApi('admin/meta');
	provider.value = meta.translatorType;
	deeplAuthKey.value = meta.deeplAuthKey ?? '';
	deeplIsPro.value = meta.deeplIsPro;
	ctav3SaKey.value = meta.ctav3SaKey ?? '';
	ctav3ProjectId.value = meta.ctav3ProjectId ?? '';
	ctav3Location.value = meta.ctav3Location ?? '';
	ctav3Model.value = meta.ctav3Model ?? '';
	ctav3Glossary.value = meta.ctav3Glossary ?? '';
	libreTranslateEndPoint.value = meta.libreTranslateEndPoint ?? '';
	libreTranslateApiKey.value = meta.libreTranslateApiKey ?? '';
	googleAnalyticsMeasurementId.value = meta.googleAnalyticsMeasurementId ?? '';
}

function save_deepl() {
	os.apiWithDialog('admin/update-meta', {
		translatorType: provider.value,
		deeplAuthKey: deeplAuthKey.value,
		deeplIsPro: deeplIsPro.value,
		ctav3SaKey: ctav3SaKey.value,
		ctav3ProjectId: ctav3ProjectId.value,
		ctav3Location: ctav3Location.value,
		ctav3Model: ctav3Model.value,
		ctav3Glossary: ctav3Glossary.value,
		libreTranslateEndPoint: libreTranslateEndPoint.value,
		libreTranslateApiKey: libreTranslateApiKey.value,
	}).then(() => {
		fetchInstance(true);
	});
}

function save_googleAnalytics() {
	os.apiWithDialog('admin/update-meta', {
		googleAnalyticsMeasurementId: googleAnalyticsMeasurementId.value,
	}).then(() => {
		fetchInstance(true);
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.externalServices,
	icon: 'ti ti-link',
}));
</script>
