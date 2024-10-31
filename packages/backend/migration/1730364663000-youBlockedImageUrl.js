/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class YouBlockedImageUrl1730364663000 {
	name = 'YouBlockedImageUrl1730364663000'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "youBlockedImageUrl" character varying(1024)`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "youBlockedImageUrl"`);
	}
}
