import {MigrationInterface, QueryRunner} from "typeorm";

export class disableRightClick1629387925000 implements MigrationInterface {
		name = 'disableRightClick1629387925000'

		public async up(queryRunner: QueryRunner): Promise<void> {
				await queryRunner.query(`ALTER TABLE "note" ADD "disableRightClick" boolean NOT NULL DEFAULT false`);
		}

		public async down(queryRunner: QueryRunner): Promise<void> {
				await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "disableRIghtClick"`);
		}

}
