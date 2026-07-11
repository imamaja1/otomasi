import { AppDataSource } from '../../database/datasource';
import { isRedisAvailable } from '../../config/redis';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

const whatsappService = new WhatsAppService();

export class HealthService {
  async getHealth() {
    const dbOk = AppDataSource.isInitialized;
    const waStatus = await whatsappService.getStatus();

    return {
      status: dbOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbOk ? 'connected' : 'disconnected',
        redis: isRedisAvailable() ? 'connected' : 'unavailable',
        whatsapp: waStatus.isReady ? 'ready' : 'offline',
      },
    };
  }

  async getStats() {
    const tables = [
      'applications', 'api_keys', 'whatsapp_messages', 'email_messages',
      'notifications', 'webhooks', 'schedules', 'ai_requests', 'recommendations',
      'api_logs', 'system_logs',
    ];

    const counts: Record<string, number> = {};
    for (const table of tables) {
      try {
        const result = await AppDataSource.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        counts[table] = (result[0] as any).count;
      } catch {
        counts[table] = 0;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessages = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM \`whatsapp_messages\` WHERE created_at >= ?`,
      [today],
    );
    const todayEmails = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM \`email_messages\` WHERE created_at >= ?`,
      [today],
    );
    const todayWebhooks = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM \`webhooks\` WHERE created_at >= ?`,
      [today],
    );

    return {
      timestamp: new Date().toISOString(),
      database: {
        tables: counts,
        totalRecords: Object.values(counts).reduce((a: number, b: number) => a + Number(b), 0),
      },
      today: {
        messages: (todayMessages[0] as any).count,
        emails: (todayEmails[0] as any).count,
        webhooks: (todayWebhooks[0] as any).count,
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  async getMetrics() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.version,
      platform: process.platform,
      memory: {
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      services: {
        database: AppDataSource.isInitialized ? 'up' : 'down',
        redis: isRedisAvailable() ? 'up' : 'down',
      },
    };
  }
}
