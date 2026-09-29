import { z } from "zod";

export const VerifySerialQuerySchema = z.object({
  serial: z.string().min(1).max(255),
});

export const SubmitInquirySchema = z.object({
  submitterName: z.string().min(1).max(255),
  submitterEmail: z.string().email(),
  submitterPhone: z.string().max(50).optional(),
  organizationName: z.string().min(1).max(255),
  city: z.string().max(100).optional(),
  serialNumber: z.string().min(1).max(255),
  reportedProblem: z.string().min(10),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).optional(),
  photoFileNames: z.array(z.string().min(1).max(255)).max(5).optional(),
});
