/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class setFederationAvatarShape1738776889000 {
    name = 'setFederationAvatarShape1738776889000'

    async up(queryRunner) {
				await queryRunner.query(`ALTER TABLE "user" ADD "setFederationAvatarShape" boolean NOT NULL DEFAULT true`);
				await queryRunner.query(`ALTER TABLE "user" ADD "isSquareAvatars" boolean NOT NULL DEFAULT true`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "setFederationAvatarShape"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isSquareAvatars"`);
    }
}
