/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, noridev, cherrypick-project, esurio
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ScheduledDeleteNote1710383352620 {
	name = 'ScheduledDeleteNote1710383352620'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "notes" ADD "deleteAt" TIMESTAMP WITH TIME ZONE`)
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "deleteAt"`)
	}
}
