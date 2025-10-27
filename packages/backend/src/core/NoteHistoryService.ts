/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { LessThan, MoreThan } from 'typeorm';
import { MiNote } from '@/models/Note.js';
import Logger from '@/logger.js';
import { IdService } from '@/core/IdService.js';

import { DI } from '@/di-symbols.js';
import type { NoteHistoryRepository, PollsRepository, EventsRepository } from '@/models/_.js';
import { bindThis } from '@/decorators.js';
import { NoteHistory } from '@/models/NoteHistory.js';
import { LoggerService } from './LoggerService.js';
import { AppLockService } from './AppLockService.js';

type Option = {
	updatedAt?: Date | null;
};

@Injectable()
export class NoteHistorySerivce implements OnApplicationShutdown {
	#shutdownController = new AbortController();
	private logger: Logger;
	constructor (
		@Inject(DI.noteHistoryRepository)
		private noteHistoryRepository: NoteHistoryRepository,

		@Inject(DI.pollsRepository)
		private pollsRepository: PollsRepository,

		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		private idService: IdService,

		private loggerService: LoggerService,
		private appLockService: AppLockService,

	) {
		this.logger = this.loggerService.getLogger('NoteHistorySerivce');
	}

	/**
	 * Back up contents of the current note to the history record.
	 * @param newData Update된 노트
	 * @param originalNote Update 되기 전의 원래 노트 내용
	 * @param originalPoll Update 되기 전의 원래 poll 데이터
	 * @param originalEvent Update 되기 전의 원래 event 데이터
	 * @param options 옵션
	 */
	@bindThis
	public async recordHistory (
		newData: MiNote,
		originalNote: MiNote,
		originalPoll: NoteHistory['poll'] | null,
		originalEvent: NoteHistory['event'] | null,
		options: Option,
	) {
		const unlock = await this.appLockService.getApLock(`record-note-history:${originalNote.id}`);

		try {
			// 이전에 이미 기록된 히스토리가 있는 경우 가장 최근의 히스토리를 가져오기
			const lastRecord = await this.noteHistoryRepository.findOne({
				where: { noteId: originalNote.id },
				order: { id: 'DESC' }
			});

			const lastRecord_createdAt = lastRecord?.updatedAt ?? this.idService.parse(originalNote.id).date;

			const history_data: NoteHistory = {
				id: this.idService.gen(new Date().getTime()),
				noteId: originalNote.id,
				createdAt: lastRecord_createdAt, // 백업할 원래 노트가 만들어졌던 시간
				updatedAt: options.updatedAt ?? new Date(), // 노트가 수정된 시간 (현재)
				userId: originalNote.userId,
				fileIds: originalNote.fileIds,
				attachedFileTypes: originalNote.attachedFileTypes,
				emojis: originalNote.emojis,
				text: originalNote.text,
				cw: originalNote.cw,
				poll: originalPoll,
				event: originalEvent,
				visibility: originalNote.visibility,
				visibleUserIds: originalNote.visibleUserIds,
			};

			const newFileIds = newData.fileIds;
			const lastRecordFileIds = lastRecord?.fileIds;
			const originalFileIds = originalNote.fileIds;

			const textChanged = newData.text !== originalNote.text;
			const cwChanged = newData.cw !== originalNote.cw;
			const filesChanged = newFileIds.length !== originalFileIds.length || !newFileIds.every((v) => originalFileIds.includes(v));

			let pollChanged = newData.hasPoll !== originalNote.hasPoll;
			if (!pollChanged && originalPoll && lastRecord?.poll) {
				pollChanged =
					originalPoll.choices.length !== lastRecord.poll.choices.length ||
					!originalPoll.choices.every((choice, i) => choice === lastRecord.poll!.choices[i]) ||
					originalPoll.multiple !== lastRecord.poll.multiple ||
					originalPoll.expiresAt?.getTime() !== (lastRecord.poll.expiresAt ? new Date(lastRecord.poll.expiresAt).getTime() : null);
			}

			let eventChanged = newData.hasEvent !== originalNote.hasEvent;
			if (!eventChanged && originalEvent && lastRecord?.event) {
				eventChanged =
					originalEvent.start.getTime() !== new Date(lastRecord.event.start).getTime() ||
					originalEvent.end?.getTime() !== (lastRecord.event.end ? new Date(lastRecord.event.end).getTime() : null) ||
					originalEvent.title !== lastRecord.event.title ||
					JSON.stringify(originalEvent.metadata) !== JSON.stringify(lastRecord.event.metadata);
			}

			if (!textChanged && !cwChanged && !filesChanged && !pollChanged && !eventChanged) {
				this.logger.info(`Skip Record History (No changes): ${originalNote.id}`);
			} else {
				this.logger.info(`Record History for: ${originalNote.id}`);
				await this.noteHistoryRepository.insert(history_data);
			}
		} catch (e) {
			this.logger.error(`Note History record Error! ${e}`);
		} finally {
			unlock();
		}
	}

	@bindThis
	public async getHistory (
		note_id: MiNote['id'],
		limit: number,
		sinceId?: NoteHistory['id'],
		untilId?: NoteHistory['id'],
	): Promise<NoteHistory[] | null> {
		this.logger.info(`Get history of note ${note_id}`);
		try {
			const history = await this.noteHistoryRepository.find({
				where: {
					noteId: note_id,
					...(sinceId ? { id: MoreThan(sinceId) } : {}),
					...(untilId ? { id: LessThan(untilId) } : {}),
				},
				take: limit,
				order: { id: 'DESC' },
			});
			if (history.length > 0) {
				return history;
			} else {
				return null;
			}
		} catch (e) {
			this.logger.error(`Note History find error: ${e}`);
			throw e;
		}
	}

	@bindThis
	public dispose(): void {
		this.#shutdownController.abort();
	}

	@bindThis
	public onApplicationShutdown(signal?: string | undefined): void {
		this.dispose();
	}
}
