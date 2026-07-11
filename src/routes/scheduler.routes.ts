import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SchedulerService } from '../modules/scheduler/scheduler.service';
import { apiKeyAuth } from '../middleware/api-key.middleware';

const schedulerService = new SchedulerService();

export async function schedulerRoutes(app: FastifyInstance) {
  app.post('/api/v1/scheduler', { preHandler: apiKeyAuth }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { name, cronExpression, jobType, jobData } = req.body as {
      name: string;
      cronExpression: string;
      jobType: string;
      jobData?: Record<string, unknown>;
    };

    if (!name || !cronExpression || !jobType) {
      return reply.code(400).send({ error: 'name, cronExpression, and jobType are required' });
    }

    const schedule = await schedulerService.createSchedule({ name, cronExpression, jobType, jobData });
    return reply.code(201).send(schedule);
  });
}
