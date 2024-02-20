/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ObjectStorageRemoteSetting1689580926821 {
	name = 'ObjectStorageRemoteSetting1689580926821'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "useObjectStorageRemote" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteBucket" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemotePrefix" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteBaseUrl" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteEndpoint" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteRegion" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteAccessKey" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteSecretKey" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemotePort" integer`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteUseSSL" boolean NOT NULL DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteUseProxy" boolean NOT NULL DEFAULT true`, undefined);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteSetPublicRead" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "objectStorageRemoteS3ForcePathStyle" boolean NOT NULL DEFAULT true`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteS3ForcePathStyle"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteSetPublicRead"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteUseProxy"`, undefined);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteUseSSL"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemotePort"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteSecretKey"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteAccessKey"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteRegion"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteEndpoint"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteBaseUrl"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemotePrefix"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "objectStorageRemoteBucket"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "useObjectStorageRemote"`);
	}

}
