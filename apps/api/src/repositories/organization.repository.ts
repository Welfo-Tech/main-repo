import { OrganizationTier, OrganizationType, prisma } from "@repo/db";

export interface OrgFilters {
  type?: OrganizationType;
  tier?: OrganizationTier;
  isActive?: boolean;
  search?: string;
}

const orgSelect = {
  id: true,
  name: true,
  type: true,
  tier: true,
  gstNumber: true,
  panNumber: true,
  paymentTermsDays: true,
  website: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findOrganizationById(id: string) {
  return prisma.organization.findFirst({
    where: { id, deletedAt: null },
    select: orgSelect,
  });
}

export async function findOrganizations(filters: OrgFilters) {
  return prisma.organization.findMany({
    where: {
      deletedAt: null,
      ...(filters.type !== undefined && { type: filters.type }),
      ...(filters.tier !== undefined && { tier: filters.tier }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.search && {
        name: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    select: orgSelect,
    orderBy: { name: "asc" },
  });
}

export async function createOrganization(data: {
  name: string;
  type: OrganizationType;
  tier?: OrganizationTier;
  gstNumber?: string;
  panNumber?: string;
  paymentTermsDays?: number;
  website?: string;
  notes?: string;
}) {
  return prisma.organization.create({ data, select: orgSelect });
}

export async function updateOrganization(
  id: string,
  data: Partial<{
    name: string;
    type: OrganizationType;
    tier: OrganizationTier;
    gstNumber: string | null;
    panNumber: string | null;
    paymentTermsDays: number;
    website: string | null;
    notes: string | null;
    isActive: boolean;
  }>,
) {
  return prisma.organization.update({ where: { id }, data, select: orgSelect });
}

export async function softDeleteOrganization(id: string) {
  return prisma.organization.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
    select: { id: true },
  });
}
