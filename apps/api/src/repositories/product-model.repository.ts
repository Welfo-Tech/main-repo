import { type ProductCategory, prisma } from "@repo/db";

export interface ProductModelFilters {
  category?: ProductCategory;
  isActive?: boolean;
  search?: string;
}

const productModelSelect = {
  id: true,
  name: true,
  category: true,
  manufacturer: true,
  description: true,
  specifications: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findProductModels(filters: ProductModelFilters) {
  return prisma.productModel.findMany({
    where: {
      ...(filters.category !== undefined && { category: filters.category }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.search && {
        name: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    select: productModelSelect,
    orderBy: { name: "asc" },
  });
}

export async function findProductModelById(id: string) {
  return prisma.productModel.findUnique({
    where: { id },
    select: productModelSelect,
  });
}

export async function createProductModel(data: {
  name: string;
  category: ProductCategory;
  manufacturer?: string;
  description?: string;
  specifications?: Record<string, unknown>;
}) {
  return prisma.productModel.create({ data, select: productModelSelect });
}

export async function updateProductModel(
  id: string,
  data: Partial<{
    name: string;
    category: ProductCategory;
    manufacturer: string;
    description: string | null;
    specifications: Record<string, unknown> | null;
    isActive: boolean;
  }>,
) {
  return prisma.productModel.update({ where: { id }, data, select: productModelSelect });
}

export async function deactivateProductModel(id: string) {
  return prisma.productModel.update({
    where: { id },
    data: { isActive: false },
    select: { id: true },
  });
}
