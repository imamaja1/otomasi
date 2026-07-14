import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { whatsappService } from '../modules/whatsapp/whatsapp.service';
import { whatsappManager } from '../modules/whatsapp/whatsapp.manager';
import { AppDataSource } from '../database/datasource';
import { WhatsAppMessage } from '../modules/whatsapp/entities/whatsapp-message.entity';
import { queueManager, QueueName } from '../modules/queue/queue.manager';
import { apiKeyAuth } from '../middleware/api-key.middleware';

export async function whatsappRoutes(app: FastifyInstance) {
  app.get('/api/v1/whatsapp/messages', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const repo = AppDataSource.getRepository(WhatsAppMessage);
    const { page, limit, status } = req.query as any;
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    const [data, total] = await repo.findAndCount({
      where, order: { createdAt: 'DESC' }, take: parseInt(limit || '50'), skip: (parseInt(page || '1') - 1) * parseInt(limit || '50'),
    });
    return reply.send({ data, total });
  });

  app.get('/api/v1/whatsapp/accounts', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const appId = (req as any).application?.id || undefined;
    const accounts = await whatsappManager.listAccounts(appId);
    return reply.send(accounts.map((a) => ({
      id: a.id, applicationId: a.applicationId, phoneNumber: a.phoneNumber, isActive: a.isActive, createdAt: a.createdAt,
    })));
  });

  app.post('/api/v1/whatsapp/accounts', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { phoneNumber, applicationId } = req.body as any;
    if (!phoneNumber) return reply.code(400).send({ error: 'phoneNumber is required' });
    const appId = (req as any).application?.id || applicationId;
    if (!appId) return reply.code(400).send({ error: 'applicationId is required' });
    try {
      const account = await whatsappManager.createAccount(appId, phoneNumber);
      return reply.code(201).send(account);
    } catch (err: any) {
      return reply.code(409).send({ error: err.message });
    }
  });

  app.get('/api/v1/whatsapp/accounts/:accountId', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const accountId = parseInt((req.params as any).accountId);
    const account = await whatsappManager.getAccountById(accountId);
    if (!account) return reply.code(404).send({ error: 'Account not found' });
    const appId = (req as any).application?.id;
    if (account.applicationId !== appId) return reply.code(403).send({ error: 'Not your account' });
    return reply.send(account);
  });

  app.delete('/api/v1/whatsapp/accounts/:accountId', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const accountId = parseInt((req.params as any).accountId);
    const account = await whatsappManager.getAccountById(accountId);
    if (!account) return reply.code(404).send({ error: 'Account not found' });
    const appId = (req as any).application?.id;
    if (account.applicationId !== appId) return reply.code(403).send({ error: 'Not your account' });
    await whatsappManager.deleteAccount(accountId);
    return reply.send({ message: `Account ${accountId} deactivated` });
  });

  app.get('/api/v1/whatsapp/accounts/:accountId/qr', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const accountId = parseInt((req.params as any).accountId);
    const account = await whatsappManager.getAccountById(accountId);
    if (!account) return reply.code(404).send({ error: 'Account not found' });
    const appId = (req as any).application?.id;
    if (account.applicationId !== appId) return reply.code(403).send({ error: 'Not your account' });
    const instance = whatsappManager.getInstance(accountId);
    return reply.send(instance.getQr());
  });

  app.get('/api/v1/whatsapp/accounts/:accountId/qr-image', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: any) => {
    const accountId = parseInt((req.params as any).accountId);
    const account = await whatsappManager.getAccountById(accountId);
    if (!account) return reply.code(404).send({ error: 'Account not found' });
    const appId = (req as any).application?.id;
    if (account.applicationId !== appId) return reply.code(403).send({ error: 'Not your account' });
    const instance = whatsappManager.getInstance(accountId);
    const image = await instance.getQrImage();
    if (!image) return reply.code(404).send({ error: 'QR not available' });
    return reply.type('image/png').send(image);
  });

  app.get('/api/v1/whatsapp/accounts/:accountId/status', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const accountId = parseInt((req.params as any).accountId);
    const account = await whatsappManager.getAccountById(accountId);
    if (!account) return reply.code(404).send({ error: 'Account not found' });
    const appId = (req as any).application?.id;
    if (account.applicationId !== appId) return reply.code(403).send({ error: 'Not your account' });
    const instance = whatsappManager.getInstance(accountId);
    return reply.send(instance.getStatus());
  });

  app.post('/api/v1/whatsapp/accounts/:accountId/send', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { to, message } = req.body as any;
    if (!to || !message) return reply.code(400).send({ error: 'to and message are required' });
    const accountId = parseInt((req.params as any).accountId);
    const account = await whatsappManager.getAccountById(accountId);
    if (!account) return reply.code(404).send({ error: 'Account not found' });
    const appId = (req as any).application?.id;
    if (account.applicationId !== appId) return reply.code(403).send({ error: 'Not your account' });
    const instance = whatsappManager.getInstance(accountId);
    const result = await whatsappService.sendMessage(to, message, accountId, instance.phoneNumber);
    if (result.status === 'pending') {
      try { await queueManager.addJob(QueueName.WHATSAPP, 'send_message', { to, message, messageId: result.id, accountId }); } catch {}
    }
    return reply.code(201).send(result);
  });

  app.get('/api/v1/whatsapp/qr-image', { preHandler: apiKeyAuth }, async (_req, reply: any) => {
    const image = await whatsappService.getQrImage();
    if (!image) return reply.code(404).send({ error: 'QR not available' });
    return reply.type('image/png').send(image);
  });

  app.get('/api/v1/whatsapp/qr', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(whatsappService.getQr());
  });

  app.get('/api/v1/whatsapp/status', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const status = await whatsappService.getStatus();
    return reply.send(status);
  });

  app.post('/api/v1/whatsapp/send', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { to, message } = req.body as any;
    if (!to || !message) return reply.code(400).send({ error: 'to and message are required' });
    const appId = (req as any).application?.id;
    const accountId = whatsappManager.getAccountIdForApp(appId);
    const result = await whatsappService.sendMessage(to, message, accountId || undefined);
    if (result.status === 'pending' && accountId) {
      try { await queueManager.addJob(QueueName.WHATSAPP, 'send_message', { to, message, messageId: result.id, accountId }); } catch {}
    }
    return reply.code(201).send(result);
  });

  app.post('/api/v1/whatsapp/session/logout', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    await whatsappService.logout();
    return reply.send({ message: 'Logged out' });
  });
}
