export class AddIsIndexable1721299883211 {
    name = 'AddIsIndexable1721299883211'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isIndexable" boolean NOT NULL DEFAULT true`);
				await queryRunner.query(`ALTER TABLE "user_profile" ADD "isIndexable" boolean NOT NULL DEFAULT true`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isIndexable"`);
				await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "isIndexable"`);
    }
}
