<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<div class="_gaps_m">
			<MkFolder :defaultOpen="false">
				<template #icon><i class="ti ti-cloud"></i></template>
				<template #label>{{ i18n.ts.objectStorage }}</template>
				<template v-if="objectStorageForm.savedState.useObjectStorage" #suffix>Enabled</template>
				<template v-else #suffix>Disabled</template>
				<template v-if="objectStorageForm.modified.value" #footer>
					<MkFormFooter :form="objectStorageForm"/>
				</template>

				<div class="_gaps">
					<MkSwitch v-model="objectStorageForm.state.useObjectStorage">
						<template #label>{{ i18n.ts.useObjectStorage }}<span v-if="objectStorageForm.modifiedStates.useObjectStorage" class="_modified">{{ i18n.ts.modified }}</span></template>
					</MkSwitch>

					<template v-if="objectStorageForm.state.useObjectStorage">
						<MkInput v-model="objectStorageForm.state.objectStorageBaseUrl" :placeholder="'https://example.com'" type="url">
							<template #label>{{ i18n.ts.objectStorageBaseUrl }}</template>
							<template #caption>{{ i18n.ts.objectStorageBaseUrlDesc }}</template>
						</MkInput>

						<MkInput v-model="objectStorageForm.state.objectStorageBucket">
							<template #label>{{ i18n.ts.objectStorageBucket }}</template>
							<template #caption>{{ i18n.ts.objectStorageBucketDesc }}</template>
						</MkInput>

						<MkInput v-model="objectStorageForm.state.objectStoragePrefix">
							<template #label>{{ i18n.ts.objectStoragePrefix }}</template>
							<template #caption>{{ i18n.ts.objectStoragePrefixDesc }}</template>
						</MkInput>

						<MkInput v-model="objectStorageForm.state.objectStorageEndpoint" :placeholder="'example.com'">
							<template #label>{{ i18n.ts.objectStorageEndpoint }}</template>
							<template #prefix>https://</template>
							<template #caption>{{ i18n.ts.objectStorageEndpointDesc }}</template>
						</MkInput>

						<MkInput v-model="objectStorageForm.state.objectStorageRegion">
							<template #label>{{ i18n.ts.objectStorageRegion }}</template>
							<template #caption>{{ i18n.ts.objectStorageRegionDesc }}</template>
						</MkInput>

						<FormSplit :minWidth="280">
							<MkInput v-model="objectStorageForm.state.objectStorageAccessKey">
								<template #prefix><i class="ti ti-key"></i></template>
								<template #label>Access key<span v-if="objectStorageForm.modifiedStates.objectStorageAccessKey" class="_modified">{{ i18n.ts.modified }}</span></template>
							</MkInput>

							<MkInput v-model="objectStorageForm.state.objectStorageSecretKey" type="password">
								<template #prefix><i class="ti ti-key"></i></template>
								<template #label>Secret key<span v-if="objectStorageForm.modifiedStates.objectStorageSecretKey" class="_modified">{{ i18n.ts.modified }}</span></template>
							</MkInput>
						</FormSplit>

						<MkSwitch v-model="objectStorageForm.state.objectStorageUseSSL">
							<template #label>{{ i18n.ts.objectStorageUseSSL }}<span v-if="objectStorageForm.modifiedStates.objectStorageUseSSL" class="_modified">{{ i18n.ts.modified }}</span></template>
							<template #caption>{{ i18n.ts.objectStorageUseSSLDesc }}</template>
						</MkSwitch>

						<MkSwitch v-model="objectStorageForm.state.objectStorageUseProxy">
							<template #label>{{ i18n.ts.objectStorageUseProxy }}<span v-if="objectStorageForm.modifiedStates.objectStorageUseProxy" class="_modified">{{ i18n.ts.modified }}</span></template>
							<template #caption>{{ i18n.ts.objectStorageUseProxyDesc }}</template>
						</MkSwitch>

						<MkSwitch v-model="objectStorageForm.state.objectStorageSetPublicRead">
							<template #label>{{ i18n.ts.objectStorageSetPublicRead }}<span v-if="objectStorageForm.modifiedStates.objectStorageSetPublicRead" class="_modified">{{ i18n.ts.modified }}</span></template>
						</MkSwitch>

						<MkSwitch v-model="objectStorageForm.state.objectStorageS3ForcePathStyle">
							<template #label>s3ForcePathStyle<span v-if="objectStorageForm.modifiedStates.objectStorageS3ForcePathStyle" class="_modified">{{ i18n.ts.modified }}</span></template>
							<template #caption>{{ i18n.ts.s3ForcePathStyleDesc }}</template>
						</MkSwitch>
					</template>
				</div>
			</MkFolder>

			<MkFolder :defaultOpen="false">
				<template #icon><i class="ti ti-cloud"></i></template>
				<template #label>{{ i18n.ts.objectStorage }} ({{ i18n.ts.remote }})</template>
				<template v-if="remoteObjectStorageForm.savedState.useRemoteObjectStorage" #suffix>Enabled</template>
				<template v-else #suffix>Disabled</template>
				<template v-if="remoteObjectStorageForm.modified.value" #footer>
					<MkFormFooter :form="remoteObjectStorageForm"/>
				</template>

				<div class="_gaps">
					<MkSwitch v-model="remoteObjectStorageForm.state.useRemoteObjectStorage">
						<template #label>{{ i18n.ts.useObjectStorage }} ({{ i18n.ts.remote }})<span v-if="remoteObjectStorageForm.modifiedStates.useRemoteObjectStorage" class="_modified">{{ i18n.ts.modified }}</span></template>
						<template #caption>{{ i18n.ts.objectStorageRemoteEnableDesc }}</template>
					</MkSwitch>

					<template v-if="remoteObjectStorageForm.state.useRemoteObjectStorage">
						<MkInput v-model="remoteObjectStorageForm.state.remoteObjectStorageBaseUrl" :placeholder="'https://example.com'" type="url">
							<template #label>{{ i18n.ts.objectStorageBaseUrl }}</template>
							<template #caption>{{ i18n.ts.objectStorageBaseUrlDesc }}</template>
						</MkInput>

						<MkInput v-model="remoteObjectStorageForm.state.remoteObjectStorageBucket">
							<template #label>{{ i18n.ts.objectStorageBucket }}</template>
							<template #caption>{{ i18n.ts.objectStorageBucketDesc }}</template>
						</MkInput>

						<MkInput v-model="remoteObjectStorageForm.state.remoteObjectStoragePrefix">
							<template #label>{{ i18n.ts.objectStoragePrefix }}</template>
							<template #caption>{{ i18n.ts.objectStoragePrefixDesc }}</template>
						</MkInput>

						<MkInput v-model="remoteObjectStorageForm.state.remoteObjectStorageEndpoint" :placeholder="'example.com'">
							<template #label>{{ i18n.ts.objectStorageEndpoint }}</template>
							<template #prefix>https://</template>
							<template #caption>{{ i18n.ts.objectStorageEndpointDesc }}</template>
						</MkInput>

						<MkInput v-model="remoteObjectStorageForm.state.remoteObjectStorageRegion">
							<template #label>{{ i18n.ts.objectStorageRegion }}</template>
							<template #caption>{{ i18n.ts.objectStorageRegionDesc }}</template>
						</MkInput>

						<FormSplit :minWidth="280">
							<MkInput v-model="remoteObjectStorageForm.state.remoteObjectStorageAccessKey">
								<template #prefix><i class="ti ti-key"></i></template>
								<template #label>Access key<span v-if="remoteObjectStorageForm.modifiedStates.remoteObjectStorageAccessKey" class="_modified">{{ i18n.ts.modified }}</span></template>
							</MkInput>

							<MkInput v-model="remoteObjectStorageForm.state.remoteObjectStorageSecretKey" type="password">
								<template #prefix><i class="ti ti-key"></i></template>
								<template #label>Secret key<span v-if="remoteObjectStorageForm.modifiedStates.remoteObjectStorageSecretKey" class="_modified">{{ i18n.ts.modified }}</span></template>
							</MkInput>
						</FormSplit>

						<MkSwitch v-model="remoteObjectStorageForm.state.remoteObjectStorageUseSSL">
							<template #label>{{ i18n.ts.objectStorageUseSSL }}<span v-if="remoteObjectStorageForm.modifiedStates.remoteObjectStorageUseSSL" class="_modified">{{ i18n.ts.modified }}</span></template>
							<template #caption>{{ i18n.ts.objectStorageUseSSLDesc }}</template>
						</MkSwitch>

						<MkSwitch v-model="remoteObjectStorageForm.state.remoteObjectStorageUseProxy">
							<template #label>{{ i18n.ts.objectStorageUseProxy }}<span v-if="remoteObjectStorageForm.modifiedStates.remoteObjectStorageUseProxy" class="_modified">{{ i18n.ts.modified }}</span></template>
							<template #caption>{{ i18n.ts.objectStorageUseProxyDesc }}</template>
						</MkSwitch>

						<MkSwitch v-model="remoteObjectStorageForm.state.remoteObjectStorageSetPublicRead">
							<template #label>{{ i18n.ts.objectStorageSetPublicRead }}<span v-if="remoteObjectStorageForm.modifiedStates.remoteObjectStorageSetPublicRead" class="_modified">{{ i18n.ts.modified }}</span></template>
						</MkSwitch>

						<MkSwitch v-model="remoteObjectStorageForm.state.remoteObjectStorageS3ForcePathStyle">
							<template #label>s3ForcePathStyle<span v-if="remoteObjectStorageForm.modifiedStates.remoteObjectStorageS3ForcePathStyle" class="_modified">{{ i18n.ts.modified }}</span></template>
							<template #caption>{{ i18n.ts.s3ForcePathStyleDesc }}</template>
						</MkSwitch>
					</template>
				</div>
			</MkFolder>
		</div>
	</div>
	<template #footer>
		<div :class="$style.footer">
			<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 16px;">
				<MkButton primary rounded @click="save"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
			</div>
		</div>
	</template>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInput from '@/components/MkInput.vue';
