import { DispatchDirection, DispatchStatus } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  type CreateDispatchData,
  type UpdateDispatchData,
  createDispatch,
  findDispatchById,
  findDispatchesByCaseId,
  updateDispatch,
} from "../repositories/dispatch.repository.js";
import { findCaseById } from "../repositories/service-case.repository.js";

const DISPATCH_STATUS_TRANSITIONS: Record<DispatchStatus, DispatchStatus[]> = {
  [DispatchStatus.PENDING]: [DispatchStatus.DISPATCHED],
  [DispatchStatus.DISPATCHED]: [DispatchStatus.IN_TRANSIT, DispatchStatus.FAILED],
  [DispatchStatus.IN_TRANSIT]: [DispatchStatus.DELIVERED, DispatchStatus.FAILED],
  [DispatchStatus.DELIVERED]: [],
  [DispatchStatus.FAILED]: [DispatchStatus.RETURNED],
  [DispatchStatus.RETURNED]: [],
};

async function requireCase(id: string) {
  const sc = await findCaseById(id);
  if (!sc) throw new NotFoundError("service case not found");
  return sc;
}

async function requireDispatch(id: string) {
  const dispatch = await findDispatchById(id);
  if (!dispatch) throw new NotFoundError("dispatch record not found");
  return dispatch;
}

export async function listDispatches(caseId: string, _actor: AuthUser) {
  await requireCase(caseId);
  return findDispatchesByCaseId(caseId);
}

export interface CreateDispatchInput {
  direction: DispatchDirection;
  courierName?: string;
  trackingNumber?: string;
  dispatchDate?: string;
  expectedDelivery?: string;
  fromAddress?: Record<string, string>;
  toAddress?: Record<string, string>;
  conditionNotes?: string;
}

export async function createCaseDispatch(
  caseId: string,
  input: CreateDispatchInput,
  _actor: AuthUser,
) {
  await requireCase(caseId);

  const data: CreateDispatchData = {
    caseId,
    direction: input.direction,
    courierName: input.courierName,
    trackingNumber: input.trackingNumber,
    dispatchDate: input.dispatchDate ? new Date(input.dispatchDate) : undefined,
    expectedDelivery: input.expectedDelivery ? new Date(input.expectedDelivery) : undefined,
    fromAddress: input.fromAddress,
    toAddress: input.toAddress,
    conditionNotes: input.conditionNotes,
  };

  return createDispatch(data);
}

export interface UpdateDispatchInput {
  status?: DispatchStatus;
  trackingNumber?: string;
  actualDelivery?: string;
  conditionNotes?: string;
}

export async function updateCaseDispatch(
  caseId: string,
  dispatchId: string,
  input: UpdateDispatchInput,
  _actor: AuthUser,
) {
  await requireCase(caseId);
  const dispatch = await requireDispatch(dispatchId);

  if (dispatch.caseId !== caseId) {
    throw new NotFoundError("dispatch record not found");
  }

  if (input.status) {
    const allowed = DISPATCH_STATUS_TRANSITIONS[dispatch.status] ?? [];
    if (!allowed.includes(input.status)) {
      throw new ValidationError(
        `cannot transition dispatch from ${dispatch.status} to ${input.status}`,
      );
    }
  }

  const data: UpdateDispatchData = {
    status: input.status,
    trackingNumber: input.trackingNumber,
    actualDelivery: input.actualDelivery ? new Date(input.actualDelivery) : undefined,
    conditionNotes: input.conditionNotes,
  };

  return updateDispatch(dispatchId, data);
}
