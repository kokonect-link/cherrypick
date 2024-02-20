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
	) {
	}

	@bindThis
	public getS3Client(meta: MiMeta, isRemote: boolean): S3Client {
		const useObjectStorageRemote = isRemote && meta.useObjectStorageRemote;

		const objectStorageEndpoint = useObjectStorageRemote ? meta.objectStorageRemoteEndpoint : meta.objectStorageEndpoint;
		const objectStorageUseSSL = useObjectStorageRemote ? meta.objectStorageRemoteUseSSL : meta.objectStorageUseSSL;
		const objectStorageUseProxy = useObjectStorageRemote ? meta.objectStorageRemoteUseProxy : meta.objectStorageUseProxy;
		const objectStorageAccessKey = useObjectStorageRemote ? meta.objectStorageRemoteAccessKey : meta.objectStorageAccessKey;
		const objectStorageSecretKey = useObjectStorageRemote ? meta.objectStorageRemoteSecretKey : meta.objectStorageSecretKey;
		const objectStorageRegion = useObjectStorageRemote ? meta.objectStorageRemoteRegion : meta.objectStorageRegion;
		const objectStorageS3ForcePathStyle = useObjectStorageRemote ? meta.objectStorageRemoteS3ForcePathStyle : meta.objectStorageS3ForcePathStyle;

		const u = objectStorageEndpoint
			? `${objectStorageUseSSL ? 'https' : 'http'}://${objectStorageEndpoint}`
			: `${objectStorageUseSSL ? 'https' : 'http'}://example.net`; // dummy url to select http(s) agent

		const agent = this.httpRequestService.getAgentByUrl(new URL(u), !objectStorageUseProxy);
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
			region: objectStorageRegion ? objectStorageRegion : undefined, // empty string is converted to undefined
			tls: objectStorageUseSSL,
			forcePathStyle: objectStorageEndpoint ? objectStorageS3ForcePathStyle : false, // AWS with endPoint omitted
			requestHandler: new NodeHttpHandler(handlerOption),
		});
	}

	@bindThis
	public async upload(meta: MiMeta, input: PutObjectCommandInput, isRemote: boolean) {
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
	public delete(meta: MiMeta, input: DeleteObjectCommandInput, isRemote: boolean) {
		const client = this.getS3Client(meta, isRemote);
		return client.send(new DeleteObjectCommand(input));
	}
}
