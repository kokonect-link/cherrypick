/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NoteHistory1725344700039 {
	name = 'NoteHistory1725344700039';

	async up(queryRunner) {
		await queryRunner.query('CREATE TYPE "public"."note_history_visibility_enum" AS ENUM(\'public\', \'home\', \'followers\', \'specified\')');
		await queryRunner.query('CREATE TABLE "note_history" ("id" character varying(32) NOT NULL, "noteId" character varying(32) NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" character varying(32) NOT NULL, "fileIds" character varying(32) array NOT NULL DEFAULT \'{}\', "attachedFileTypes" character varying(256) array NOT NULL DEFAULT \'{}\', "emojis" character varying(128) array NOT NULL DEFAULT \'{}\', "text" text, "visibility" "public"."note_history_visibility_enum" NOT NULL, "visibleUserIds" character varying(32) array NOT NULL DEFAULT \'{}\', CONSTRAINT "PK_b8603c8aa42b803c7687e52c2c0" PRIMARY KEY ("id"))');
		await queryRunner.query('CREATE INDEX "IDX_1e2492ba7582bf830b750a2962" ON "note_history" ("noteId") ');
		await queryRunner.query('ALTER TABLE "note_history" ADD CONSTRAINT "FK_1e2492ba7582bf830b750a29627" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
		await queryRunner.query('ALTER TABLE "note_history" ADD CONSTRAINT "FK_95a9f7f6939a5cd4ec5d84979af" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
	}

	async down(queryRunner) {
		await queryRunner.query('ALTER TABLE "note_history" DROP CONSTRAINT "FK_95a9f7f6939a5cd4ec5d84979af"');
		await queryRunner.query('ALTER TABLE "note_history" DROP CONSTRAINT "FK_1e2492ba7582bf830b750a29627"');
		await queryRunner.query('DROP INDEX "public"."IDX_1e2492ba7582bf830b750a2962"');
		await queryRunner.query('DROP TABLE "note_history"');
		await queryRunner.query('DROP TYPE "public"."note_history_visibility_enum"');
	}
};
