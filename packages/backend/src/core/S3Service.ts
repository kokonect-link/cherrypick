/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { URL } from 'node:url';
import * as http from 'node:http';
import * as https from 'node:https';
import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler, NodeHttpHandlerOptions } from '@smithy/node-http-handler';
import type { MiMeta } from '@/models/Meta.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';
import { bindThis } from '@/decorators.js';
import type { DeleteObjectCommandInput, PutObjectCommandInput } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
	constructor(
		private httpRequestService: HttpRequestService,
	) {}

	@bindThis
	public getS3Client(meta: MiMeta, isRemote = false): S3Client {
		const useRemoteObjectStorage = isRemote && meta.useRemoteObjectStorage;

		const objectStorageEndpoint = useRemoteObjectStorage
			? meta.remoteObjectStorageEndpoint
			: meta.objectStorageEndpoint;

		const objectStorageUseSSL = useRemoteObjectStorage
			? meta.remoteObjectStorageUseSSL
			: meta.objectStorageUseSSL;

		const objectStorageAccessKey = useRemoteObjectStorage
			? meta.remoteObjectStorageAccessKey
			: meta.objectStorageAccessKey;

		const objectStorageSecretKey = useRemoteObjectStorage
			? meta.remoteObjectStorageSecretKey
			: meta.objectStorageSecretKey;

		const objectStorageRegion = useRemoteObjectStorage
			? meta.remoteObjectStorageRegion
			: meta.objectStorageRegion;

		const objectStorageS3ForcePathStyle = useRemoteObjectStorage
			? meta.remoteObjectStorageS3ForcePathStyle
			: meta.objectStorageS3ForcePathStyle;

		const u = objectStorageEndpoint
			? `${ objectStorageUseSSL ? 'https' : 'http' }://${ objectStorageEndpoint }`
			: `${ objectStorageUseSSL ? 'https' : 'http' }://example.com`; // dummy url to select http(s) agent

		const agent = this.httpRequestService.getAgentByUrl(new URL(u), !objectStorageUseSSL, true);
		const handlerOption: NodeHttpHandlerOptions = {};
		if (objectStorageUseSSL) {
			handlerOption.httpsAgent = agent as https.Agent;
		} else {
			handlerOption.httpAgent = agent as http.Agent;
		}

		return new S3Client({
			endpoint: objectStorageEndpoint ? u : undefined,
			credentials: (objectStorageAccessKey !== null && objectStorageSecretKey !== null) ? {
				accessKeyId: objectStorageAccessKey,
				secretAccessKey: objectStorageSecretKey,
			} : undefined,
			region: objectStorageRegion || undefined, // 空文字列もundefinedにするため ?? は使わない
			tls: objectStorageUseSSL,
			forcePathStyle: objectStorageEndpoint ? objectStorageS3ForcePathStyle : false, // AWS with endPoint omitted
			requestHandler: new NodeHttpHandler(handlerOption),
			requestChecksumCalculation: 'WHEN_REQUIRED',
			responseChecksumValidation: 'WHEN_REQUIRED',
		});
	}

	@bindThis
	public async upload(meta: MiMeta, input: PutObjectCommandInput, isRemote = false) {
		const client = this.getS3Client(meta, isRemote);
		return new Upload({
			client,
			params: input,
			partSize: (client.config.endpoint && (await client.config.endpoint()).hostname === 'storage.googleapis.com')
				? 500 * 1024 * 1024
				: 8 * 1024 * 1024,
		}).done();
	}

	@bindThis
	public delete(meta: MiMeta, input: DeleteObjectCommandInput, isRemote = false) {
		const client = this.getS3Client(meta, isRemote);
		return client.send(new DeleteObjectCommand(input));
	}
}
