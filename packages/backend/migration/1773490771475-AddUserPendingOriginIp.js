/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddUserPendingOriginIp1773490771475 {
    name = 'AddUserPendingOriginIp1773490771475'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_pending" ADD "requestOriginIp" character varying(128) NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_pending" DROP COLUMN "requestOriginIp"`);
    }
}
