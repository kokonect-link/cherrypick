import {MigrationInterface, QueryRunner} from "typeorm";

export class userVip1631350986000 implements MigrationInterface {
    name = 'userVip1631350986000'

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`ALTER TABLE "user" ADD "isVip" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isVip"`);
    }

}
