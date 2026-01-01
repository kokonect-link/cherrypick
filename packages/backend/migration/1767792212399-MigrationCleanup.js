/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class MigrationCleanup1767792212399 {
    name = 'MigrationCleanup1767792212399'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "poll_vote" DROP CONSTRAINT "FK_poll_vote_poll"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_note_deliveryTargets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_note_draft_deliveryTargets"`);
        await queryRunner.query(`COMMENT ON COLUMN "abuse_report_resolver"."updatedAt" IS 'The updated date of the AbuseReportResolver.'`);
        await queryRunner.query(`COMMENT ON COLUMN "abuse_report_resolver"."expirationDate" IS 'The expiration date of the AbuseReportResolver'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "canChat" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "color" SET DEFAULT '#ffbcdc'`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "deliveryTargets" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "event"."metadata" IS 'metadata object describing the event. Follows https://schema.org/Event'`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "metadata" SET DEFAULT '{"@context":"https://schema.org/","@type":"Event"}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "remoteObjectStorageUseSSL" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "remoteObjectStorageUseProxy" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey,cherrypick}'`);
        await queryRunner.query(`COMMENT ON COLUMN "meta"."trustedLinkUrlPatterns" IS 'An array of URL strings or regex that can be used to omit warnings about redirects to external sites. Separate them with spaces to specify AND, and enclose them with slashes to specify regular expressions. Each item is regarded as an OR.'`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "hasEvent" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "disableRightClick" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventStart" IS 'The start time of the event'`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventEnd" IS 'The end of the event'`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventTitle" IS 'short name of event'`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventMetadata" IS 'metadata object describing the event. Follows https://schema.org/Event'`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" SET DEFAULT '{"@context":"https://schema.org/","@type":"Event"}'`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "deliveryTargets" SET DEFAULT '{}'`);
        await queryRunner.query(`CREATE INDEX "IDX_72689e25ff8131746cb31ef9a1" ON "note_draft" ("eventStart") `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_72689e25ff8131746cb31ef9a1"`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "deliveryTargets" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventMetadata" IS NULL`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventTitle" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventEnd" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "note_draft"."eventStart" IS NULL`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "disableRightClick" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "hasEvent" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "meta"."trustedLinkUrlPatterns" IS NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "remoteObjectStorageUseProxy" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "remoteObjectStorageUseSSL" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "event"."metadata" IS 'metadata mapping for event with more user configurable optional information'`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "deliveryTargets" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "color" SET DEFAULT '#86b300'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "canChat" SET DEFAULT true`);
        await queryRunner.query(`COMMENT ON COLUMN "abuse_report_resolver"."expirationDate" IS 'The expiration date of AbuseReportResolver'`);
        await queryRunner.query(`COMMENT ON COLUMN "abuse_report_resolver"."updatedAt" IS 'The updated date of AbuseReportResolver'`);
        await queryRunner.query(`CREATE INDEX "IDX_note_draft_deliveryTargets" ON "note_draft" ("deliveryTargets") `);
        await queryRunner.query(`CREATE INDEX "IDX_note_deliveryTargets" ON "note" ("deliveryTargets") `);
        await queryRunner.query(`ALTER TABLE "poll_vote" ADD CONSTRAINT "FK_poll_vote_poll" FOREIGN KEY ("noteId") REFERENCES "poll"("noteId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
