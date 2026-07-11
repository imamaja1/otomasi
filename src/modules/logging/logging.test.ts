import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoggingService } from './logging.service';
import { AppDataSource } from '../../database/datasource';

const mockSystemLogRepo = {
  create: vi.fn().mockImplementation((data: any) => data),
  save: vi.fn().mockImplementation((data: any) => Promise.resolve({ id: 1, ...data })),
  findAndCount: vi.fn().mockResolvedValue([[], 0]),
};

const mockApiLogRepo = {
  create: vi.fn().mockImplementation((data: any) => data),
  save: vi.fn().mockImplementation((data: any) => Promise.resolve({ id: 1, ...data })),
  findAndCount: vi.fn().mockResolvedValue([[], 0]),
};

vi.mock('../../database/datasource', () => ({
  AppDataSource: {
    getRepository: vi.fn((entity: any) => {
      if (entity.name === 'SystemLog') return mockSystemLogRepo;
      if (entity.name === 'ApiLog') return mockApiLogRepo;
      return null;
    }),
  },
}));

vi.mock('../../config/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LoggingService();
  });

  describe('systemLog', () => {
    it('creates and saves a system log', async () => {
      const data = { level: 'info', module: 'test', message: 'hello world' };
      const result = await service.systemLog(data);

      expect(mockSystemLogRepo.create).toHaveBeenCalledWith(data);
      expect(mockSystemLogRepo.save).toHaveBeenCalled();
      expect(result.message).toBe('hello world');
    });
  });

  describe('apiLog', () => {
    it('creates and saves an API log', async () => {
      const data = { method: 'POST', path: '/api/test', statusCode: 200 };
      const result = await service.apiLog(data);

      expect(mockApiLogRepo.create).toHaveBeenCalledWith(data);
      expect(mockApiLogRepo.save).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it('logs API errors with status >= 400', async () => {
      const data = { method: 'POST', path: '/api/test', statusCode: 500 };
      await service.apiLog(data);
      expect(mockApiLogRepo.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getSystemLogs', () => {
    it('returns paginated system logs', async () => {
      const result = await service.getSystemLogs(1, 10, 'error');
      expect(mockSystemLogRepo.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('getApiLogs', () => {
    it('returns paginated API logs', async () => {
      const result = await service.getApiLogs(1, 20);
      expect(mockApiLogRepo.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({ data: [], total: 0 });
    });
  });
});
