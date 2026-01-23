/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, noridev and cherryPick-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export class NoteDraftEventMetadataNullable1769162192635 {
    name = 'NoteDraftEventMetadataNullable1769162192635'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "proxyRemoteFiles" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" DROP DEFAULT`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" SET DEFAULT '{"@type": "Event", "@context": "https://schema.org/"}'`);
        await queryRunner.query(`ALTER TABLE "note_draft" ALTER COLUMN "eventMetadata" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "proxyRemoteFiles" SET DEFAULT false`);
    }
}
