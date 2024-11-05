/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RemoteObjectStorage1729518620697 {
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "useRemoteObjectStorage" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageBucket" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStoragePrefix" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageBaseUrl" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageEndpoint" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageRegion" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageAccessKey" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageSecretKey" character varying(1024)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStoragePort" integer`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageUseSSL" boolean DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageUseProxy" boolean DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageSetPublicRead" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "remoteObjectStorageS3ForcePathStyle" boolean NOT NULL DEFAULT true`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageS3ForcePathStyle";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageSetPublicRead";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageUseProxy";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageUseSSL";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStoragePort";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageSecretKey";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageAccessKey";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageRegion";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageEndpoint";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageBaseUrl";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStoragePrefix";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "remoteObjectStorageBucket";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "useRemoteObjectStorage";`);
	}
}
