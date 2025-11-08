/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddDeliveryTargets1751828594933 {
    name = 'AddDeliveryTargets1751828594933';

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" ADD "deliveryTargets" jsonb DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "note_draft" ADD "deliveryTargets" jsonb DEFAULT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_note_deliveryTargets" ON "note" USING gin ("deliveryTargets")`);
        await queryRunner.query(`CREATE INDEX "IDX_note_draft_deliveryTargets" ON "note_draft" USING gin ("deliveryTargets")`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "deliveryTargets"`);
        await queryRunner.query(`ALTER TABLE "note_draft" DROP COLUMN "deliveryTargets"`);
        await queryRunner.query(`DROP INDEX "IDX_note_deliveryTargets"`);
        await queryRunner.query(`DROP INDEX "IDX_note_draft_deliveryTargets"`);

    }
}
