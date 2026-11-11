import { z } from "zod";
import { ProductStatus } from "@repo/db";

export const CreateProductSchema = z.object({
  serialNumber: z.string().min(1).max(255),
  modelId: z.string().uuid().optional(),
  ownerOrgId: z.string().uuid().optional(),
  manufactureDate: z.coerce.date().optional(),
  saleDate: z.coerce.date().optional(),
  warrantyExpiry: z.coerce.date().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  notes: z.string().optional(),
});

export const UpdateProductSchema = z.object({
  serialNumber: z.string().min(1).max(255).optional(),
  modelId: z.string().uuid().nullable().optional(),
  ownerOrgId: z.string().uuid().nullable().optional(),
  manufactureDate: z.coerce.date().nullable().optional(),
  saleDate: z.coerce.date().nullable().optional(),
  warrantyExpiry: z.coerce.date().nullable().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  notes: z.string().nullable().optional(),
});

export const ListProductsQuerySchema = z.object({
  status: z.nativeEnum(ProductStatus).optional(),
  ownerOrgId: z.string().uuid().optional(),
  modelId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;
