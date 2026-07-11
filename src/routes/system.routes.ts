import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '../modules/logging/logging.service';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const loggingService = new LoggingService();

export async function systemRoutes(app: FastifyInstance) {
  app.get('/api/v1/system/logs', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { page, limit, level } = req.query as { page?: string; limit?: string; level?: string };
    const result = await loggingService.getSystemLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      level,
    );
    return reply.send(result);
  });

  app.get('/api/v1/system/api-logs', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await loggingService.getApiLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
    return reply.send(result);
  });
}
