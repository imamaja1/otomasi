import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../modules/auth/auth.service';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const authService = new AuthService();

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/v1/auth/register', { preHandler: adminAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { name, description } = req.body as { name: string; description?: string };
    if (!name) return reply.code(400).send({ error: 'Name is required' });

    const application = await authService.registerApplication(name, description);
    return reply.code(201).send(application);
  });

  app.post('/api/v1/auth/api-key', { preHandler: adminAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { applicationId, name, permissions } = req.body as {
      applicationId: number;
      name: string;
      permissions?: string[];
    };
    if (!applicationId || !name) {
      return reply.code(400).send({ error: 'applicationId and name are required' });
    }

    const result = await authService.generateApiKey(applicationId, name, permissions);
    return reply.code(201).send(result);
  });

  app.get('/api/v1/auth/applications', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const apps = await authService.listApplications();
    return reply.send(apps);
  });
}
