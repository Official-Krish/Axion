import type { Response } from "express";
import type { ZodError } from "zod";
import { AppError, ValidationError } from "./errors";
import { logger } from "./logger";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ success: true, data } satisfies ApiResponse<T>);
}

export function sendError(res: Response, err: unknown) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    } satisfies ApiResponse);
    return;
  }
  logger.error(
    "Unhandled error",
    err instanceof Error ? err : new Error(String(err)),
  );
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  } satisfies ApiResponse);
}

export function asyncHandler(
  fn: (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction,
  ) => Promise<void>,
) {
  return (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction,
  ) => {
    fn(req, res, next).catch(next);
  };
}

export function formatZodError(error: ZodError) {
  return error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
}

export function parseOrThrow<T>(
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: T;
      error?: ZodError;
    };
  },
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      "Invalid request body",
      formatZodError(result.error!),
    );
  }
  return result.data!;
}
