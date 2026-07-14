import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RecommendationService } from '../modules/recommendation/recommendation.service';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const recommendationService = new RecommendationService();

export async function recommendationRoutes(app: FastifyInstance) {
  app.post('/api/v1/recommend', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { interest, userId } = req.body as { interest: string; userId?: string };
    if (!interest) return reply.code(400).send({ error: 'interest is required' });
    const result = await recommendationService.recommend(interest, userId, (req as any).application?.id);
    return reply.send(result);
  });

  app.get('/api/v1/recommend/history', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { userId, page, limit } = req.query as { userId?: string; page?: string; limit?: string };
    const result = await recommendationService.getHistory(
      userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20,
    );
    return reply.send(result);
  });
}
