import { type UserRole, prisma } from "@repo/db";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      isActive: true,
      lastLoginAt: true,
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) {
  return prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

export async function updateLastLoginAt(id: string) {
  return prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}
