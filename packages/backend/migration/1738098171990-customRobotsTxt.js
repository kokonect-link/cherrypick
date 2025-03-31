/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class customRobotsTxt1738098171990 {
	name = 'customRobotsTxt1738098171990'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "customRobotsTxt" character varying(2048)`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "customRobotsTxt"`);
	}
}
