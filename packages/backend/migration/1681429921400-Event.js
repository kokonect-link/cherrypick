/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class Event1681429921400 {
	name = 'Event1681429921400'

	async up(queryRunner) {
		await queryRunner.query(`CREATE TABLE "event" ("id" character varying(32) NOT NULL, "start" TIMESTAMP WITH TIME ZONE NOT NULL, "end" TIMESTAMP WITH TIME ZONE, "title" character varying(128) NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id")); COMMENT ON COLUMN "event"."start" IS 'The start time of the event'; COMMENT ON COLUMN "event"."end" IS 'The end of the event'; COMMENT ON COLUMN "event"."title" IS 'short name of event'; COMMENT ON COLUMN "event"."metadata" IS 'metadata mapping for event with more user configurable optional information'`);
		await queryRunner.query(`CREATE INDEX "IDX_785ee5fc1ea38a1b9b38ff88e5" ON "event" ("start") `);
		await queryRunner.query(`ALTER TABLE "note" ADD "eventId" character varying(32)`);
		await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "UQ_3af9380f266b7046cce9c992197" UNIQUE ("eventId")`);
		await queryRunner.query(`COMMENT ON COLUMN "note"."eventId" IS 'The ID of child event'`);
		await queryRunner.query(`COMMENT ON COLUMN "user"."isRoot" IS 'Whether the User is the root.'`);
		await queryRunner.query(`COMMENT ON COLUMN "ad"."startsAt" IS 'The expired date of the Ad.'`);
		await queryRunner.query(`ALTER TABLE "antenna" ALTER COLUMN "lastUsedAt" DROP DEFAULT`);
		await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS 'The mutee user ID.'`);
		await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS 'The muter user ID.'`);
		await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
		await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
		await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
		await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
		await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
		await queryRunner.query(`CREATE INDEX "IDX_3af9380f266b7046cce9c99219" ON "note" ("eventId") `);
		await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_3af9380f266b7046cce9c992197" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
		await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
		await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
		await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
		await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
		await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_3af9380f266b7046cce9c992197"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_3af9380f266b7046cce9c99219"`);
		await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."createdAt" IS NULL`);
		await queryRunner.query(`ALTER TABLE "antenna" ALTER COLUMN "lastUsedAt" SET DEFAULT '2023-04-13 18:46:24.168209-04'`);
		await queryRunner.query(`COMMENT ON COLUMN "ad"."startsAt" IS NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "user"."isRoot" IS 'Whether the User is the admin.'`);
		await queryRunner.query(`COMMENT ON COLUMN "note"."eventId" IS 'The ID of child event'`);
		await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "UQ_3af9380f266b7046cce9c992197"`);
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "eventId"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_785ee5fc1ea38a1b9b38ff88e5"`);
		await queryRunner.query(`DROP TABLE "event"`);
	}
}
