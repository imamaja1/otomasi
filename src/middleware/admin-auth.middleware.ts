import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { adminAuthService } from '../modules/auth/admin-auth.service';

export async function adminAuth(req: FastifyRequest, reply: FastifyReply) {
  const auth = (req.headers.authorization || '').replace('Bearer ', '');
  if (!auth) return reply.code(401).send({ error: 'Token required' });

  try {
    const decoded = jwt.verify(auth, env.JWT_SECRET) as { id: number; username: string; role: string };
    const admin = await adminAuthService.validateToken(auth);
    if (!admin) return reply.code(401).send({ error: 'Admin deactivated' });
    (req as any).admin = decoded;
  } catch {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

export async function superAdminOnly(req: FastifyRequest, reply: FastifyReply) {
  const admin = (req as any).admin;
  if (admin?.role !== 'superadmin') {
    return reply.code(403).send({ error: 'Superadmin only' });
  }
}
