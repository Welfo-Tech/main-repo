import { z } from "zod";

export const SubmitInquirySchema = z.object({
  submitterName: z.string().min(1).max(255),
  submitterEmail: z.string().email(),
  submitterPhone: z.string().max(50).optional(),
  organizationName: z.string().min(1).max(255),
  city: z.string().max(100).optional(),
  productModel: z.string().min(1).max(255),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.coerce.date().optional(),
  reportedProblem: z.string().min(10),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).optional(),
});
