import { Hono } from "hono";
import { cors } from "hono/cors";
import { onError } from "./middleware/error.js";
import { requestLog } from "./middleware/request-log.js";
import { healthRouter, metricsRouter } from "./routes/health.js";
import { v1Router } from "./routes/v1/index.js";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
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
