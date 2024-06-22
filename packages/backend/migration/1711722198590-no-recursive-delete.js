
export class NoRecursiveDelete1711722198590 {
    name = 'NoRecursiveDelete1711722198590'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_17cb3553c700a4985dff5a30ff5"`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_17cb3553c700a4985dff5a30ff5" FOREIGN KEY ("replyId") REFERENCES "note"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_17cb3553c700a4985dff5a30ff5"`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_17cb3553c700a4985dff5a30ff5" FOREIGN KEY ("replyId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
