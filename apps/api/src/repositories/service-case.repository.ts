import {
  CasePriority,
  ServiceCaseStatus,
  ServiceCaseType,
  prisma,
} from "@repo/db";

const caseSelect = {
  id: true,
  caseNumber: true,
  type: true,
  status: true,
  isBillable: true,
  priority: true,
  slaDeadline: true,
  intakeCondition: true,
  closedAt: true,
  cancellationReason: true,
  holdReason: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  organization: { select: { id: true, name: true } },
  contact: { select: { id: true, name: true, phone: true } },
  product: {
    select: {
      id: true,
      serialNumber: true,
      model: { select: { id: true, name: true, category: true } },
    },
  },
  technician: {
    select: {
      id: true,
      user: { select: { id: true, name: true } },
    },
  },
  ticket: { select: { id: true, ticketNumber: true } },
} as const;

export interface CaseFilters {
  status?: ServiceCaseStatus;
  priority?: CasePriority;
  orgId?: string;
  technicianId?: string;
}

export async function findCases(filters: CaseFilters) {
  return prisma.serviceCase.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.orgId ? { organizationId: filters.orgId } : {}),
      ...(filters.technicianId
        ? { assignedTechnicianId: filters.technicianId }
        : {}),
    },
    select: caseSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findCaseById(id: string) {
  return prisma.serviceCase.findUnique({ where: { id }, select: caseSelect });
}

export interface CreateCaseData {
  organizationId: string;
  productId: string;
  contactId?: string;
  type?: ServiceCaseType;
  priority?: CasePriority;
  isBillable?: boolean;
  intakeCondition?: string;
  slaDeadline?: Date;
  ticketId?: string;
  createdBy: string;
}

export async function createCase(data: CreateCaseData) {
  const [{ case_number }] = await prisma.$queryRaw<
    [{ case_number: string }]
  >`SELECT generate_case_number() AS case_number`;

  return prisma.serviceCase.create({
    data: {
      caseNumber: case_number,
      organizationId: data.organizationId,
      productId: data.productId,
      contactId: data.contactId,
      type: data.type ?? ServiceCaseType.REPAIR,
      status: ServiceCaseStatus.INTAKE,
      priority: data.priority ?? CasePriority.NORMAL,
      isBillable: data.isBillable ?? true,
      intakeCondition: data.intakeCondition,
      slaDeadline: data.slaDeadline,
      ticketId: data.ticketId,
      createdBy: data.createdBy,
    },
    select: caseSelect,
  });
}

export interface UpdateCaseData {
  status?: ServiceCaseStatus;
  priority?: CasePriority;
  isBillable?: boolean;
  assignedTechnicianId?: string | null;
  intakeCondition?: string;
  slaDeadline?: Date | null;
  cancellationReason?: string;
  holdReason?: string;
  closedAt?: Date | null;
}

export async function updateCase(id: string, data: UpdateCaseData) {
  return prisma.serviceCase.update({ where: { id }, data, select: caseSelect });
}

export async function assignTechnicianToCase(
  caseId: string,
  technicianId: string,
  assignedBy: string,
  reason?: string,
) {
  return prisma.$transaction(async (tx) => {
    await tx.technicianAssignment.updateMany({
      where: { caseId, unassignedAt: null },
      data: { unassignedAt: new Date() },
    });

    await tx.technicianAssignment.create({
      data: { caseId, technicianId, assignedBy, reason },
    });

    return tx.serviceCase.update({
      where: { id: caseId },
      data: { assignedTechnicianId: technicianId },
      select: caseSelect,
    });
  });
}
