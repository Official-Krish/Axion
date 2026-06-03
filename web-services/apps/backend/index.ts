import express from "express";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import { sendError, logger } from "@axion/utilities";
import { redisConnection } from "@axion/utilities/redis";
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

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v2/user", UserRouter);
app.use("/api/v2/vmInstance", vmInstance);
app.use("/api/v2/vm", vm);
app.use("/api/v2/user/depin", depinVM);
app.use("/api/v2/indexer", indexerRouter);

const startTime = Date.now();

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

app.listen(3000, () => {
  logger.info("Backend server started", { port: 3000 });
});
