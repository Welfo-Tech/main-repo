import { z } from "zod";
import { ProductCategory } from "@repo/db";

export const CreateProductModelSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.nativeEnum(ProductCategory),
  manufacturer: z.string().max(255).optional(),
  description: z.string().optional(),
  specifications: z.record(z.unknown()).optional(),
});

export const UpdateProductModelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  manufacturer: z.string().max(255).optional(),
  description: z.string().nullable().optional(),
  specifications: z.record(z.unknown()).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const ListProductModelsQuerySchema = z.object({
  category: z.nativeEnum(ProductCategory).optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  search: z.string().max(100).optional(),
});

export type CreateProductModelInput = z.infer<typeof CreateProductModelSchema>;
export type UpdateProductModelInput = z.infer<typeof UpdateProductModelSchema>;
export type ListProductModelsQuery = z.infer<typeof ListProductModelsQuerySchema>;
