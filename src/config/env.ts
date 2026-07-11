import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  APP_NAME: z.string().default('automation-server'),
  APP_PORT: z.string().default('3000'),
  APP_ENV: z.string().default('development'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('automation_server'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  JWT_SECRET: z.string().default('change-me-to-random-string'),
  WHATSAPP_SESSION_PATH: z.string().default('./sessions'),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  AI_SERVICE_URL: z.string().default(''),
});

export const env = envSchema.parse(process.env);
