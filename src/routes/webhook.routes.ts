import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebhookService } from '../modules/webhook/webhook.service';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const webhookService = new WebhookService();

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/api/v1/webhook/receive', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { event, source, data } = req.body as {
      event: string;
      source: string;
      data: Record<string, unknown>;
    };

    if (!event || !source) {
      return reply.code(400).send({ error: 'event and source are required' });
    }

    const applicationId = (req as any).application?.id;
    const result = await webhookService.receive(event, source, data || {}, applicationId);
    return reply.code(201).send(result);
  });

  app.get('/api/v1/webhook', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { page, limit, source, applicationId } = req.query as { page?: string; limit?: string; source?: string; applicationId?: string };
    const result = await webhookService.listWebhooks(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      source,
      applicationId ? parseInt(applicationId) : undefined,
    );
    return reply.send(result);
  });
}
