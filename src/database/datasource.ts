import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { Application } from '../modules/auth/entities/application.entity';
import { ApiKey } from '../modules/auth/entities/api-key.entity';
import { Admin } from '../modules/auth/entities/admin.entity';
import { Template } from '../modules/email/entities/template.entity';
import { WhatsAppMessage } from '../modules/whatsapp/entities/whatsapp-message.entity';
import { WhatsAppAccount } from '../modules/whatsapp/entities/whatsapp-account.entity';
import { EmailMessage } from '../modules/email/entities/email-message.entity';
import { Notification } from '../modules/notification/entities/notification.entity';
import { Schedule } from '../modules/scheduler/entities/schedule.entity';
import { Webhook } from '../modules/webhook/entities/webhook.entity';
import { AiRequest } from '../modules/ai/entities/ai-request.entity';
import { Recommendation } from '../modules/recommendation/entities/recommendation.entity';
import { ApiLog } from '../modules/logging/entities/api-log.entity';
import { SystemLog } from '../modules/logging/entities/system-log.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.APP_ENV === 'development',
  logging: env.APP_ENV === 'development',
  entities: [
    Application,
    ApiKey,
    Admin,
    Template,
    WhatsAppMessage,
    WhatsAppAccount,
    EmailMessage,
    Notification,
    Schedule,
    Webhook,
    AiRequest,
    Recommendation,
    ApiLog,
    SystemLog,
  ],
  migrations: [],
  subscribers: [],
});