import MkFormFooter from '@/components/MkFormFooter.vue';
import MkButton from '@/components/MkButton.vue';
import FormSplit from '@/components/form/split.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { fetchInstance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { useForm } from '@/use/use-form.js';

const meta = await misskeyApi('admin/meta');

const objectStorageForm = useForm({
	useObjectStorage: meta.useObjectStorage,
	objectStorageBaseUrl: meta.objectStorageBaseUrl,
	objectStorageBucket: meta.objectStorageBucket,
	objectStoragePrefix: meta.objectStoragePrefix,
	objectStorageEndpoint: meta.objectStorageEndpoint,
	objectStorageRegion: meta.objectStorageRegion,
	objectStorageAccessKey: meta.objectStorageAccessKey,
	objectStorageSecretKey: meta.objectStorageSecretKey,
	objectStorageUseSSL: meta.objectStorageUseSSL,
	objectStorageUseProxy: meta.objectStorageUseProxy,
	objectStorageSetPublicRead: meta.objectStorageSetPublicRead,
	objectStorageS3ForcePathStyle: meta.objectStorageS3ForcePathStyle,
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		useObjectStorage: state.useObjectStorage,
		objectStorageBaseUrl: state.objectStorageBaseUrl,
		objectStorageBucket: state.objectStorageBucket,
		objectStoragePrefix: state.objectStoragePrefix,
		objectStorageEndpoint: state.objectStorageEndpoint,
		objectStorageRegion: state.objectStorageRegion,
		objectStorageAccessKey: state.objectStorageAccessKey,
		objectStorageSecretKey: state.objectStorageSecretKey,
		objectStorageUseSSL: state.objectStorageUseSSL,
		objectStorageUseProxy: state.objectStorageUseProxy,
		objectStorageSetPublicRead: state.objectStorageSetPublicRead,
		objectStorageS3ForcePathStyle: state.objectStorageS3ForcePathStyle,
	});
	fetchInstance(true);
});

