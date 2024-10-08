export class AddDeleteAt1720161864577 {
    name = 'AddDeleteAt1720161864577'

    async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "note" ADD "deleteAt" TIMESTAMP WITH TIME ZONE`);
    }

    async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "deleteAt"`)
    }
}
