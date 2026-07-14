import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EmailService } from '../modules/email/email.service';
import { EmailMessage } from '../modules/email/entities/email-message.entity';
import { Template } from '../modules/email/entities/template.entity';
import { AppDataSource } from '../database/datasource';
import { queueManager, QueueName } from '../modules/queue/queue.manager';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const emailService = new EmailService();

export async function emailRoutes(app: FastifyInstance) {
  app.get('/api/v1/email/messages', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const repo = AppDataSource.getRepository(EmailMessage);
    const { page, limit, status } = req.query as any;
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (!(req as any).admin) where.applicationId = (req as any).application?.id;
    const [data, total] = await repo.findAndCount({
      where, order: { createdAt: 'DESC' }, take: parseInt(limit || '50'), skip: (parseInt(page || '1') - 1) * parseInt(limit || '50'),
    });
    return reply.send({ data, total });
  });

  app.post('/api/v1/email/send', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { to, subject, body, template, variables } = req.body as {
      to: string; subject?: string; body?: string; template?: string; variables?: Record<string, string>;
    };
    if (!to) return reply.code(400).send({ error: 'to is required' });

    let emailSubject = subject || '';
    let emailBody = body || '';
    if (template && variables) {
      const rendered = await emailService.renderTemplate(template, variables);
      emailSubject = rendered.subject;
      emailBody = rendered.body;
    }
    if (!emailBody) return reply.code(400).send({ error: 'body or template is required' });

    const appId = (req as any).application?.id;
    const result = await emailService.sendEmail(to, emailSubject, emailBody, appId);

    if (result.status === 'queued') {
      try { await queueManager.addJob(QueueName.EMAIL, 'send_email', { to, subject: emailSubject, body: emailBody, messageId: result.id }); } catch {}
    }
    return reply.code(201).send(result);
  });

  app.get('/api/v1/email/templates', { preHandler: apiKeyAuth }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const repo = AppDataSource.getRepository(Template);
    const data = await repo.find({ order: { createdAt: 'DESC' } });
    return reply.send({ data });
  });

  app.delete('/api/v1/email/templates/:id', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const repo = AppDataSource.getRepository(Template);
    await repo.delete(parseInt((req.params as any).id));
    return reply.send({ message: 'Template deleted' });
  });

  app.post('/api/v1/email/templates', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { name, type, body, subject } = req.body as { name: string; type: string; body: string; subject?: string };
    if (!name || !type || !body) return reply.code(400).send({ error: 'name, type, and body are required' });
    const template = await emailService.createTemplate(name, type, body, subject);
    return reply.code(201).send(template);
  });
}
