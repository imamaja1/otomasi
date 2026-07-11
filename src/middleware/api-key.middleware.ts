import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../modules/auth/auth.service';

const authService = new AuthService();

interface ApiKeyAuthRequest extends FastifyRequest {
  apiKey?: string;
  application?: { id: number; name: string };
}

export async function apiKeyAuth(req: ApiKeyAuthRequest, reply: FastifyReply) {
  const apiKey = (req.headers['x-api-key'] as string) || '';

  if (!apiKey) {
    return reply.code(401).send({ error: 'API Key is required' });
  }

  const validKey = await authService.validateApiKey(apiKey);

  if (!validKey) {
    return reply.code(401).send({ error: 'Invalid API Key' });
  }

  req.apiKey = apiKey;
  req.application = { id: validKey.applicationId, name: validKey.application.name };
}
