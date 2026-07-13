import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AiService } from '../modules/ai/ai.service';
import { AiRequest } from '../modules/ai/entities/ai-request.entity';
import { AppDataSource } from '../database/datasource';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const aiService = new AiService();

export async function aiRoutes(app: FastifyInstance) {
  app.get('/api/v1/ai/list', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const repo = AppDataSource.getRepository(AiRequest);
    const data = await repo.find({ order: { createdAt: 'DESC' }, take: 100 });
    return reply.send({ data });
  });

  app.post('/api/v1/ai/chat', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { message, context } = req.body as { message: string; context?: string };
    if (!message) return reply.code(400).send({ error: 'message is required' });

    const result = await aiService.chat(message, context);
    return reply.send(result);
  });

  app.post('/api/v1/ai/summarize', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { text, maxLength } = req.body as { text: string; maxLength?: number };
    if (!text) return reply.code(400).send({ error: 'text is required' });

    const result = await aiService.summarizeText(text, maxLength);
    return reply.send(result);
  });

  app.post('/api/v1/ai/classify', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { text, categories } = req.body as { text: string; categories: string[] };
    if (!text) return reply.code(400).send({ error: 'text is required' });

    const result = await aiService.classifyText(text, categories || []);
    return reply.send(result);
  });

  app.post('/api/v1/ai/process', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { text, operation } = req.body as { text: string; operation: string };
    if (!text || !operation) return reply.code(400).send({ error: 'text and operation are required' });

    const result = await aiService.processText(text, operation);
    return reply.send(result);
  });
}
