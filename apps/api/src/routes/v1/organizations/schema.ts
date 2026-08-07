import { z } from "zod";
import { OrganizationTier, OrganizationType } from "@repo/db";

export const CreateOrgSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.nativeEnum(OrganizationType),
  tier: z.nativeEnum(OrganizationTier).optional(),
  gstNumber: z.string().max(50).optional(),
  panNumber: z.string().max(50).optional(),
  paymentTermsDays: z.number().int().min(0).max(365).optional(),
  website: z.string().url().max(255).optional(),
  notes: z.string().optional(),
});

export const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.nativeEnum(OrganizationType).optional(),
  tier: z.nativeEnum(OrganizationTier).optional(),
  gstNumber: z.string().max(50).nullable().optional(),
  panNumber: z.string().max(50).nullable().optional(),
  paymentTermsDays: z.number().int().min(0).max(365).optional(),
  website: z.string().url().max(255).nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const ListOrgsQuerySchema = z.object({
  type: z.nativeEnum(OrganizationType).optional(),
  tier: z.nativeEnum(OrganizationTier).optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  search: z.string().max(100).optional(),
});

export type CreateOrgInput = z.infer<typeof CreateOrgSchema>;
export type UpdateOrgInput = z.infer<typeof UpdateOrgSchema>;
export type ListOrgsQuery = z.infer<typeof ListOrgsQuerySchema>;
