import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { adminAuthService } from '../modules/auth/admin-auth.service';
import { adminAuth, superAdminOnly } from '../middleware/admin-auth.middleware';

export async function adminRoutes(app: FastifyInstance) {
  app.post('/api/v1/admin/login', async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) return reply.code(400).send({ error: 'username and password required' });

    const result = await adminAuthService.login(username, password);
    if (!result) return reply.code(401).send({ error: 'Invalid credentials' });

    return reply.send(result);
  });

  app.get('/api/v1/admin/profile', { preHandler: adminAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send((req as any).admin);
  });

  app.get('/api/v1/admin/admins', { preHandler: [adminAuth, superAdminOnly] }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const admins = await adminAuthService.listAdmins();
    return reply.send(admins);
  });

  app.post('/api/v1/admin/admins', { preHandler: [adminAuth, superAdminOnly] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, password, role } = req.body as { username: string; password: string; role?: string };
    if (!username || !password) return reply.code(400).send({ error: 'username and password required' });

    const admin = await adminAuthService.createAdmin(username, password, role);
    return reply.code(201).send({ id: admin.id, username: admin.username, role: admin.role });
  });
}
