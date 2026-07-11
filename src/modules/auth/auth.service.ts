import crypto from 'crypto';
import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { Application } from './entities/application.entity';
import { ApiKey } from './entities/api-key.entity';

export class AuthService {
  private appRepo: Repository<Application>;
  private apiKeyRepo: Repository<ApiKey>;

  constructor() {
    this.appRepo = AppDataSource.getRepository(Application);
    this.apiKeyRepo = AppDataSource.getRepository(ApiKey);
  }

  async registerApplication(name: string, description?: string): Promise<Application> {
    const app = this.appRepo.create({ name, description });
    return this.appRepo.save(app);
  }

  async generateApiKey(applicationId: number, name: string, permissions: string[] = []): Promise<{ key: string; apiKey: ApiKey }> {
    const key = `ak_${crypto.randomBytes(32).toString('hex')}`;
    const apiKey = this.apiKeyRepo.create({
      applicationId,
      key,
      name,
      permissions,
    });
    await this.apiKeyRepo.save(apiKey);
    return { key, apiKey };
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { key, isActive: true },
      relations: { application: true },
    });

    if (!apiKey) return null;

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    await this.apiKeyRepo.update(apiKey.id, { lastUsedAt: new Date() });

    return apiKey;
  }

  async revokeApiKey(id: number): Promise<void> {
    await this.apiKeyRepo.update(id, { isActive: false });
  }

  async listApplications(): Promise<Application[]> {
    return this.appRepo.find({ where: { isActive: true } });
  }
}
