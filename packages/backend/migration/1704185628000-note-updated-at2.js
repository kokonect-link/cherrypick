export class NoteUpdatedAt1704185628000 {
    name = 'NoteUpdatedAt1704185628000'

    async up(queryRunner) {
				await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "note" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "updatedAt"`);
    }
}
