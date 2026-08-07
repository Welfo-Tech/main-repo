import { prisma } from "@repo/db";

export async function findContactByEmail(email: string) {
  return prisma.customerContact.findFirst({
    where: {
      email,
      isActive: true,
      passwordHash: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      organizationId: true,
      isActive: true,
      organization: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function findContactById(id: string) {
  return prisma.customerContact.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      organizationId: true,
      isActive: true,
      organization: {
        select: { id: true, name: true },
      },
    },
  });
}
