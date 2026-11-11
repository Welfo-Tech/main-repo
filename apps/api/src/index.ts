import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

serve({ fetch: app.fetch, port: config.PORT }, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, "welfo api started");
});
