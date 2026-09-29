import { Hono } from "hono";
import { validate } from "../../../../lib/validate.js";
import * as inquiryService from "../../../../services/web-inquiry.service.js";
import { SubmitInquirySchema } from "./schema.js";

export const portalInquiriesRouter = new Hono();

portalInquiriesRouter.post(
  "/",
  validate("json", SubmitInquirySchema),
  async (c) => {
    const data = c.req.valid("json");
    const inquiry = await inquiryService.submitInquiry(data);
    return c.json({ inquiryNumber: inquiry.inquiryNumber, message: "Inquiry submitted successfully" }, 201);
  },
);
