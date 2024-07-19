import { Inject, Injectable } from "@nestjs/common";
import { Brackets, IsNull, Not, SelectQueryBuilder } from "typeorm";
import type { NotesRepository, UsersRepository } from "@/models/_.js";
import { QueryService } from "@/core/QueryService.js";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";
import { FILE_TYPE_BROWSERSAFE } from "@/const.js";
import { DI } from "@/di-symbols.js";
import { bindThis } from "@/decorators.js";

const filters = {
} as Record<string, (query: SelectQueryBuilder<any>, search: string) => any>;

@Injectable()
export class FtsQueryService {
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private queryService: QueryService,
	) {

	}

	@bindThis
	public generateFtsQuery(query: SelectQueryBuilder<any>, q: string): void {
		const components = q.split(" ");
		const terms: string[] = [];

		for (const component of components) {
			const split = component.split(":");
			if (split.length > 1 && filters[split[0]] !== undefined ) {
				filters[split[0]](query, split.slice(1).join(":"));
			} else {
				terms.push(component);
			}
		}

		for (const term of terms) {
			if (term.startsWith('-')) {
				query.andWhere("note.text NOT ILIKE :q", { q: `%${ sqlLikeEscape(term.substring(1)) }%` });
			} else {
				query.andWhere("note.text ILIKE :q", { q: `%${ sqlLikeEscape(term) }%`})
			}
		}
	}
}
