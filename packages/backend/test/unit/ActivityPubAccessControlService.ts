/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { describe, test, expect, beforeEach } from '@jest/globals';
import type { FastifyRequest } from 'fastify';
import { ActivityPubAccessControlService } from '@/core/ActivityPubAccessControlService.js';
import { DI } from '@/di-symbols.js';
import { UtilityService } from '@/core/UtilityService.js';
import { LoggerService } from '@/core/LoggerService.js';

describe('ActivityPubAccessControlService', () => {
	let service: ActivityPubAccessControlService;
	let mockInstancesRepository: any;
	let mockUtilityService: any;
	let mockLoggerService: any;
	let mockConfig: any;
	let mockMeta: any;

	beforeEach(async () => {
		mockInstancesRepository = {
			findOneBy: jest.fn(),
		};

		mockUtilityService = {
			toPuny: jest.fn((host: string) => host.toLowerCase()),
			isBlockedHost: jest.fn(() => false),
			isSilencedHost: jest.fn(() => false),
		};

		mockLoggerService = {
			getLogger: jest.fn(() => ({
				info: jest.fn(),
				debug: jest.fn(),
				warn: jest.fn(),
				error: jest.fn(),
			})),
		};

		mockConfig = {
			host: 'test.example.com',
		};

		mockMeta = {
			blockedHosts: [],
			silencedHosts: [],
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ActivityPubAccessControlService,
				{ provide: DI.config, useValue: mockConfig },
				{ provide: DI.meta, useValue: mockMeta },
				{ provide: DI.instancesRepository, useValue: mockInstancesRepository },
				{ provide: UtilityService, useValue: mockUtilityService },
				{ provide: LoggerService, useValue: mockLoggerService },
			],
		}).compile();

		service = module.get<ActivityPubAccessControlService>(ActivityPubAccessControlService);
	});

	test('should be defined', () => {
		expect(service).toBeDefined();
	});

	test('should allow access when no User-Agent is provided', async () => {
		const mockRequest = {
			headers: {},
		} as FastifyRequest;

		const result = await service.checkAccess(mockRequest);
		expect(result).toBeNull();
	});

	test('should allow access from non-ActivityPub clients', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			},
		} as FastifyRequest;

		const result = await service.checkAccess(mockRequest);
		expect(result).toBeNull();
	});

	test('should detect Mastodon User-Agent and check restrictions', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'http.rb/5.3.0 (Mastodon/4.2.0; +https://mastodon.example.com/)',
			},
		} as FastifyRequest;

		mockInstancesRepository.findOneBy.mockResolvedValue(null);

		const result = await service.checkAccess(mockRequest);
		expect(result).toBeNull();
	});

	test('should block access from blocked hosts', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'http.rb/5.3.0 (Mastodon/4.2.0; +https://blocked.example.com/)',
			},
		} as FastifyRequest;

		mockUtilityService.isBlockedHost.mockReturnValue(true);

		const result = await service.checkAccess(mockRequest);
		expect(result).toEqual({
			blocked: true,
			reason: 'blocked',
			host: 'blocked.example.com',
		});
	});

	test('should block access from silenced hosts', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'http.rb/5.3.0 (Mastodon/4.2.0; +https://silenced.example.com/)',
			},
		} as FastifyRequest;

		mockUtilityService.isSilencedHost.mockReturnValue(true);
		mockInstancesRepository.findOneBy.mockResolvedValue({ quarantineLimited: false });

		const result = await service.checkAccess(mockRequest);
		expect(result).toEqual({
			blocked: true,
			reason: 'silenced',
			host: 'silenced.example.com',
		});
	});

	test('should block access from quarantined hosts', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'http.rb/5.3.0 (Mastodon/4.2.0; +https://quarantined.example.com/)',
			},
		} as FastifyRequest;

		mockInstancesRepository.findOneBy.mockResolvedValue({ quarantineLimited: true });

		const result = await service.checkAccess(mockRequest);
		expect(result).toEqual({
			blocked: true,
			reason: 'quarantined',
			host: 'quarantined.example.com',
		});
	});

	test('should detect Misskey User-Agent', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'Misskey/13.0.0 (https://misskey.example.com/)',
			},
		} as FastifyRequest;

		mockInstancesRepository.findOneBy.mockResolvedValue(null);

		const result = await service.checkAccess(mockRequest);
		expect(result).toBeNull();
	});

	test('should detect Pleroma User-Agent', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'Pleroma 2.5.0; https://pleroma.example.com <team@pleroma.example.com>',
			},
		} as FastifyRequest;

		mockInstancesRepository.findOneBy.mockResolvedValue(null);

		const result = await service.checkAccess(mockRequest);
		expect(result).toBeNull();
	});

	test('should ignore requests from own instance', async () => {
		const mockRequest = {
			headers: {
				'user-agent': 'Misskey/13.0.0 (https://test.example.com/)',
			},
		} as FastifyRequest;

		const result = await service.checkAccess(mockRequest);
		expect(result).toBeNull();
	});
});
