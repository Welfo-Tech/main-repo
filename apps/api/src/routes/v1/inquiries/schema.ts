import { CasePriority, WebInquiryStatus } from "@repo/db";
import { z } from "zod";

export const ListInquiriesQuerySchema = z.object({
  status: z.nativeEnum(WebInquiryStatus).optional(),
});

export const UpdateInquirySchema = z.object({
  status: z.nativeEnum(WebInquiryStatus),
});

export const ConvertInquirySchema = z.object({
  organizationId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  createContactFromSubmitter: z.boolean().optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  intakeCondition: z.string().optional(),
});
