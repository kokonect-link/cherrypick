/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, noridev, cherrypick-project, esurio
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddSomeUrl1710210658917 {
	name = 'AddSomeUrl1710210658917'

	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ADD "statusUrl" character varying(1024)`);
	}
	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "statusUrl"`);
	}
}
