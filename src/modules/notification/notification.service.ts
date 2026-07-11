import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { Notification } from './entities/notification.entity';
import { whatsappService } from '../whatsapp/whatsapp.service';
import { EmailService } from '../email/email.service';
import { logger } from '../../config/logger';

export class NotificationService {
  private notificationRepo: Repository<Notification>;
  private emailService: EmailService;

  constructor() {
    this.notificationRepo = AppDataSource.getRepository(Notification);
    this.emailService = new EmailService();
  }

  async send(
    channel: string,
    recipient: string,
    title: string,
    body: string,
    applicationId?: number,
  ): Promise<Notification> {
    const notif = this.notificationRepo.create({
      channel,
      recipient,
      title,
      body,
      applicationId,
      status: 'pending',
    });
    const saved = await this.notificationRepo.save(notif);
    return saved;
  }

  async dispatch(channel: string, data: { recipient: string; title: string; body: string }): Promise<void> {
    if (channel === 'whatsapp') {
      await whatsappService.sendMessage(data.recipient, `${data.title}\n\n${data.body}`);
    } else if (channel === 'email') {
      await this.emailService.sendEmail(data.recipient, data.title, data.body);
    }
  }

  async updateStatus(id: number, status: string): Promise<void> {
    const update: Partial<Notification> = { status };
    if (status === 'sent') update.sentAt = new Date();
    await this.notificationRepo.update(id, update);
    logger.info(`Notification ${id} status updated to ${status}`);
  }
}
