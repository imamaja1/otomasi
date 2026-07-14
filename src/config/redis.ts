import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redis: Redis;
let redisAvailable = false;

function createRedisClient(): Redis {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
    maxRetriesPerRequest: null,
    lazyConnect: true,
    connectTimeout: 3000,
    retryStrategy(times) {
      if (times > 3) {
        redisAvailable = false;
        return undefined;
      }
      return Math.min(times * 200, 1000);
    },
  });

  client.on('connect', () => {
    redisAvailable = true;
    logger.info('Redis connected');
  });

  client.on('error', (err) => {
    logger.error(err, 'Redis error');
  });

  return client;
}

redis = createRedisClient();

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export default redis;
