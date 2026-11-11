import { DispatchDirection, DispatchStatus, prisma } from "@repo/db";

const dispatchSelect = {
  id: true,
  caseId: true,
  direction: true,
  courierName: true,
  trackingNumber: true,
  dispatchDate: true,
  expectedDelivery: true,
  actualDelivery: true,
  fromAddress: true,
  toAddress: true,
  conditionNotes: true,
  status: true,
} as const;

export async function findDispatchesByCaseId(caseId: string) {
  return prisma.dispatchRecord.findMany({
    where: { caseId },
    select: dispatchSelect,
    orderBy: { id: "asc" },
  });
}

export async function findDispatchById(id: string) {
  return prisma.dispatchRecord.findUnique({ where: { id }, select: dispatchSelect });
}

export interface CreateDispatchData {
  caseId: string;
  direction: DispatchDirection;
  courierName?: string;
  trackingNumber?: string;
  dispatchDate?: Date;
  expectedDelivery?: Date;
  fromAddress?: Record<string, string>;
  toAddress?: Record<string, string>;
  conditionNotes?: string;
}

export async function createDispatch(data: CreateDispatchData) {
  return prisma.dispatchRecord.create({
    data: {
      caseId: data.caseId,
      direction: data.direction,
      courierName: data.courierName,
      trackingNumber: data.trackingNumber,
      dispatchDate: data.dispatchDate,
      expectedDelivery: data.expectedDelivery,
      fromAddress: data.fromAddress,
      toAddress: data.toAddress,
      conditionNotes: data.conditionNotes,
      status: DispatchStatus.PENDING,
    },
    select: dispatchSelect,
  });
}

export interface UpdateDispatchData {
  status?: DispatchStatus;
  trackingNumber?: string;
  actualDelivery?: Date;
  conditionNotes?: string;
}

export async function updateDispatch(id: string, data: UpdateDispatchData) {
  return prisma.dispatchRecord.update({ where: { id }, data, select: dispatchSelect });
}
