import { FastifyInstance } from 'fastify';
import { HealthService } from '../modules/api/health.service';
import { adminAuth } from '../middleware/admin-auth.middleware';

const healthService = new HealthService();

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return healthService.getHealth();
  });

  app.get('/api/v1/system/metrics', { preHandler: adminAuth }, async () => {
    return healthService.getMetrics();
  });

  app.get('/api/v1/system/stats', { preHandler: adminAuth }, async () => {
    return healthService.getStats();
  });
}
