/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class MultipleTranslationServices1685378242713 {
    name = 'MultipleTranslationServices1685378242713'

    async up(queryRunner) {
      await queryRunner.query(`ALTER TABLE "meta" ADD "ctav3SaKey" character varying(5120)`);
      await queryRunner.query(`ALTER TABLE "meta" ADD "ctav3ProjectId" character varying(1024)`);
      await queryRunner.query(`ALTER TABLE "meta" ADD "ctav3Location" character varying(1024)`);
      await queryRunner.query(`ALTER TABLE "meta" ADD "ctav3Model" character varying(1024)`);
      await queryRunner.query(`ALTER TABLE "meta" ADD "ctav3Glossary" character varying(1024)`);
    }

    async down(queryRunner) {
      await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "ctav3SaKey"`);
      await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "ctav3ProjectId"`);
      await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "ctav3Location"`);
      await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "ctav3Model"`);
      await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "ctav3Glossary"`);
    }
}
