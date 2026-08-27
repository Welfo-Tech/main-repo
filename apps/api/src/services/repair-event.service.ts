import { RepairEventType } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  createRepairEvent,
  findRepairEventsByCaseId,
} from "../repositories/repair-event.repository.js";
import { findCaseById } from "../repositories/service-case.repository.js";
import { findTechnicianById } from "../repositories/technician.repository.js";

const WORKABLE_STATUSES = new Set([
  "ASSIGNED",
  "UNDER_ASSESSMENT",
  "WORK_AUTHORIZED",
  "IN_REPAIR",
  "QC_PENDING",
  "QC_FAILED",
]);

async function requireCase(id: string) {
  const sc = await findCaseById(id);
  if (!sc) throw new NotFoundError("service case not found");
  return sc;
}

export async function listRepairEvents(caseId: string, _actor: AuthUser) {
  await requireCase(caseId);
  return findRepairEventsByCaseId(caseId);
}

export interface AddRepairEventData {
  eventType: RepairEventType;
  description: string;
  eventAt?: Date;
}

export async function addRepairEvent(
  caseId: string,
  data: AddRepairEventData,
  actor: AuthUser,
) {
  const sc = await requireCase(caseId);

  if (!WORKABLE_STATUSES.has(sc.status)) {
    throw new ValidationError(
      `cannot log repair events on a case with status ${sc.status}`,
    );
  }

  let technicianId: string;

  if (actor.role === "TECHNICIAN") {
    const tech = await findTechnicianById(actor.id);
    if (!tech) throw new NotFoundError("technician profile not found for this user");
    if (sc.technician?.id !== tech.id) {
      throw new ValidationError("you are not assigned to this case");
    }
    technicianId = tech.id;
  } else {
    if (!sc.technician) throw new ValidationError("no technician assigned to this case");
    technicianId = sc.technician.id;
  }

  return createRepairEvent({
    caseId,
    technicianId,
    eventType: data.eventType,
    description: data.description,
    eventAt: data.eventAt,
  });
}
