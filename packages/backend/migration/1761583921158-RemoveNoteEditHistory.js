/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RemoveNoteEditHistory1761583921158 {
	name = 'RemoveNoteEditHistory1761583921158';

	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "note" DROP COLUMN "noteEditHistory"');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "note" ADD "noteEditHistory" character varying(3000) array NOT NULL DEFAULT \'{}\'');
	}
}
