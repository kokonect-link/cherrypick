/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class MigrateMessagingToChat1742927188000 {
	name = 'MigrateMessagingToChat1742927188000';

	async up(queryRunner) {
		await queryRunner.query(`
			INSERT INTO "chat_message" ("id", "fromUserId", "toUserId", "text", "uri", "reads", "fileId")
			SELECT "id", "userId" AS "fromUserId", "recipientId" AS "toUserId", "text", "uri", "reads", "fileId"
			FROM "messaging_message";
		`);

		await queryRunner.query(`
			INSERT INTO "chat_approval" ("id", "userId", "otherId")
			SELECT DISTINCT
				m1."id" AS "id",
				LEAST(m1."fromUserId", m1."toUserId") AS "userId",
				GREATEST(m1."fromUserId", m1."toUserId") AS "otherId"
			FROM "chat_message" m1
						 JOIN "chat_message" m2
									ON (m1."fromUserId" = m2."toUserId" AND m1."toUserId" = m2."fromUserId")
			WHERE m1."id" != m2."id"
			ON CONFLICT ("userId", "otherId") DO NOTHING;
		`);
	}
}
