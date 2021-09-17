import {MigrationInterface, QueryRunner} from "typeorm";

export class vipDrive1631888562000 implements MigrationInterface {
		name = 'vipDrive1631888562000'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "vipDriveCapacityMb" integer NOT NULL DEFAULT 2048`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "vipDriveCapacityMb"`, undefined);
    }

}
