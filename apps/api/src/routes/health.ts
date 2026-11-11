import { Hono } from "hono";
import { registry } from "../metrics.js";

export const healthRouter = new Hono();

healthRouter.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export const metricsRouter = new Hono();

metricsRouter.get("/", async (c) => {
  const metrics = await registry.metrics();
  return c.text(metrics, 200, {
    "Content-Type": registry.contentType,
  });
});
