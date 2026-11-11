import { prisma } from "@repo/db";

const technicianSelect = {
  id: true,
  employeeId: true,
  phone: true,
  specializations: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
} as const;

export interface TechnicianFilters {
  isActive?: boolean;
  specialization?: string;
}

export async function findTechnicians(filters: TechnicianFilters) {
  return prisma.technician.findMany({
    where: {
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.specialization
        ? { specializations: { has: filters.specialization } }
        : {}),
    },
    select: technicianSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findTechnicianById(id: string) {
  return prisma.technician.findUnique({ where: { id }, select: technicianSelect });
}

export async function findTechnicianByUserId(userId: string) {
  return prisma.technician.findUnique({ where: { userId }, select: technicianSelect });
}

export interface CreateTechnicianData {
  userId: string;
  employeeId: string;
  phone?: string;
  specializations?: string[];
}

export async function createTechnician(data: CreateTechnicianData) {
  return prisma.technician.create({
    data: {
      userId: data.userId,
      employeeId: data.employeeId,
      phone: data.phone,
      specializations: data.specializations ?? [],
    },
    select: technicianSelect,
  });
}

export interface UpdateTechnicianData {
  phone?: string;
  specializations?: string[];
  isActive?: boolean;
}

export async function updateTechnician(id: string, data: UpdateTechnicianData) {
  return prisma.technician.update({ where: { id }, data, select: technicianSelect });
}
