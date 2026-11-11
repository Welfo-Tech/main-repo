import { Hono } from "hono";
import { validate } from "../../../../lib/validate.js";
import { rateLimit } from "../../../../middleware/rate-limit.js";
import { decideOnQuote, getPortalQuote } from "../../../../services/portal-quote.service.js";
import { PortalQuoteQuerySchema, QuoteDecisionSchema } from "./schema.js";

export const portalQuotesRouter = new Hono();

portalQuotesRouter.get(
  "/",
  rateLimit({ name: "portal-quote", limit: 15, windowMs: 60_000 }),
  validate("query", PortalQuoteQuerySchema),
  async (c) => {
    const { ref, email } = c.req.valid("query");
    return c.json(await getPortalQuote(ref, email), 200);
  },
);

portalQuotesRouter.post(
  "/decision",
  rateLimit({ name: "quote-decision", limit: 8, windowMs: 600_000 }),
  validate("json", QuoteDecisionSchema),
  async (c) => {
    const { ref, email, decision, approverName, reason } = c.req.valid("json");
    const result = await decideOnQuote(ref, email, decision, approverName, reason);
    return c.json(result, 200);
  },
);
