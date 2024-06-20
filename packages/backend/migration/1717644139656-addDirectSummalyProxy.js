/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, noridev, cherrypick-project, esurio
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class addDirectSummalyProxy1717644139656 {
	name = 'addDirectSummalyProxy1717644139656'

	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ADD "directSummalyProxy" boolean NOT NULL DEFAULT false`);
	}
	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "directSummalyProxy"`);
	}
}
