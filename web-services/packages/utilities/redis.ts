import IORedis from "ioredis";
import { type QueueOptions, Queue } from "bullmq";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
  connectTimeout: 10_000,
  keepAlive: 30_000,
  retryStrategy(times) {
    if (times > 10) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

export function getRedisConnection(): IORedis {
  return connection;
}

export function createQueue(name: string, opts?: Partial<QueueOptions>): Queue {
  return new Queue(name, { connection, ...opts });
}

export { connection as redisConnection };
