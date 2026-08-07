import type { Context } from "hono";
import { AppError } from "../lib/errors.js";
import { logger } from "../logger.js";

export function onError(err: Error, c: Context) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, "server error");
    return c.json(
      { error: err.message },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
    );
  }
  logger.error({ err }, "unhandled error");
  return c.json({ error: "internal server error" }, 500);
}
