export class AddPrivateVisibility1721550461923 {
    name = 'AddPrivateVisibility1721550461923'

    async up(queryRunner) {
			await queryRunner.query(`ALTER TYPE "note_visibility_enum" ADD VALUE 'private'`);
    }

    async down(queryRunner) {
			await queryRunner.query(`ALTER TYPE "note_visibility_enum" DROP VALUE 'private'`);
    }
}
