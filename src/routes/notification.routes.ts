import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../modules/notification/notification.service';
import { queueManager, QueueName } from '../modules/queue/queue.manager';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const notificationService = new NotificationService();

export async function notificationRoutes(app: FastifyInstance) {
  app.post('/api/v1/notification/send', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { channel, recipient, title, body } = req.body as {
      channel: string;
      recipient: string;
      title: string;
      body: string;
    };

    if (!channel || !recipient || !title || !body) {
      return reply.code(400).send({ error: 'channel, recipient, title, and body are required' });
    }

    const validChannels = ['whatsapp', 'email'];
    if (!validChannels.includes(channel)) {
      return reply.code(400).send({ error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` });
    }

    const result = await notificationService.send(channel, recipient, title, body);

    try {
      await queueManager.addJob(QueueName.NOTIFICATION, 'send', {
        channel,
        recipient,
        title,
        body,
        notificationId: result.id,
      });
    } catch {
    }

    return reply.code(201).send(result);
  });
}
