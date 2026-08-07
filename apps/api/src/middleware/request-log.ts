import { createMiddleware } from "hono/factory";
import { logger } from "../logger.js";

export const requestLog = createMiddleware(async (c, next) => {
  const start = Date.now();
  await next();
  logger.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: Date.now() - start,
  });
});
