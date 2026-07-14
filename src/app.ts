import { fastify } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fjwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { env } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { whatsappRoutes } from './routes/whatsapp.routes';
import { emailRoutes } from './routes/email.routes';
import { notificationRoutes } from './routes/notification.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { schedulerRoutes } from './routes/scheduler.routes';
import { systemRoutes } from './routes/system.routes';
import { aiRoutes } from './routes/ai.routes';
import { recommendationRoutes } from './routes/recommendation.routes';
import { healthRoutes } from './routes/health.routes';
import { adminRoutes } from './routes/admin.routes';
import { LoggingService } from './modules/logging/logging.service';

const loggingService = new LoggingService();

export async function buildApp() {
  const app = fastify({
    logger: env.APP_ENV !== 'production',
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(fjwt, {
    secret: env.JWT_SECRET,
  });

  app.addHook('onResponse', async (req, reply) => {
    loggingService.apiLog({
      method: req.method,
      path: req.url,
      statusCode: reply.statusCode,
      duration: Math.round(reply.elapsedTime),
      ip: req.ip,
    }).catch(() => {});
  });

  app.get('/ping', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(whatsappRoutes);
  await app.register(emailRoutes);
  await app.register(notificationRoutes);
  await app.register(webhookRoutes);
  await app.register(schedulerRoutes);
  await app.register(systemRoutes);
  await app.register(aiRoutes);
  await app.register(recommendationRoutes);
  await app.register(adminRoutes);

  const adminDist = path.resolve(__dirname, '..', 'dist-admin');
  await app.register(fastifyStatic, {
    root: adminDist,
    prefix: '/admin/',
    wildcard: false,
    index: false,
  });

  app.setNotFoundHandler((req, reply) => {
    if ((req as any).url.startsWith('/admin')) {
      return reply.sendFile('index.html', adminDist);
    }
    reply.code(404).send({ error: 'Not found' });
  });

  return app;
}
