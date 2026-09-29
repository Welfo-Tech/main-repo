import { WebInquiryStatus } from "@repo/db";
import { z } from "zod";

export const ListInquiriesQuerySchema = z.object({
  status: z.nativeEnum(WebInquiryStatus).optional(),
});

export const UpdateInquirySchema = z.object({
  status: z.nativeEnum(WebInquiryStatus),
});
