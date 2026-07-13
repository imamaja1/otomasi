import 'reflect-metadata';
import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { AppDataSource } from './database/datasource';
import redis, { isRedisAvailable } from './config/redis';
import { registerAllWorkers } from './workers/workers';
import { queueManager } from './modules/queue/queue.manager';
import { whatsappManager } from './modules/whatsapp/whatsapp.manager';
import { SchedulerService } from './modules/scheduler/scheduler.service';
import { adminAuthService } from './modules/auth/admin-auth.service';

const schedulerService = new SchedulerService();

async function start() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected');

    try {
      await redis.connect();
    } catch {
      logger.warn('Redis unavailable — Queue/Worker disabled');
    }

    if (isRedisAvailable()) {
      queueManager.init();
      registerAllWorkers();
      logger.info('Workers registered');
    }

    await schedulerService.loadSchedules();
    logger.info('Schedules loaded');

    try {
      await whatsappManager.initAll();
    } catch (err: any) {
      logger.warn(`WhatsApp init skipped: ${err.message}`);
    }

    await adminAuthService.seedDefault();

    const app = await buildApp();

    await app.listen({
      port: parseInt(env.APP_PORT),
      host: '0.0.0.0',
    });

    logger.info(`${env.APP_NAME} running on port ${env.APP_PORT}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  schedulerService.stopAll();
  await AppDataSource.destroy();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  schedulerService.stopAll();
  await AppDataSource.destroy();
  redis.disconnect();
  process.exit(0);
});

start();
