import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as inquiryService from "../../../services/web-inquiry.service.js";
import { ListInquiriesQuerySchema, UpdateInquirySchema } from "./schema.js";

export const inquiriesRouter = new Hono();

inquiriesRouter.use(requireAuth);
inquiriesRouter.use(requireRole("ADMIN", "OPERATIONS"));

inquiriesRouter.get(
  "/",
  validate("query", ListInquiriesQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const inquiries = await inquiryService.listInquiries(query, c.get("user"));
    return c.json(inquiries, 200);
  },
);

inquiriesRouter.get("/:id", async (c) => {
  const inquiry = await inquiryService.getInquiry(c.req.param("id")!, c.get("user"));
  return c.json(inquiry, 200);
});

inquiriesRouter.patch(
  "/:id",
  validate("json", UpdateInquirySchema),
  async (c) => {
    const { status } = c.req.valid("json");
    const inquiry = await inquiryService.updateInquiry(c.req.param("id")!, status, c.get("user"));
    return c.json(inquiry, 200);
  },
);
