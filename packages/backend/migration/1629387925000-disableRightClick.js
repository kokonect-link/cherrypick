/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class disableRightClick1629387925000 {
	constructor() {
		this.name = 'disableRightClick1629387925000';
	}
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "note" ADD "disableRightClick" boolean NOT NULL DEFAULT false`);
	}
	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "disableRIghtClick"`);
	}
}
