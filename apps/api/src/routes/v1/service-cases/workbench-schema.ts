import { AttachmentCategory, ServiceCaseStatus } from "@repo/db";
import { z } from "zod";

export const AdvanceStatusSchema = z.object({
  status: z.nativeEnum(ServiceCaseStatus),
  note: z.string().max(2000).optional(),
});

export const CasePhotoUploadSchema = z.object({
  fileNames: z.array(z.string().min(1).max(255)).min(1).max(8),
  category: z.nativeEnum(AttachmentCategory).optional(),
});

export const ProposeIrreparableSchema = z.object({
  reason: z.string().min(10).max(2000),
});

export const IrreparableVerdictSchema = z.object({
  verdict: z.enum(["CONFIRMED", "SECOND_CHANCE"]),
  note: z.string().max(2000).optional(),
});
