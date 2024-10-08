export class AddCustomSplash1723982389378 {
    name = 'AddCustomSplash1723982389378'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "customSplashText" character varying(1024) array NOT NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "customSplashText"`);
    }
}
