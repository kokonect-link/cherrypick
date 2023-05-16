export class tweakVarcharLength21684231006000 {
		name = 'tweakVarcharLength21684231006000'

		async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "translatorType" TYPE character varying(1024)`, undefined);
		}

		async down(queryRunner) {

		}
}
