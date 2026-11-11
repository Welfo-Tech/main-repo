import type { Context } from "hono";
import { AppError } from "../lib/errors.js";
import { logger } from "../logger.js";

function safeLog(err: unknown) {
  try {
    logger.error({ err }, "unhandled error");
  } catch {
    logger.error({ message: String(err) }, "unhandled error (not serializable)");
  }
}

export function onError(err: Error, c: Context) {
  try {
    if (err instanceof AppError) {
      if (err.statusCode >= 500) safeLog(err);
      return c.json(
        { error: err.message },
        err.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
      );
    }
    safeLog(err);
    return c.json({ error: "internal server error" }, 500);
  } catch {
    return c.json({ error: "internal server error" }, 500);
  }
}
