import { InvoiceStatus } from "@repo/db";
import { z } from "zod";

export const CreateInvoiceSchema = z.object({
  caseId: z.string().uuid(),
  quoteId: z.string().uuid().optional(),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  paymentTerms: z.string().optional(),
});

export const UpdateInvoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus).optional(),
  issueDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  paymentTerms: z.string().nullable().optional(),
  cancellationReason: z.string().optional(),
});

export const CreatePaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.coerce.date(),
  method: z.enum(["BANK_TRANSFER", "CHEQUE", "CASH", "UPI", "CARD"]),
  referenceNumber: z.string().max(255).optional(),
  notes: z.string().optional(),
});

export const ListInvoicesQuerySchema = z.object({
  status: z.nativeEnum(InvoiceStatus).optional(),
  orgId: z.string().uuid().optional(),
});
