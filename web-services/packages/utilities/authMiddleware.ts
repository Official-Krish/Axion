import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "./logger";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        email: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers["authorization"];
    const token = header?.startsWith("Bearer ") ? header.slice(7) : header;

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: "NO_TOKEN", message: "No token provided" },
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecret", {
      algorithms: ["HS256"],
    }) as { userId: string };

    if (!decoded.userId) {
      res.status(403).json({
        success: false,
        error: { code: "INVALID_PAYLOAD", message: "Invalid token payload" },
      });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error(
      "Auth error",
      error instanceof Error ? error : new Error(String(error)),
    );
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: { code: "TOKEN_EXPIRED", message: "Token expired" },
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid token",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "Error processing authentication",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
    });
  }
}
