import { type Repository } from 'typeorm';
import cron, { type ScheduledTask } from 'node-cron';
import { AppDataSource } from '../../database/datasource';
import { Schedule } from './entities/schedule.entity';
import { queueManager, QueueName } from '../queue/queue.manager';
import { logger } from '../../config/logger';

export class SchedulerService {
  private scheduleRepo: Repository<Schedule>;
  private tasks: Map<number, ScheduledTask> = new Map();

  constructor() {
    this.scheduleRepo = AppDataSource.getRepository(Schedule);
  }

  async loadSchedules(): Promise<void> {
    const schedules = await this.scheduleRepo.find({ where: { isActive: true } });
    for (const schedule of schedules) {
      this.startSchedule(schedule);
    }
    logger.info(`Loaded ${schedules.length} schedules`);
  }

  startSchedule(schedule: Schedule): void {
    if (!cron.validate(schedule.cronExpression)) {
      logger.error(`Invalid cron expression for schedule ${schedule.id}: ${schedule.cronExpression}`);
      return;
    }

    const task = cron.schedule(schedule.cronExpression, async () => {
      try {
        logger.info(`Running schedule: ${schedule.name}`);

        const queueMap: Record<string, QueueName> = {
          whatsapp: QueueName.WHATSAPP,
          email: QueueName.EMAIL,
          notification: QueueName.NOTIFICATION,
          ai: QueueName.AI,
          report: QueueName.REPORT,
        };

        const queueName = queueMap[schedule.jobType] || QueueName.NOTIFICATION;
        await queueManager.addJob(queueName, schedule.name, {
          scheduleId: schedule.id,
          ...(schedule.jobData || {}),
        });

        await this.scheduleRepo.update(schedule.id, { lastRunAt: new Date() });
        logger.info(`Schedule ${schedule.name} completed`);
      } catch (err: any) {
        logger.error(err, `Schedule ${schedule.name} failed`);
      }
    });

    this.tasks.set(schedule.id, task);
    logger.info(`Schedule ${schedule.name} started (${schedule.cronExpression})`);
  }

  stopSchedule(id: number): void {
    const task = this.tasks.get(id);
    if (task) {
      task.stop();
      this.tasks.delete(id);
      logger.info(`Schedule ${id} stopped`);
    }
  }

  async createSchedule(data: { name: string; cronExpression: string; jobType: string; jobData?: Record<string, unknown> }): Promise<Schedule> {
    const schedule = this.scheduleRepo.create(data);
    const saved = await this.scheduleRepo.save(schedule);
    this.startSchedule(saved);
    return saved;
  }

  stopAll(): void {
    for (const task of this.tasks.values()) {
      task.stop();
    }
    this.tasks.clear();
    logger.info('All schedules stopped');
  }
}
