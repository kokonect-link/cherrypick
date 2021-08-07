import {MigrationInterface, QueryRunner} from "typeorm";

export class EmojiSuggestion1627896225000 implements MigrationInterface {
		name = 'EmojiSuggestion1627896225000'

		public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`CREATE TABLE "emoji_request" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "fileId" character varying(32) NOT NULL, "name" character varying(512) NOT NULL, "aliases" character varying(128) array NOT NULL DEFAULT '{}'::varchar[], "description" character varying(500) NOT NULL, "proposerId" character varying(32) NOT NULL, "state" character varying(8) NOT NULL DEFAULT 'pending', "moderatorComment" character varying(500) DEFAULT null, CONSTRAINT "PK_3c74521e048dc744f0c7eb65f4a" PRIMARY KEY ("id"))`, undefined);
			await queryRunner.query(`CREATE INDEX "IDX_c1e4c968b6c866d58090ebbcfc" ON "emoji_request" ("fileId") `, undefined);
			await queryRunner.query(`CREATE INDEX "IDX_1292fd869577f6e76b36474bb5" ON "emoji_request" ("proposerId") `, undefined);
			await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ea1d771e867e9843300f09d02c" ON "emoji_request" ("name") `, undefined);
			await queryRunner.query(`ALTER TABLE "emoji_request" ADD CONSTRAINT "FK_c1e4c968b6c866d58090ebbcfc0" FOREIGN KEY ("fileId") REFERENCES "drive_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
			await queryRunner.query(`ALTER TABLE "emoji_request" ADD CONSTRAINT "FK_1292fd869577f6e76b36474bb51" FOREIGN KEY ("proposerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
		}

		public async down(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`ALTER TABLE "emoji_request" DROP CONSTRAINT "FK_1292fd869577f6e76b36474bb51"`, undefined);
			await queryRunner.query(`ALTER TABLE "emoji_request" DROP CONSTRAINT "FK_c1e4c968b6c866d58090ebbcfc0"`, undefined);
			await queryRunner.query(`DROP TABLE "emoji_request"`, undefined);
		}

}
