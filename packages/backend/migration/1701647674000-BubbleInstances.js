/*
 * SPDX-FileCopyrightText: marie and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class BubbleInstances1701647674000 {
    name = 'BubbleInstances1701647674000'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "bubbleInstances" character varying(256) array NOT NULL DEFAULT '{}'::varchar[]`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "bubbleInstances"`);
    }
}
