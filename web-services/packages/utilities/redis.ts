import IORedis from "ioredis";
import { type QueueOptions, Queue } from "bullmq";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

export function getRedisConnection(): IORedis {
  return connection;
}

export function createQueue(name: string, opts?: Partial<QueueOptions>): Queue {
  return new Queue(name, { connection, ...opts });
}

export { connection as redisConnection };
