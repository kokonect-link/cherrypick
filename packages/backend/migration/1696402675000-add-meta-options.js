/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddMetaOptions1696402675000 {
    name = 'AddMetaOptions1696402675000'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableReceivePrerelease" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableReceivePrerelease"`);
    }
}
