import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisConnection } from "./redis";

export interface RateLimiterConfig {
  windowMs?: number;
  max: number;
  message?: string;
  skip?: (req: unknown) => boolean;
}

export function createRateLimiter(config: RateLimiterConfig) {
  return rateLimit({
    windowMs: config.windowMs ?? 60_000,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: config.skip,
    store: new RedisStore({
      // @ts-expect-error - ioredis call() return type incompatibility with rate-limit-redis SendCommandFn
      sendCommand: (...args: string[]) =>
        redisConnection.call(args[0]!, ...args.slice(1)),
    }),
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: config.message ?? "Too many requests, please try again later",
      },
    },
  });
}

export const publicLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 20,
  message: "Too many requests on public endpoint, please try again later",
});

export const authLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 100,
  message: "Too many requests, please try again later",
});

export const indexerLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 500,
  message: "Too many requests on indexer endpoint, please try again later",
});

export const healthLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 200,
  message: "Too many health check requests, please try again later",
});

export const depinVerificationLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  message: "Too many verification requests, please try again later",
});
