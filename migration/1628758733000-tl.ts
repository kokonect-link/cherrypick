import {MigrationInterface, QueryRunner} from "typeorm";

export class tl1628758733000 implements MigrationInterface {
	name = 'tl1628758733000'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" ADD "disableCatTimeline" boolean NOT NULL DEFAULT false`, undefined);
		await queryRunner.query(`ALTER TABLE "note" ADD "remoteFollowersOnly" boolean NOT NULL DEFAULT false`, undefined);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableCatTimeline"`, undefined);
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "remoteFollowersOnly"`, undefined);
	}

}