const remoteObjectStorageForm = useForm({
	useRemoteObjectStorage: meta.useRemoteObjectStorage,
	remoteObjectStorageBaseUrl: meta.remoteObjectStorageBaseUrl,
	remoteObjectStorageBucket: meta.remoteObjectStorageBucket,
	remoteObjectStoragePrefix: meta.remoteObjectStoragePrefix,
	remoteObjectStorageEndpoint: meta.remoteObjectStorageEndpoint,
	remoteObjectStorageRegion: meta.remoteObjectStorageRegion,
	remoteObjectStorageAccessKey: meta.remoteObjectStorageAccessKey,
	remoteObjectStorageSecretKey: meta.remoteObjectStorageSecretKey,
	remoteObjectStorageUseSSL: meta.remoteObjectStorageUseSSL,
	remoteObjectStorageUseProxy: meta.remoteObjectStorageUseProxy,
	remoteObjectStorageSetPublicRead: meta.remoteObjectStorageSetPublicRead,
	remoteObjectStorageS3ForcePathStyle: meta.remoteObjectStorageS3ForcePathStyle,
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		useRemoteObjectStorage: state.useRemoteObjectStorage,
		remoteObjectStorageBaseUrl: state.remoteObjectStorageBaseUrl,
		remoteObjectStorageBucket: state.remoteObjectStorageBucket,
		remoteObjectStoragePrefix: state.remoteObjectStoragePrefix,
		remoteObjectStorageEndpoint: state.remoteObjectStorageEndpoint,
		remoteObjectStorageRegion: state.remoteObjectStorageRegion,
		remoteObjectStorageAccessKey: state.remoteObjectStorageAccessKey,
		remoteObjectStorageSecretKey: state.remoteObjectStorageSecretKey,
		remoteObjectStorageUseSSL: state.remoteObjectStorageUseSSL,
		remoteObjectStorageUseProxy: state.remoteObjectStorageUseProxy,
		remoteObjectStorageSetPublicRead: state.remoteObjectStorageSetPublicRead,
		remoteObjectStorageS3ForcePathStyle: state.remoteObjectStorageS3ForcePathStyle,
	});
	fetchInstance(true);
});

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.objectStorage,
	icon: 'ti ti-cloud',
}));
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
}
</style>
