import { type ProductStatus, prisma } from "@repo/db";

export interface ProductFilters {
  status?: ProductStatus;
  ownerOrgId?: string;
  modelId?: string;
  search?: string;
}

const productSelect = {
  id: true,
  serialNumber: true,
  modelId: true,
  ownerOrgId: true,
  manufactureDate: true,
  saleDate: true,
  warrantyExpiry: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  model: {
    select: { id: true, name: true, category: true, manufacturer: true },
  },
  ownerOrg: {
    select: { id: true, name: true },
  },
} as const;

export async function findProducts(filters: ProductFilters) {
  return prisma.product.findMany({
    where: {
      ...(filters.status !== undefined && { status: filters.status }),
      ...(filters.ownerOrgId !== undefined && { ownerOrgId: filters.ownerOrgId }),
      ...(filters.modelId !== undefined && { modelId: filters.modelId }),
      ...(filters.search && {
        serialNumber: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    select: productSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: productSelect,
  });
}

export async function createProduct(data: {
  serialNumber: string;
  modelId?: string;
  ownerOrgId?: string;
  manufactureDate?: Date;
  saleDate?: Date;
  warrantyExpiry?: Date;
  status?: ProductStatus;
  notes?: string;
}) {
  return prisma.product.create({ data, select: productSelect });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    serialNumber: string;
    modelId: string | null;
    ownerOrgId: string | null;
    manufactureDate: Date | null;
    saleDate: Date | null;
    warrantyExpiry: Date | null;
    status: ProductStatus;
    notes: string | null;
  }>,
) {
  return prisma.product.update({ where: { id }, data, select: productSelect });
}
