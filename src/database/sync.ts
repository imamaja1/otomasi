import 'reflect-metadata';
import { AppDataSource } from '../database/datasource';
import { logger } from '../config/logger';

async function syncDatabase() {
  try {
    await AppDataSource.initialize();
    await AppDataSource.synchronize();
    logger.info('Database synced successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    logger.error(err, 'Failed to sync database');
    process.exit(1);
  }
}

syncDatabase();
