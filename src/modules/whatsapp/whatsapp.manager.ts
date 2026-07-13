import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { WhatsAppAccount } from './entities/whatsapp-account.entity';
import { WhatsAppInstance } from './whatsapp.instance';
import { logger } from '../../config/logger';

class WhatsAppManager {
  private instances: Map<number, WhatsAppInstance> = new Map();
  private accountRepo: Repository<WhatsAppAccount>;

  constructor() {
    this.accountRepo = AppDataSource.getRepository(WhatsAppAccount);
  }

  async initAll(): Promise<void> {
    const accounts = await this.accountRepo.find({ where: { isActive: true } });
    for (const acc of accounts) {
      try {
        await this.initializeAccount(acc);
      } catch (err: any) {
        logger.error(`WhatsAppManager: Failed to init account ${acc.id} — ${err.message}`);
      }
    }
    logger.info(`WhatsAppManager: ${this.instances.size} accounts initialized`);
  }

  async initializeAccount(account: WhatsAppAccount): Promise<void> {
    if (this.instances.has(account.id)) return;
    const instance = new WhatsAppInstance({
      accountId: account.id,
      applicationId: account.applicationId,
      phoneNumber: account.phoneNumber,
      sessionPath: account.sessionPath,
    });
    this.instances.set(account.id, instance);
    await instance.initialize();
  }

  async createAccount(applicationId: number, phoneNumber: string): Promise<WhatsAppAccount> {
    const existing = await this.accountRepo.findOne({ where: { applicationId } });
    if (existing) throw new Error('Application already has a WhatsApp account');

    const account = this.accountRepo.create({
      applicationId,
      phoneNumber,
      sessionPath: `./sessions/${applicationId}`,
    });
    const saved = await this.accountRepo.save(account);
    await this.initializeAccount(saved);
    logger.info(`WhatsAppManager: Account ${saved.id} created for phone ${phoneNumber}`);
    return saved;
  }

  async deleteAccount(accountId: number): Promise<void> {
    const instance = this.instances.get(accountId);
    if (instance) {
      await instance.logout();
      this.instances.delete(accountId);
    }
    await this.accountRepo.update(accountId, { isActive: false });
    logger.info(`WhatsAppManager: Account ${accountId} deactivated`);
  }

  getInstance(accountId: number): WhatsAppInstance {
    const instance = this.instances.get(accountId);
    if (!instance) throw new Error(`WhatsApp account ${accountId} not initialized`);
    return instance;
  }

  getAccountForApp(applicationId: number): WhatsAppInstance | null {
    for (const [, instance] of this.instances) {
      if (instance.applicationId === applicationId && instance.isReady) return instance;
    }
    return null;
  }

  getAccountIdForApp(applicationId: number): number | null {
    for (const [id, instance] of this.instances) {
      if (instance.applicationId === applicationId) return id;
    }
    return null;
  }

  async listAccounts(applicationId?: number): Promise<WhatsAppAccount[]> {
    const where: any = {};
    if (applicationId) where.applicationId = applicationId;
    return this.accountRepo.find({ where });
  }

  async getAccountById(accountId: number): Promise<WhatsAppAccount | null> {
    return this.accountRepo.findOne({ where: { id: accountId } });
  }
}

export const whatsappManager = new WhatsAppManager();
