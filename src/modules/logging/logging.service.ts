import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { SystemLog } from './entities/system-log.entity';
import { ApiLog } from './entities/api-log.entity';
import { logger } from '../../config/logger';

export class LoggingService {
  private systemLogRepo: Repository<SystemLog>;
  private apiLogRepo: Repository<ApiLog>;

  constructor() {
    this.systemLogRepo = AppDataSource.getRepository(SystemLog);
    this.apiLogRepo = AppDataSource.getRepository(ApiLog);
  }

  async systemLog(data: { level: string; module: string; message: string; metadata?: Record<string, unknown> }): Promise<SystemLog> {
    const log = this.systemLogRepo.create(data);
    return this.systemLogRepo.save(log);
  }

  async apiLog(data: {
    applicationId?: number;
    method: string;
    path: string;
    statusCode: number;
    duration?: number;
    ip?: string;
  }): Promise<ApiLog> {
    const log = this.apiLogRepo.create(data);

    if (data.statusCode >= 400) {
      logger.warn(data, `API ${data.method} ${data.path} → ${data.statusCode}`);
    }

    return this.apiLogRepo.save(log);
  }

  async getSystemLogs(page: number = 1, limit: number = 50, level?: string): Promise<{ data: SystemLog[]; total: number }> {
    const where: any = {};
    if (level) where.level = level;

    const [data, total] = await this.systemLogRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total };
  }

  async getApiLogs(page: number = 1, limit: number = 50): Promise<{ data: ApiLog[]; total: number }> {
    const [data, total] = await this.apiLogRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total };
  }
}
