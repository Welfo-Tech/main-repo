import { Hono } from "hono";
import { validate } from "../../../../lib/validate.js";
import { rateLimit } from "../../../../middleware/rate-limit.js";
import * as inquiryService from "../../../../services/web-inquiry.service.js";
import { SubmitInquirySchema, VerifySerialQuerySchema } from "./schema.js";

export const portalInquiriesRouter = new Hono();

portalInquiriesRouter.get(
  "/verify-serial",
  rateLimit({ name: "verify-serial", limit: 20, windowMs: 60_000 }),
  validate("query", VerifySerialQuerySchema),
  async (c) => {
    const { serial } = c.req.valid("query");
    const result = await inquiryService.verifySerial(serial);
    return c.json(result, 200);
  },
);

portalInquiriesRouter.post(
  "/",
  rateLimit({ name: "submit-inquiry", limit: 5, windowMs: 600_000 }),
  validate("json", SubmitInquirySchema),
  async (c) => {
    const data = c.req.valid("json");
    const result = await inquiryService.submitInquiry(data);
    return c.json(
      {
        inquiryNumber: result.inquiryNumber,
        uploads: result.uploads.map(u => ({ path: u.path, uploadUrl: u.uploadUrl })),
        message: "Request submitted successfully",
      },
      201,
    );
  },
);
