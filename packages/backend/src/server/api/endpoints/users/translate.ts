/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { URLSearchParams } from 'node:url';
import fs from 'node:fs';
import { Inject, Injectable } from '@nestjs/common';
import { translate } from '@vitalets/google-translate-api';
import { TranslationServiceClient } from '@google-cloud/translate';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';
import { GetterService } from '@/server/api/GetterService.js';
import { createTemp } from '@/misc/create-temp.js';
import { RoleService } from '@/core/RoleService.js';
import { MiMeta } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['users'],

	requireCredential: true,
	kind: 'read:account',

	res: {
		type: 'object',
		optional: true, nullable: false,
		properties: {
			sourceLang: { type: 'string' },
			text: { type: 'string' },
		},
	},

	errors: {
		unavailable: {
			message: 'Translate of description unavailable.',
			code: 'UNAVAILABLE',
			id: '50a70314-2d8a-431b-b433-efa5cc56444c',
		},
		noSuchDescription: {
			message: 'No such description.',
			code: 'NO_SUCH_DESCRIPTION',
			id: 'bea9b03f-36e0-49c5-a4db-627a029f8971',
		},
		noTranslateService: {
			message: 'Translate service is not available.',
			code: 'NO_TRANSLATE_SERVICE',
			id: 'bef6e895-c05d-4499-9815-035ed18b0e31',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
		targetLang: { type: 'string' },
	},
	required: ['userId', 'targetLang'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.meta)
		private serverSettings: MiMeta,

		private getterService: GetterService,
		private httpRequestService: HttpRequestService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const policies = await this.roleService.getUserPolicies(me.id);
			if (!policies.canUseTranslator) {
				throw new ApiError(meta.errors.unavailable);
			}

			const target = await this.getterService.getUserProfiles(ps.userId).catch(err => {
				if (err.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new ApiError(meta.errors.noSuchDescription);
				throw err;
			});

			if (target.description == null) {
				return;
			}

			const translatorServices = [
				'deepl',
				'google_no_api',
				'ctav3',
				'Libretranslate',
			];

			if (this.serverSettings.translatorType == null || !translatorServices.includes(this.serverSettings.translatorType)) {
				return Promise.resolve(204); // Promise.resolveで204をラップする
			}

			let targetLang = ps.targetLang;
			if (targetLang.includes('-')) targetLang = targetLang.split('-')[0];

			let translationResult;
			if (this.serverSettings.translatorType === 'deepl') {
				if (this.serverSettings.deeplAuthKey == null) {
					throw new ApiError(meta.errors.unavailable);
				}
				translationResult = await this.translateDeepL(target.description, targetLang, this.serverSettings.deeplAuthKey, this.serverSettings.deeplIsPro, this.serverSettings.translatorType);
			} else if (this.serverSettings.translatorType === 'google_no_api') {
				let targetLang = ps.targetLang;
				if (targetLang.includes('-')) targetLang = targetLang.split('-')[0];

				const { text, raw } = await translate(target.description, { to: targetLang });

				return {
					sourceLang: raw.src,
					text: text,
					translator: this.serverSettings.translatorType, // 修正点: 配列ではなく単一の文字列
				};
			} else if (this.serverSettings.translatorType === 'ctav3') {
				if (this.serverSettings.ctav3SaKey == null) return Promise.resolve(204);
				else if (this.serverSettings.ctav3ProjectId == null) return Promise.resolve(204);
				else if (this.serverSettings.ctav3Location == null) return Promise.resolve(204);
				translationResult = await this.apiCloudTranslationAdvanced(target.description, targetLang, this.serverSettings.ctav3SaKey, this.serverSettings.ctav3ProjectId, this.serverSettings.ctav3Location, this.serverSettings.ctav3Model, this.serverSettings.ctav3Glossary, this.serverSettings.translatorType);
			} else if (this.serverSettings.translatorType === 'Libretranslate') {
				const endPoint = this.serverSettings.libreTranslateEndPoint;
				if (endPoint === null) throw new Error('libreTranslateEndPoint is null');
				translationResult = await this.translateLibretranslate(target.description, targetLang, endPoint, this.serverSettings.libreTranslateApiKey);
			} else {
				throw new Error('Unsupported translator type');
			}

			return Promise.resolve({
				sourceLang: translationResult.sourceLang || '',
				text: translationResult.text || '',
				translator: translationResult.translator || [],
			});
		});
	}

	private async translateDeepL(text: string, targetLang: string, authKey: string, isPro: boolean, provider: string) {
		const params = new URLSearchParams();
		params.append('auth_key', authKey);
		params.append('text', text);
		params.append('target_lang', targetLang);

		const endpoint = isPro ? 'https://api.deepl.com/v2/translate' : 'https://api-free.deepl.com/v2/translate';

		const res = await this.httpRequestService.send(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json, */*',
			},
			body: params.toString(),
		});

		const json = (await res.json()) as {
			translations: {
				detected_source_language: string;
				text: string;
			}[];
		};

		return {
			sourceLang: json.translations[0].detected_source_language,
			text: json.translations[0].text,
			translator: provider,
		};
	}

	private async apiCloudTranslationAdvanced(text: string, targetLang: string, saKey: string, projectId: string, location: string, model: string | null, glossary: string | null, provider: string) {
		const [path, cleanup] = await createTemp();
		fs.writeFileSync(path, saKey);

		const translationClient = new TranslationServiceClient({ keyFilename: path });

		const detectRequest = {
			parent: `projects/${projectId}/locations/${location}`,
			content: text,
		};

		let detectedLanguage = null;
		let glossaryConfig = null;
		if (glossary !== '' && glossary !== null) {
			glossaryConfig = {
				glossary: `projects/${projectId}/locations/${location}/glossaries/${glossary}`,
			};
			const [detectResponse] = await translationClient.detectLanguage(detectRequest);
			detectedLanguage = detectResponse.languages && detectResponse.languages[0]?.languageCode;
		}

		let modelConfig = null;
		if (model !== '' && model !== null) {
			modelConfig = `projects/${projectId}/locations/${location}/models/${model}`;
		}

		const translateRequest = {
			parent: `projects/${projectId}/locations/${location}`,
			contents: [text],
			mimeType: 'text/plain',
			sourceLanguageCode: null,
			targetLanguageCode: detectedLanguage !== null ? detectedLanguage : targetLang,
			model: modelConfig,
			glossaryConfig: glossaryConfig,
		};
		const [translateResponse] = await translationClient.translateText(translateRequest);
		const translatedText = translateResponse.translations && translateResponse.translations[0]?.translatedText;
		const detectedLanguageCode = translateResponse.translations && translateResponse.translations[0]?.detectedLanguageCode;

		cleanup();

		return {
			sourceLang: detectedLanguage !== null ? detectedLanguage : detectedLanguageCode,
			text: translatedText,
			translator: provider,
		};
	}

	private async translateLibretranslate(text: string, targetLang: string, endpoint: string, apiKey:string | null ) {
		const res = await this.httpRequestService.send(endpoint + '/translate', {
			method: 'POST',
			body: JSON.stringify({
				q: text,
				source: 'auto',
				format: 'text',
				target: targetLang.split('-')[0],
				...(apiKey ? { api_key: apiKey } : { }),
			}),
			headers: { 'Content-Type': 'application/json' },
		});

		const json = (await res.json()) as {
			translatedText: string,
			detectedLanguage: {
				confidence: number,
				language: string,
			}
			error: string,
		};

		return {
			sourceLang: json.detectedLanguage.language,
			text: json.translatedText,
			translator: 'Libretranslate',
		};
	}
}
