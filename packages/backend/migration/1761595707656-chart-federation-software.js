/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class chartFederationSoftware1761595707656 {
	name = 'chartFederationSoftware1761595707656'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "__chart__federation" ADD "___software" smallint NOT NULL DEFAULT '0'`);
		await queryRunner.query(`ALTER TABLE "__chart_day__federation" ADD "___software" smallint NOT NULL DEFAULT '0'`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "__chart_day__federation" DROP COLUMN "___software"`);
		await queryRunner.query(`ALTER TABLE "__chart__federation" DROP COLUMN "___software"`);
	}
}

