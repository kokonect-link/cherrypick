import {MigrationInterface, QueryRunner} from "typeorm";

export class userPatron1620041622000 implements MigrationInterface {
    name = 'userPatron1620041622000'

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`ALTER TABLE "user" ADD "isPatron" boolean NOT NULL DEFAULT false`);
			await queryRunner.query(`COMMENT ON COLUMN "user"."isPatron" IS 'Whether the User is a patron.'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isPatron"`);
			await queryRunner.query(`COMMENT ON COLUMN "user"."isPatron" IS NULL`);
    }

}
