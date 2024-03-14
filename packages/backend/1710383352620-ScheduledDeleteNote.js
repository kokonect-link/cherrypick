const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class ScheduledDeleteNote1710383352620 {
    name = 'ScheduledDeleteNote1710383352620'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "poll_vote" DROP CONSTRAINT "FK_poll_vote_poll"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cd3b2a6b4cf0b910b260afe08"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muteeId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muterId"`);
        await queryRunner.query(`ALTER TABLE "note" ADD "deleteAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "noteEditHistory" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "event"."metadata" IS 'metadata object describing the event. Follows https://schema.org/Event'`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "metadata" SET DEFAULT '{"@context":"https://schema.org/","@type":"Event"}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "disableRegistration" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey", "cherrypick" }'`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "UQ_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "UQ_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "UQ_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TYPE "public"."user_profile_followersVisibility_enum" RENAME TO "user_profile_followersVisibility_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_profile_followersvisibility_enum" AS ENUM('public', 'followers', 'private')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" TYPE "public"."user_profile_followersvisibility_enum" USING "followersVisibility"::"text"::"public"."user_profile_followersvisibility_enum"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" SET DEFAULT 'public'`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_followersVisibility_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "UQ_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "flash" ALTER COLUMN "visibility" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_3fcc2c589eaefc205e0714b99c" ON "ad" ("startsAt") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c71faf11f0a28a5c0bb506203c" ON "channel_favorite" ("userId", "channelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f7b9d338207e40e768e4a5265a" ON "instance" ("firstRetrievedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_7eac97594bcac5ffcf2068089b" ON "renote_muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7aa72a5fe76019bfe8e5e0e8b7" ON "renote_muting" ("muterId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d801c609cec4e9eb4b6b4490c" ON "renote_muting" ("muterId", "muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_58699f75b9cf904f5f007909cb" ON "user_profile" ("birthday") `);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58699f75b9cf904f5f007909cb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d801c609cec4e9eb4b6b4490c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7aa72a5fe76019bfe8e5e0e8b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7eac97594bcac5ffcf2068089b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7b9d338207e40e768e4a5265a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c71faf11f0a28a5c0bb506203c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3fcc2c589eaefc205e0714b99c"`);
        await queryRunner.query(`ALTER TABLE "flash" ALTER COLUMN "visibility" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "UQ_10c146e4b39b443ede016f6736d" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."user_profile_followersVisibility_enum_old" AS ENUM('public', 'followers', 'private')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" TYPE "public"."user_profile_followersVisibility_enum_old" USING "followersVisibility"::"text"::"public"."user_profile_followersVisibility_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "followersVisibility" SET DEFAULT 'public'`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_followersvisibility_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_profile_followersVisibility_enum_old" RENAME TO "user_profile_followersVisibility_enum"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "UQ_f4853eb41ab722fe05f81cedeb6" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "UQ_e263909ca4fe5d57f8d4230dd5c" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "UQ_da851e06d0dfe2ef397d8b1bf1b" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey,cherrypick}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "disableRegistration" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "event"."metadata" IS 'metadata mapping for event with more user configurable optional information'`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "noteEditHistory" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "deleteAt"`);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muterId" ON "muting" ("muterId") `);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muteeId" ON "muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cd3b2a6b4cf0b910b260afe08" ON "instance" ("firstRetrievedAt") `);
        await queryRunner.query(`ALTER TABLE "poll_vote" ADD CONSTRAINT "FK_poll_vote_poll" FOREIGN KEY ("noteId") REFERENCES "poll"("noteId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
