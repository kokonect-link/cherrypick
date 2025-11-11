/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddChatMessageEmojis1762351977309 {
    name = 'AddChatMessageEmojis1762351977309'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_message" ADD "emojis" character varying(128) array NOT NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_message" DROP COLUMN "emojis"`);
    }
}
