/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NoteHistory2_1725517326637 {
	name = 'NoteHistory2_1725517326637';

	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "note_history" ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE NULL');
		await queryRunner.query('UPDATE "note_history" set "createdAt" = \'1972.11.21\' where "createdAt" IS NULL');
		await queryRunner.query('ALTER TABLE "note_history" ALTER COLUMN "createdAt" set NOT NULL');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "note_history" DROP COLUMN "createdAt"');
	}
};
