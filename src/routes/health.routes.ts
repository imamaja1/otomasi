import { FastifyInstance } from 'fastify';
import { HealthService } from '../modules/api/health.service';

const healthService = new HealthService();

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return healthService.getHealth();
  });

  app.get('/api/v1/system/metrics', async () => {
    return healthService.getMetrics();
  });

  app.get('/api/v1/system/stats', async () => {
    return healthService.getStats();
  });
}
