/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class DropScheduleNote1760797772000 {
    name = 'DropScheduleNote1760797772000'

    async up(queryRunner) {
        await queryRunner.query(`DROP TABLE "note_schedule"`);
    }
}
