import { RepairEventType, prisma } from "@repo/db";

const repairEventSelect = {
  id: true,
  caseId: true,
  eventType: true,
  description: true,
  eventAt: true,
  createdAt: true,
  technician: {
    select: {
      id: true,
      employeeId: true,
      user: { select: { id: true, name: true } },
    },
  },
} as const;

export async function findRepairEventsByCaseId(caseId: string) {
  return prisma.repairEvent.findMany({
    where: { caseId },
    select: repairEventSelect,
    orderBy: { eventAt: "desc" },
  });
}

export interface CreateRepairEventData {
  caseId: string;
  technicianId: string;
  eventType: RepairEventType;
  description: string;
  eventAt?: Date;
}

export async function createRepairEvent(data: CreateRepairEventData) {
  return prisma.repairEvent.create({
    data: {
      caseId: data.caseId,
      technicianId: data.technicianId,
      eventType: data.eventType,
      description: data.description,
      eventAt: data.eventAt ?? new Date(),
    },
    select: repairEventSelect,
  });
}
