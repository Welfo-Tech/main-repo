import { type UserRole, prisma } from "@repo/db";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
} as const;

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
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
}

export async function findUsers(filters: UserFilters) {
  return prisma.user.findMany({
    where: {
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    },
    select: userSelect,
    orderBy: { name: "asc" },
  });
}

export interface UpdateUserData {
  name?: string;
  isActive?: boolean;
}

export async function updateUser(id: string, data: UpdateUserData) {
  return prisma.user.update({ where: { id }, data, select: userSelect });
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) {
  return prisma.user.create({
    data,
    select: userSelect,
  });
}

export async function updateLastLoginAt(id: string) {
  return prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}
