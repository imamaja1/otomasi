import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WhatsAppService } from '../modules/whatsapp/whatsapp.service';
import { queueManager, QueueName } from '../modules/queue/queue.manager';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const whatsappService = new WhatsAppService();

export async function whatsappRoutes(app: FastifyInstance) {
  app.get('/api/v1/whatsapp/status', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const status = await whatsappService.getStatus();
    return reply.send(status);
  });

  app.post('/api/v1/whatsapp/send', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { to, message } = req.body as { to: string; message: string };
    if (!to || !message) return reply.code(400).send({ error: 'to and message are required' });

    const result = await whatsappService.sendMessage(to, message);

    if (result.status === 'pending') {
      try {
        await queueManager.addJob(QueueName.WHATSAPP, 'send_message', {
          to,
          message,
          messageId: result.id,
        });
      } catch {
      }
    }

    return reply.code(201).send(result);
  });

  app.post('/api/v1/whatsapp/session/logout', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    await whatsappService.logout();
    return reply.send({ message: 'Logged out' });
  });
}
