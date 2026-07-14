import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { WhatsAppMessage } from './entities/whatsapp-message.entity';
import { logger } from '../../config/logger';
import { whatsappManager } from './whatsapp.manager';

export class WhatsAppService {
  private messageRepo: Repository<WhatsAppMessage>;

  constructor() {
    this.messageRepo = AppDataSource.getRepository(WhatsAppMessage);
  }

  private getDefaultAccountId(): number | undefined {
    const first = whatsappManager.getAccountIdForApp(1);
    return first || undefined;
  }

  async sendMessage(to: string, message: string, accountId?: number, fromNumber?: string, applicationId?: number): Promise<{ id: number; status: string }> {
    const msg = this.messageRepo.create({ toNumber: to, message, accountId, fromNumber, applicationId, status: 'pending' });
    const saved = await this.messageRepo.save(msg);

    try {
      const instance = whatsappManager.getInstance(accountId || this.getDefaultAccountId() || 1);
      const { status } = await instance.sendMessage(to, message);
      if (status === 'sent') {
        saved.status = 'sent';
        saved.sentAt = new Date();
      }
      await this.messageRepo.save(saved);
    } catch (err: any) {
      saved.status = 'failed';
      saved.error = err.message;
      await this.messageRepo.save(saved);
    }

    return { id: saved.id, status: saved.status };
  }

  getQr(accountId?: number) {
    try {
      const instance = whatsappManager.getInstance(accountId || this.getDefaultAccountId() || 1);
      return instance.getQr();
    } catch {
      return null;
    }
  }

  async getQrImage(accountId?: number) {
    try {
      const instance = whatsappManager.getInstance(accountId || this.getDefaultAccountId() || 1);
      return instance.getQrImage();
    } catch {
      return null;
    }
  }

  async getStatus(accountId?: number) {
    try {
      const instance = whatsappManager.getInstance(accountId || this.getDefaultAccountId() || 1);
      return instance.getStatus();
    } catch {
      return { state: 'no_account', isReady: false, lastError: null };
    }
  }

  async updateMessageStatus(messageId: number, status: string, error?: string): Promise<void> {
    const update: Partial<WhatsAppMessage> = { status };
    if (status === 'sent') update.sentAt = new Date();
    if (error) update.error = error;
    await this.messageRepo.update(messageId, update);
  }

  async logout(accountId?: number): Promise<void> {
    const instance = whatsappManager.getInstance(accountId || this.getDefaultAccountId() || 1);
    await instance.logout();
  }
}

export const whatsappService = new WhatsAppService();
