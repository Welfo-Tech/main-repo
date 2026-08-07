import { prisma } from "@repo/db";

const contactSelect = {
  id: true,
  organizationId: true,
  name: true,
  designation: true,
  email: true,
  phone: true,
  isPrimary: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findContactsByOrgId(orgId: string) {
  return prisma.customerContact.findMany({
    where: { organizationId: orgId, deletedAt: null },
    select: contactSelect,
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });
}

export async function findContactById(contactId: string, orgId: string) {
  return prisma.customerContact.findFirst({
    where: { id: contactId, organizationId: orgId, deletedAt: null },
    select: contactSelect,
  });
}

export async function createContact(
  orgId: string,
  data: {
    name: string;
    designation?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  },
) {
  if (!data.isPrimary) {
    return prisma.customerContact.create({
      data: { ...data, organizationId: orgId },
      select: contactSelect,
    });
  }
  return prisma.$transaction(async (tx) => {
    await tx.customerContact.updateMany({
      where: { organizationId: orgId, deletedAt: null },
      data: { isPrimary: false },
    });
    return tx.customerContact.create({
      data: { ...data, organizationId: orgId, isPrimary: true },
      select: contactSelect,
    });
  });
}

export async function updateContact(
  contactId: string,
  orgId: string,
  data: Partial<{
    name: string;
    designation: string | null;
    email: string | null;
    phone: string | null;
    isPrimary: boolean;
    isActive: boolean;
  }>,
) {
  if (!data.isPrimary) {
    return prisma.customerContact.update({
      where: { id: contactId },
      data,
      select: contactSelect,
    });
  }
  return prisma.$transaction(async (tx) => {
    await tx.customerContact.updateMany({
      where: { organizationId: orgId, deletedAt: null, id: { not: contactId } },
      data: { isPrimary: false },
    });
    return tx.customerContact.update({
      where: { id: contactId },
      data,
      select: contactSelect,
    });
  });
}

export async function softDeleteContact(contactId: string) {
  return prisma.customerContact.update({
    where: { id: contactId },
    data: { deletedAt: new Date(), isActive: false },
    select: { id: true },
  });
}
