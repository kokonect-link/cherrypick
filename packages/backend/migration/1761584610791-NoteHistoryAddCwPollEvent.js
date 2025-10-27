/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NoteHistoryAddCwPollEvent1761584610791 {
	name = 'NoteHistoryAddCwPollEvent1761584610791';

	async up(queryRunner) {
		await queryRunner.query('ALTER TABLE "note_history" ADD "cw" character varying(512)');
		await queryRunner.query('ALTER TABLE "note_history" ADD "poll" jsonb');
		await queryRunner.query('ALTER TABLE "note_history" ADD "event" jsonb');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "note_history" DROP COLUMN "event"');
		await queryRunner.query('ALTER TABLE "note_history" DROP COLUMN "poll"');
		await queryRunner.query('ALTER TABLE "note_history" DROP COLUMN "cw"');
	}
}
