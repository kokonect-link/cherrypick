/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddInstanceQuarantineLimited1762797644990 {
    name = 'AddInstanceQuarantineLimited1762797644990'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "instance" ADD "quarantineLimited" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN "quarantineLimited"`);
    }
}

