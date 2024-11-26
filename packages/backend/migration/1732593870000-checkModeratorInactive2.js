/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class checkModeratorInactive21732593870000 {
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "moderatorInactivityLimitDays" integer NOT NULL DEFAULT '7'`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "moderatorInactivityLimitDays";`);
	}
}
