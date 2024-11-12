/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class checkModeratorInactive1731385181000 {
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "disableRegistrationWhenInactive" boolean NOT NULL DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "disablePublicNoteWhenInactive" boolean NOT NULL DEFAULT false`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableRegistrationWhenInactive";`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disablePublicNoteWhenInactive";`);
	}
}
