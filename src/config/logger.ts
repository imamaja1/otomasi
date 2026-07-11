import pino from 'pino';
import { env } from './env';

export const logger = pino({
  name: env.APP_NAME,
  level: env.APP_ENV === 'production' ? 'info' : 'debug',
  transport: env.APP_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});
