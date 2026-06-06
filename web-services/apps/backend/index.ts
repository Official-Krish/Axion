import express from "express";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import type { Server } from "http";
import { sendError, logger } from "@axion/utilities";
import { redisConnection } from "@axion/utilities/redis";
import {
  publicLimiter,
  authLimiter,
  indexerLimiter,
  healthLimiter,
  depinVerificationLimiter,
  deployLimiter,
  registerLimiter,
  claimSOLLimiter,
} from "@axion/utilities/rateLimiter";
import prisma from "@axion/db";
import UserRouter from "./routes/user";
import vmInstance from "./routes/vmInstance";
import vm from "./routes/vm";
import depinVM from "./routes/depinVm";
import indexerRouter from "./routes/indexer";

process.on("unhandledRejection", (reason) => {
  logger.error(
    "Unhandled Rejection",
    reason instanceof Error ? reason : new Error(String(reason)),
  );
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
});

const startTime = Date.now();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v2/user/signup", publicLimiter);
app.use("/api/v2/user/login", publicLimiter);
app.use("/api/v2/user/depin/depinVerification", depinVerificationLimiter);
app.use("/api/v2/user/depin/deploy", deployLimiter);
app.use("/api/v2/user/depin/register", registerLimiter);
app.use("/api/v2/user/depin/claimSOL", claimSOLLimiter);
app.use("/api/v2/indexer", indexerLimiter);
app.use("/api/v2/user", authLimiter);
app.use("/api/v2/vmInstance", authLimiter);
app.use("/api/v2/vm", authLimiter);
app.use("/api/v2/user/depin", authLimiter);

app.use("/api/v2/user", UserRouter);
app.use("/api/v2/vmInstance", vmInstance);
app.use("/api/v2/vm", vm);
app.use("/api/v2/user/depin", depinVM);
app.use("/api/v2/indexer", indexerRouter);
app.use("/api/v2/health", healthLimiter);

app.get("/api/v2/health", async (_req: Request, res: Response) => {
  let dbStatus: "connected" | "error" = "connected";
  let redisStatus: "connected" | "error" = "connected";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  try {
    await redisConnection.ping();
  } catch {
    redisStatus = "error";
  }

  const allOk = dbStatus === "connected" && redisStatus === "connected";
  const status = allOk ? "ok" : "degraded";

  res.json({
    status,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    version: "1.2.0",
    services: { database: dbStatus, redis: redisStatus },
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled route error", err);
  sendError(res, err);
});

const server: Server = app.listen(3000, () => {
  logger.info("Backend server started", { port: 3000 });
});

function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed");
    prisma.$disconnect().finally(() => {
      redisConnection.quit();
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
