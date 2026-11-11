import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { onError } from "./middleware/error.js";
import { requestLog } from "./middleware/request-log.js";
import { healthRouter, metricsRouter } from "./routes/health.js";
import { v1Router } from "./routes/v1/index.js";

export const app = new Hono();

const allowedOrigins = (config.CORS_ORIGINS ?? "")
  .split(",")
  .map(o => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

/**
 * With CORS_ORIGINS unset every origin is allowed, which suits local work where
 * ports move around. Set it in any deployed environment: without it any website
 * can call this API from a visitor's browser.
 */
export function resolveCorsOrigin(origin: string): string | null {
  if (allowedOrigins.length === 0) return origin || "*";
  return allowedOrigins.includes(origin.replace(/\/$/, "")) ? origin : null;
}

app.use(
  "*",
  cors({
    origin: resolveCorsOrigin,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("*", requestLog);

app.route("/health", healthRouter);
app.route("/metrics", metricsRouter);
app.route("/api/v1", v1Router);

app.notFound((c) => c.json({ error: "not found" }, 404));
app.onError(onError);
