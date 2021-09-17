import {MigrationInterface, QueryRunner} from "typeorm";

export class suggestionLimitationSettingsfix1631888440000 implements MigrationInterface {
    name = 'suggestionLimitationSettingsfix1631888440000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "emojiSuggestionLimitationVip" integer NOT NULL DEFAULT '-1'`);
				await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "emojiSuggestionLimitationPremium"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
				await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "emojiSuggestionLimitationPremium"`);
    }

}
