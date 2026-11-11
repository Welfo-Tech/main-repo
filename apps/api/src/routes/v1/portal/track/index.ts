import { Hono } from "hono";
import { validate } from "../../../../lib/validate.js";
import { rateLimit } from "../../../../middleware/rate-limit.js";
import { trackRequest } from "../../../../services/tracking.service.js";
import { TrackQuerySchema } from "./schema.js";

export const portalTrackRouter = new Hono();

portalTrackRouter.get(
  "/",
  rateLimit({ name: "track", limit: 15, windowMs: 60_000 }),
  validate("query", TrackQuerySchema),
  async (c) => {
    const { ref, email } = c.req.valid("query");
    return c.json(await trackRequest(ref, email), 200);
  },
);
