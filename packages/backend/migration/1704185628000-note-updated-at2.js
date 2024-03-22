export class NoteUpdatedAt1704185628000 {
    name = 'NoteUpdatedAt1704185628000'

    async up(queryRunner) {
				await queryRunner.query(`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'note' AND column_name = 'updatedAt'`)
					.then(updatedAt => {
						if (updatedAt.length > 0) {
							return [];
						} else {
							return [
								queryRunner.query(`ALTER TABLE "note" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`)
							];
						}
					})
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "updatedAt"`);
    }
}
