import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../modules/notification/notification.service';
import { Notification } from '../modules/notification/entities/notification.entity';
import { AppDataSource } from '../database/datasource';
import { queueManager, QueueName } from '../modules/queue/queue.manager';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const notificationService = new NotificationService();

export async function notificationRoutes(app: FastifyInstance) {
  app.get('/api/v1/notification/list', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const repo = AppDataSource.getRepository(Notification);
    const { page, limit, channel } = req.query as any;
    const where: any = {};
    if (channel) where.channel = channel;
    if (!(req as any).admin) where.applicationId = (req as any).application?.id;
    const [data, total] = await repo.findAndCount({
      where, order: { createdAt: 'DESC' }, take: parseInt(limit || '50'), skip: (parseInt(page || '1') - 1) * parseInt(limit || '50'),
    });
    return reply.send({ data, total });
  });

  app.post('/api/v1/notification/send', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { channel, recipient, title, body } = req.body as { channel: string; recipient: string; title: string; body: string };
    if (!channel || !recipient || !title || !body) return reply.code(400).send({ error: 'channel, recipient, title, and body are required' });
    if (!['whatsapp', 'email'].includes(channel)) return reply.code(400).send({ error: 'Invalid channel' });

    const appId = (req as any).application?.id;
    const result = await notificationService.send(channel, recipient, title, body, appId);

    try { await queueManager.addJob(QueueName.NOTIFICATION, 'send', { channel, recipient, title, body, notificationId: result.id }); } catch {}
    return reply.code(201).send(result);
  });
}
