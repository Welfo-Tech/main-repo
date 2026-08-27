import { ApprovalMethod, QuoteStatus } from "@repo/db";
import { z } from "zod";

const LineItemSchema = z.object({
  sortOrder: z.number().int().optional(),
  itemType: z.enum(["PART", "LABOR", "SHIPPING", "OTHER"]),
  partId: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountPct: z.number().min(0).max(100).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  hsnCode: z.string().max(20).optional(),
  gstType: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).optional(),
});

export const CreateQuoteSchema = z.object({
  caseId: z.string().uuid(),
  validUntil: z.coerce.date().optional(),
  terms: z.string().optional(),
  lineItems: z.array(LineItemSchema).min(1),
});

export const UpdateQuoteSchema = z.object({
  status: z.nativeEnum(QuoteStatus).optional(),
  validUntil: z.coerce.date().nullable().optional(),
  terms: z.string().nullable().optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  approvalMethod: z.nativeEnum(ApprovalMethod).optional(),
  rejectionReason: z.string().optional(),
});

export const AddLineItemSchema = LineItemSchema;

export const ListQuotesQuerySchema = z.object({
  caseId: z.string().uuid().optional(),
  status: z.nativeEnum(QuoteStatus).optional(),
});
