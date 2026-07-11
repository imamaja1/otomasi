import { Queue, Worker, type JobsOptions } from 'bullmq';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export enum QueueName {
  WHATSAPP = 'whatsapp_queue',
  EMAIL = 'email_queue',
  NOTIFICATION = 'notification_queue',
  AI = 'ai_queue',
  REPORT = 'report_queue',
}

interface QueueConfig {
  name: QueueName;
  defaultJobOptions: JobsOptions;
}

const queueConfigs: QueueConfig[] = [
  {
    name: QueueName.WHATSAPP,
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 500 },
  },
  {
    name: QueueName.EMAIL,
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 }, removeOnComplete: 100, removeOnFail: 500 },
  },
  {
    name: QueueName.NOTIFICATION,
    defaultJobOptions: { attempts: 3, backoff: { type: 'fixed', delay: 2000 }, removeOnComplete: 100, removeOnFail: 500 },
  },
  {
    name: QueueName.AI,
    defaultJobOptions: { attempts: 2, backoff: { type: 'fixed', delay: 10000 }, removeOnComplete: 50, removeOnFail: 200 },
  },
  {
    name: QueueName.REPORT,
    defaultJobOptions: { attempts: 2, backoff: { type: 'fixed', delay: 30000 }, removeOnComplete: 50, removeOnFail: 200 },
  },
];

const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
};

class QueueManager {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private initialized: boolean = false;

  init() {
    if (this.initialized) return;
    try {
      queueConfigs.forEach((config) => {
        const queue = new Queue(config.name, { connection, defaultJobOptions: config.defaultJobOptions });
        this.queues.set(config.name, queue);
        logger.info(`Queue ${config.name} initialized`);
      });
      this.initialized = true;
    } catch (err: any) {
      logger.warn(`Queue initialization skipped: ${err.message}`);
    }
  }

  getQueue(name: QueueName): Queue {
    const queue = this.queues.get(name);
    if (!queue) throw new Error(`Queue ${name} not found`);
    return queue;
  }

  async addJob(queueName: QueueName, name: string, data: Record<string, unknown>, opts?: JobsOptions): Promise<string> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(name, data, opts);
    logger.info({ queue: queueName, jobId: job.id, name }, 'Job added');
    return job.id!;
  }

  registerWorker(queueName: QueueName, processor: (job: any) => Promise<void>, concurrency: number = 5) {
    const worker = new Worker(queueName, processor, { connection, concurrency });

    worker.on('completed', (job) => {
      logger.info({ queue: queueName, jobId: job?.id }, 'Job completed');
    });

    worker.on('failed', (job, err) => {
      logger.error({ queue: queueName, jobId: job?.id, error: err.message }, 'Job failed');
    });

    this.workers.set(queueName, worker);
    logger.info(`Worker registered for ${queueName}`);
    return worker;
  }

  async closeAll() {
    for (const [name, worker] of this.workers) {
      await worker.close();
      logger.info(`Worker ${name} closed`);
    }
    for (const [name, queue] of this.queues) {
      await queue.close();
      logger.info(`Queue ${name} closed`);
    }
  }
}

export const queueManager = new QueueManager();
