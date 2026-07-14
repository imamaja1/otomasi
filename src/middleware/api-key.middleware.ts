import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { AuthService } from '../modules/auth/auth.service';
import { env } from '../config/env';

const authService = new AuthService();

export async function apiKeyAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = (req.headers.authorization || '').replace('Bearer ', '');
  if (authHeader) {
    try {
      const decoded = jwt.verify(authHeader, env.JWT_SECRET) as any;
      if (decoded.id) {
        (req as any).admin = decoded;
        return;
      }
    } catch {}
  }

  const apiKey = (req.headers['x-api-key'] as string) || '';
  if (!apiKey) {
    return reply.code(401).send({ error: 'API Key or Admin Token is required' });
  }

  const validKey = await authService.validateApiKey(apiKey);
  if (!validKey) {
    return reply.code(401).send({ error: 'Invalid API Key' });
  }

  (req as any).apiKey = apiKey;
  (req as any).application = { id: validKey.applicationId, name: validKey.application.name };
}
