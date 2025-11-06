/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddUserCanChat1762447519068 {
    name = 'AddUserCanChat1762447519068'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "canChat" boolean DEFAULT true`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "canChat"`);
    }
}
