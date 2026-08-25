import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as quoteService from "../../../services/quote.service.js";
import {
  AddLineItemSchema,
  CreateQuoteSchema,
  ListQuotesQuerySchema,
  UpdateQuoteSchema,
} from "./schema.js";

export const quotesRouter = new Hono();

quotesRouter.use(requireAuth);

quotesRouter.get(
  "/",
  validate("query", ListQuotesQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const quotes = await quoteService.listQuotes(query, c.get("user"));
    return c.json(quotes, 200);
  },
);

quotesRouter.get("/:id", async (c) => {
  const q = await quoteService.getQuote(c.req.param("id"), c.get("user"));
  return c.json(q, 200);
});

quotesRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateQuoteSchema),
  async (c) => {
    const data = c.req.valid("json");
    const q = await quoteService.openQuote(data, c.get("user"));
    return c.json(q, 201);
  },
);

quotesRouter.patch(
  "/:id",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateQuoteSchema),
  async (c) => {
    const data = c.req.valid("json");
    const q = await quoteService.editQuote(c.req.param("id"), data, c.get("user"));
    return c.json(q, 200);
  },
);

quotesRouter.post(
  "/:id/line-items",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", AddLineItemSchema),
  async (c) => {
    const data = c.req.valid("json");
    const item = await quoteService.addItem(c.req.param("id"), data, c.get("user"));
    return c.json(item, 201);
  },
);

quotesRouter.delete(
  "/:id/line-items/:itemId",
  requireRole("ADMIN", "OPERATIONS"),
  async (c) => {
    await quoteService.removeItem(c.req.param("id"), c.req.param("itemId"), c.get("user"));
    return c.body(null, 204);
  },
);
