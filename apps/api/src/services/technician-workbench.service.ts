import { type ServiceCaseStatus, prisma } from "@repo/db";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import { findCaseAttachments } from "../repositories/attachment.repository.js";
import { findTechnicianByUserId } from "../repositories/technician.repository.js";
import { requireCaseForActor } from "./service-case.service.js";
import {
  notifyIrreparableProposed,
  notifyIrreparableVerdict,
  notifyQcPending,
} from "./notification.service.js";

/**
 * What a technician may move a case to, from each state. Commercial and
 * terminal states are deliberately absent: a technician does not authorise
 * work, pass their own QC, dispatch, close or cancel.
 */
const TECHNICIAN_TRANSITIONS: Partial<Record<ServiceCaseStatus, ServiceCaseStatus[]>> = {
  ASSIGNED: ["UNDER_ASSESSMENT"],
  UNDER_ASSESSMENT: ["ON_HOLD"],
  WORK_AUTHORIZED: ["IN_REPAIR"],
  IN_REPAIR: ["QC_PENDING", "ON_HOLD"],
  QC_FAILED: ["IN_REPAIR"],
  ON_HOLD: ["UNDER_ASSESSMENT", "IN_REPAIR"],
};

export function allowedTransitionsFor(status: ServiceCaseStatus): ServiceCaseStatus[] {
  return TECHNICIAN_TRANSITIONS[status] ?? [];
}

async function requireTechnicianProfile(actor: AuthUser) {
  const tech = await findTechnicianByUserId(actor.id);
  if (!tech) throw new NotFoundError("no technician profile for this account");
  return tech;
}

export async function getMyProfile(actor: AuthUser) {
  const tech = await requireTechnicianProfile(actor);

  const counts = await prisma.serviceCase.groupBy({
    by: ["status"],
    where: { assignedTechnicianId: tech.id },
    _count: { _all: true },
  });

  return {
    id: tech.id,
    employeeId: tech.employeeId,
    name: tech.user.name,
    email: tech.user.email,
    phone: tech.phone,
    specializations: tech.specializations,
    isActive: tech.isActive,
    caseCounts: Object.fromEntries(counts.map(c => [c.status, c._count._all])),
  };
}

export async function advanceCaseStatus(
  caseId: string,
  nextStatus: ServiceCaseStatus,
  note: string | undefined,
  actor: AuthUser,
) {
  const sc = await requireCaseForActor(caseId, actor);

  const allowed = allowedTransitionsFor(sc.status);
  if (!allowed.includes(nextStatus)) {
    throw new ValidationError(
      allowed.length === 0
        ? `a technician cannot change a case in ${sc.status}`
        : `cannot move from ${sc.status} to ${nextStatus}; allowed: ${allowed.join(", ")}`,
    );
  }

  if (nextStatus === "ON_HOLD" && !note?.trim()) {
    throw new ValidationError("a reason is required when putting a case on hold");
  }

  const updated = await prisma.serviceCase.update({
    where: { id: caseId },
    data: {
      status: nextStatus,
      ...(nextStatus === "ON_HOLD" ? { holdReason: note!.trim() } : {}),
    },
    select: { id: true, caseNumber: true, status: true, holdReason: true },
  });

  if (nextStatus === "QC_PENDING") {
    const tech = sc.technician?.user.name ?? "A technician";
    notifyQcPending(caseId, updated.caseNumber, tech);
  }

  return updated;
}

export async function proposeIrreparable(
  caseId: string,
  reason: string,
  actor: AuthUser,
) {
  const sc = await requireCaseForActor(caseId, actor);
  const tech = await requireTechnicianProfile(actor);

  if (sc.irreparableState === "PROPOSED") {
    throw new ValidationError("this case is already awaiting an irreparable verdict");
  }
  if (sc.irreparableState === "CONFIRMED") {
    throw new ValidationError("this case is already confirmed irreparable");
  }

  const photos = await findCaseAttachments(caseId, "DIAGNOSIS_PHOTO");
  if (photos.length === 0) {
    throw new ValidationError(
      "attach at least one diagnosis photo before proposing a case as irreparable",
    );
  }

  const proposed = await prisma.serviceCase.update({
    where: { id: caseId },
    data: {
      irreparableState: "PROPOSED",
      irreparableReason: reason.trim(),
      irreparableProposedBy: tech.id,
      irreparableProposedAt: new Date(),
      irreparableVerdictBy: null,
      irreparableVerdictAt: null,
      irreparableVerdictNote: null,
    },
    select: {
      id: true,
      caseNumber: true,
      status: true,
      irreparableState: true,
      irreparableReason: true,
      irreparableProposedAt: true,
    },
  });

  notifyIrreparableProposed(caseId, proposed.caseNumber, tech.user.name, reason.trim());
  return proposed;
}

export type IrreparableVerdict = "CONFIRMED" | "SECOND_CHANCE";

export async function ruleOnIrreparable(
  caseId: string,
  verdict: IrreparableVerdict,
  note: string | undefined,
  actor: AuthUser,
) {
  if (actor.role === "TECHNICIAN") {
    throw new ForbiddenError("only admin or operations can rule on an irreparable proposal");
  }

  const sc = await requireCaseForActor(caseId, actor);
  if (sc.irreparableState !== "PROPOSED") {
    throw new ValidationError("there is no irreparable proposal awaiting a verdict");
  }

  // SECOND_CHANCE keeps the technician's call on the record while work resumes,
  // so an override is never silently lost.
  const ruled = await prisma.serviceCase.update({
    where: { id: caseId },
    data: {
      irreparableState: verdict,
      irreparableVerdictBy: actor.id,
      irreparableVerdictAt: new Date(),
      irreparableVerdictNote: note?.trim() || null,
      status: verdict === "CONFIRMED" ? "IRREPAIRABLE" : "IN_REPAIR",
    },
    select: {
      id: true,
      caseNumber: true,
      status: true,
      irreparableState: true,
      irreparableVerdictNote: true,
    },
  });

  notifyIrreparableVerdict(
    caseId,
    ruled.caseNumber,
    sc.technician?.id ?? null,
    verdict,
    note?.trim() || null,
  );
  return ruled;
}

/** Called when the instrument was saved after a second chance. */
export async function withdrawIrreparable(caseId: string, actor: AuthUser) {
  const sc = await requireCaseForActor(caseId, actor);

  if (sc.irreparableState !== "PROPOSED" && sc.irreparableState !== "SECOND_CHANCE") {
    throw new ValidationError("there is no open irreparable flag on this case");
  }

  return prisma.serviceCase.update({
    where: { id: caseId },
    data: { irreparableState: "WITHDRAWN", irreparableVerdictAt: new Date() },
    select: { id: true, caseNumber: true, status: true, irreparableState: true },
  });
}
