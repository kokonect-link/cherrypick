/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class DropObjectStorageRemoteSetting1730162520000 {
	name = 'DropObjectStorageRemoteSetting1730162520000'

	async up(queryRunner) {
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
