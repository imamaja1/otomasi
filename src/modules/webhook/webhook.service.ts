import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { Webhook } from './entities/webhook.entity';
import { queueManager, QueueName } from '../queue/queue.manager';
import { logger } from '../../config/logger';

export class WebhookService {
  private webhookRepo: Repository<Webhook>;

  constructor() {
    this.webhookRepo = AppDataSource.getRepository(Webhook);
  }

  async receive(event: string, source: string, data: Record<string, unknown>, applicationId?: number): Promise<Webhook> {
    const webhook = this.webhookRepo.create({
      event,
      source,
      payload: data,
      applicationId,
      status: 'received',
    });
    const saved = await this.webhookRepo.save(webhook);

    try {
      const eventMap: Record<string, string> = {
        'booking.created': 'notification',
        'payment.success': 'notification',
        'student.registered': 'notification',
        'reminder.wedding': 'whatsapp',
        'school.announcement': 'email',
      };

      const jobType = eventMap[event] || 'notification';
      try {
        await queueManager.addJob(QueueName.NOTIFICATION, event, {
          webhookId: saved.id,
          event,
          source,
          data,
        });
        saved.status = 'processing';
        saved.processedAt = new Date();
      } catch {
        saved.status = 'received';
      }
      await this.webhookRepo.save(saved);

      logger.info({ event, source }, 'Webhook processed');
    } catch (err: any) {
      saved.status = 'failed';
      await this.webhookRepo.save(saved);
      logger.error(err, 'Webhook processing failed');
    }

    return saved;
  }

  async listWebhooks(page: number = 1, limit: number = 20, source?: string, applicationId?: number): Promise<{ data: Webhook[]; total: number }> {
    const where: any = {};
    if (source) where.source = source;
    if (applicationId) where.applicationId = applicationId;
    const [data, total] = await this.webhookRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total };
  }
}
