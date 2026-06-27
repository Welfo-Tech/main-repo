import type { Context } from "hono";
import { logger } from "../logger.js";

export function onError(err: Error, c: Context) {
  logger.error({ err }, "unhandled error");
  return c.json({ error: "internal server error" }, 500);
}
