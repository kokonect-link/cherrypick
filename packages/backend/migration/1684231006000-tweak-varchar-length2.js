/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class tweakVarcharLength21684231006000 {
		name = 'tweakVarcharLength21684231006000'

		async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "translatorType" TYPE character varying(1024)`, undefined);
		}

		async down(queryRunner) {

		}
}
