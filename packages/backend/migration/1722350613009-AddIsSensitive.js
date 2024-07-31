export class AddIsSensitive1722350613009 {
    name = 'AddIsSensitive1722350613009'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isSensitive" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isSensitive"`);
    }
}
