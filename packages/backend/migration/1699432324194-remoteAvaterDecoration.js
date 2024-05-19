/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RemoteAvaterDecoration1699432324194 {
		name = 'RemoteAvaterDecoration1699432324194'

    async up(queryRunner) {
			queryRunner.query(`ALTER TABLE "avatar_decoration" ADD "remoteId" varchar(32)`);
			queryRunner.query(`ALTER TABLE "avatar_decoration" ADD "host" varchar(128)`);
    }

    async down(queryRunner) {
			queryRunner.query(`ALTER TABLE "avatar_decoration" DROP COLUMN "host"`);
			queryRunner.query(`ALTER TABLE "avatar_decoration" DROP COLUMN "remoteId"`);
    }
}
