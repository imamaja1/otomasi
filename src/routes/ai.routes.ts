import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AiService } from '../modules/ai/ai.service';
import { AiRequest } from '../modules/ai/entities/ai-request.entity';
import { AppDataSource } from '../database/datasource';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const aiService = new AiService();

export async function aiRoutes(app: FastifyInstance) {
  app.get('/api/v1/ai/list', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const repo = AppDataSource.getRepository(AiRequest);
    const page = parseInt((req.query as any).page || '1');
    const limit = parseInt((req.query as any).limit || '50');
    const where: any = {};
    if (!(req as any).admin) where.applicationId = (req as any).application?.id;
    const [data, total] = await repo.findAndCount({ where, order: { createdAt: 'DESC' }, take: limit, skip: (page - 1) * limit });
    return reply.send({ data, total });
  });

  app.post('/api/v1/ai/chat', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { message, context } = req.body as { message: string; context?: string };
    if (!message) return reply.code(400).send({ error: 'message is required' });
    const result = await aiService.chat(message, context, (req as any).application?.id);
    return reply.send(result);
  });

  app.post('/api/v1/ai/summarize', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { text, maxLength } = req.body as { text: string; maxLength?: number };
    if (!text) return reply.code(400).send({ error: 'text is required' });
    const result = await aiService.summarizeText(text, maxLength, (req as any).application?.id);
    return reply.send(result);
  });

  app.post('/api/v1/ai/classify', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { text, categories } = req.body as { text: string; categories: string[] };
    if (!text) return reply.code(400).send({ error: 'text is required' });
    const result = await aiService.classifyText(text, categories || [], (req as any).application?.id);
    return reply.send(result);
  });

  app.post('/api/v1/ai/process', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { text, operation } = req.body as { text: string; operation: string };
    if (!text || !operation) return reply.code(400).send({ error: 'text and operation are required' });
    const result = await aiService.processText(text, operation, (req as any).application?.id);
    return reply.send(result);
  });
}
