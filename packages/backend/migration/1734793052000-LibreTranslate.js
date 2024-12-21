/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class LibreTranslate1734793052000 {
    name = 'LibreTranslate1734793052000'

    async up(queryRunner) {
      await queryRunner.query(`ALTER TABLE "meta" ADD "libreTranslateEndPoint" character varying(1024)`);
      await queryRunner.query(`ALTER TABLE "meta" ADD "libreTranslateApiKey" character varying(1024)`);
    }

    async down(queryRunner) {
      await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "libreTranslateEndPoint"`);
      await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "libreTranslateApiKey"`);
    }
}
