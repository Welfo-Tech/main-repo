import { z } from "zod";

export const PortalQuoteQuerySchema = z.object({
  ref: z.string().min(3).max(32),
  email: z.string().email(),
});

export const QuoteDecisionSchema = z.object({
  ref: z.string().min(3).max(32),
  email: z.string().email(),
  decision: z.enum(["APPROVE", "REJECT"]),
  approverName: z.string().min(2).max(255),
  reason: z.string().max(2000).optional(),
});
