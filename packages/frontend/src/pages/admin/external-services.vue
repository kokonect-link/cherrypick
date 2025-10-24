<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<SearchMarker path="/admin/external-services" :label="i18n.ts.externalServices" :keywords="['external', 'services', 'thirdparty']" icon="ti ti-link">
			<div class="_gaps_m">
				<SearchMarker v-slot="slotProps">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #label><SearchLabel>Google Analytics</SearchLabel><span class="_beta" style="vertical-align: middle;">{{ i18n.ts.beta }}</span></template>

						<div class="_gaps_m">
							<SearchMarker>
								<MkInput v-model="googleAnalyticsMeasurementId">
									<template #prefix><i class="ti ti-key"></i></template>
									<template #label><SearchLabel>Measurement ID</SearchLabel></template>
								</MkInput>
							</SearchMarker>

							<MkButton primary @click="save_googleAnalytics">Save</MkButton>
						</div>
					</MkFolder>
				</SearchMarker>

				<SearchMarker v-slot="slotProps">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #label><SearchLabel>Translation</SearchLabel></template>
						<div class="_gaps_m">
							<!--
							<SearchMarker>
								<MkInput v-model="deeplAuthKey">
									<template #prefix><i class="ti ti-key"></i></template>
									<template #label><SearchLabel>Auth Key</SearchLabel></template>
								</MkInput>
							</SearchMarker>

							<SearchMarker>
								<MkSwitch v-model="deeplIsPro">
									<template #label><SearchLabel>Pro account</SearchLabel></template>
								</MkSwitch>
							</SearchMarker>

							<MkButton primary @click="save_deepl">Save</MkButton>
							-->

							<SearchMarker>
								<MkRadios v-model="provider">
									<template #label><SearchLabel>Translator type</SearchLabel></template>
									<option :value="null">{{ i18n.ts.none }}</option>
									<option value="deepl">DeepL</option>
									<option value="google_no_api">Google Translate(without API)</option>
									<option value="ctav3">Cloud Translation - Advanced(v3)</option>
									<option value="libretranslate">LibreTranslate</option>
								</MkRadios>
							</SearchMarker>

							<template v-if="provider === 'deepl'">
								<div class="_gaps_m">
									<SearchMarker>
										<MkInput v-model="deeplAuthKey">
											<template #prefix><i class="ti ti-key"></i></template>
											<template #label><SearchLabel>Auth Key</SearchLabel></template>
										</MkInput>
									</SearchMarker>

									<SearchMarker>
										<MkSwitch v-model="deeplIsPro">
											<template #label><SearchLabel>Pro account</SearchLabel></template>
										</MkSwitch>
									</SearchMarker>
								</div>
							</template>

							<template v-else-if="provider === 'ctav3'">
								<SearchMarker>
									<MkInput v-model="ctav3SaKey" type="password">
										<template #prefix><i class="ti ti-key"></i></template>
										<template #label><SearchLabel>Service account key(json)</SearchLabel></template>
									</MkInput>
								</SearchMarker>

								<SearchMarker>
									<MkInput v-model="ctav3ProjectId">
										<template #label><SearchLabel>Project ID</SearchLabel></template>
									</MkInput>
								</SearchMarker>

								<SearchMarker>
									<MkInput v-model="ctav3Location">
										<template #label><SearchLabel>Location</SearchLabel></template>
									</MkInput>
								</SearchMarker>

								<SearchMarker>
									<MkInput v-model="ctav3Model">
										<template #label><SearchLabel>Model ID</SearchLabel></template>
									</MkInput>
								</SearchMarker>

								<SearchMarker>
									<MkInput v-model="ctav3Glossary">
										<template #label><SearchLabel>Glossary ID</SearchLabel></template>
									</MkInput>
								</SearchMarker>
							</template>

							<template v-else-if="provider === 'libretranslate'">
								<div class="_gaps_m">
									<SearchMarker>
										<MkInput v-model="libreTranslateEndPoint">
											<template #prefix><i class="ti ti-server"></i></template>
											<template #label><SearchLabel>Api Endpoint</SearchLabel></template>
										</MkInput>
									</SearchMarker>

									<SearchMarker>
										<MkInput v-model="libreTranslateApiKey">
											<template #prefix><i class="ti ti-key"></i></template>
											<template #label><SearchLabel>Api Key</SearchLabel></template>
										</MkInput>
									</SearchMarker>
								</div>
							</template>

							<MkButton primary rounded @click="save_deepl"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
						</div>
					</MkFolder>
				</SearchMarker>
			</div>
		</SearchMarker>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { fetchInstance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import MkFolder from '@/components/MkFolder.vue';

const meta = await misskeyApi('admin/meta');

const provider = meta.translatorType;
const deeplAuthKey = ref(meta.deeplAuthKey ?? '');
const deeplIsPro = ref(meta.deeplIsPro);
const ctav3SaKey = ref(meta.ctav3SaKey ?? '');
const ctav3ProjectId = ref(meta.ctav3ProjectId ?? '');
const ctav3Location = ref(meta.ctav3Location ?? '');
const ctav3Model = ref(meta.ctav3Model ?? '');
const ctav3Glossary = ref(meta.ctav3Glossary ?? '');
const libreTranslateEndPoint = ref(meta.libreTranslateEndPoint ?? '');
const libreTranslateApiKey = ref(meta.libreTranslateApiKey ?? '');
const googleAnalyticsMeasurementId = ref(meta.googleAnalyticsMeasurementId ?? '');

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
