import { RepairEventType } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  createRepairEvent,
  findRepairEventsByCaseId,
} from "../repositories/repair-event.repository.js";
import { findTechnicianByUserId } from "../repositories/technician.repository.js";
import { requireCaseForActor } from "./service-case.service.js";

const WORKABLE_STATUSES = new Set([
  "ASSIGNED",
  "UNDER_ASSESSMENT",
  "WORK_AUTHORIZED",
  "IN_REPAIR",
  "QC_PENDING",
  "QC_FAILED",
]);

export async function listRepairEvents(caseId: string, actor: AuthUser) {
  await requireCaseForActor(caseId, actor);
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
  const sc = await requireCaseForActor(caseId, actor);

  if (!WORKABLE_STATUSES.has(sc.status)) {
    throw new ValidationError(
      `cannot log repair events on a case with status ${sc.status}`,
    );
  }

  let technicianId: string;

  if (actor.role === "TECHNICIAN") {
    const tech = await findTechnicianByUserId(actor.id);
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
