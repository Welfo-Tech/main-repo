import { NotFoundError, ValidationError } from "../lib/errors.js";
import { notifyCaseAssigned, notifyStatusChanged } from "./notification.service.js";
import type { AuthUser } from "../middleware/auth.js";
import { findOrganizationById } from "../repositories/organization.repository.js";
import { findProductById } from "../repositories/product.repository.js";
import {
  type CaseFilters,
  type CreateCaseData,
  type UpdateCaseData,
  assignTechnicianToCase,
  createCase,
  findCaseById,
  findCases,
  updateCase,
} from "../repositories/service-case.repository.js";
import {
  findTechnicianById,
  findTechnicianByUserId,
} from "../repositories/technician.repository.js";

async function requireOrg(orgId: string) {
  const org = await findOrganizationById(orgId);
  if (!org) throw new NotFoundError("organization not found");
}

async function requireProduct(productId: string) {
  const product = await findProductById(productId);
  if (!product) throw new NotFoundError("product not found");
}

async function requireCase(id: string) {
  const sc = await findCaseById(id);
  if (!sc) throw new NotFoundError("service case not found");
  return sc;
}

function handleTriggerError(err: unknown): never {
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P0001"
  ) {
    const msg =
      "message" in err ? String((err as { message: string }).message) : "";
    const match = msg.match(/cannot transition to (\w+)/);
    throw new ValidationError(
      match ? `invalid status transition to ${match[1]}` : "invalid status transition",
    );
  }
  throw err as Error;
}

/**
 * Technicians may only reach cases assigned to them. actor.id is a User id, so
 * the technician profile has to be resolved by userId, not by id.
 */
async function technicianScopeId(actor: AuthUser): Promise<string | null> {
  if (actor.role !== "TECHNICIAN") return null;
  const tech = await findTechnicianByUserId(actor.id);
  if (!tech) throw new NotFoundError("no technician profile for this account");
  return tech.id;
}

/**
 * Shared by the repair event and dispatch services so every read of a case is
 * scoped the same way. An unassigned case reads as missing rather than
 * forbidden, so a technician cannot probe which case ids exist.
 */
export async function requireCaseForActor(id: string, actor: AuthUser) {
  const sc = await requireCase(id);
  const scope = await technicianScopeId(actor);
  if (scope && sc.technician?.id !== scope) {
    throw new NotFoundError("service case not found");
  }
  return sc;
}

export async function listCases(filters: CaseFilters, actor: AuthUser) {
  const scope = await technicianScopeId(actor);
  return findCases(scope ? { ...filters, technicianId: scope } : filters);
}

export async function getCase(id: string, actor: AuthUser) {
  return requireCaseForActor(id, actor);
}

export async function openCase(
  data: Omit<CreateCaseData, "createdBy">,
  actor: AuthUser,
) {
  await requireOrg(data.organizationId);
  await requireProduct(data.productId);
  return createCase({ ...data, createdBy: actor.id });
}

export async function editCase(
  id: string,
  data: UpdateCaseData,
  _actor: AuthUser,
) {
  const before = await requireCase(id);
  const updated = await updateCase(id, data).catch(handleTriggerError);
  if (data.status && data.status !== before.status) {
    notifyStatusChanged(id, before.caseNumber, before.technician?.id ?? null, data.status);
  }
  return updated;
}

export async function assignTechnician(
  caseId: string,
  data: { technicianId: string; reason?: string },
  actor: AuthUser,
) {
  const sc = await requireCase(caseId);
  const tech = await findTechnicianById(data.technicianId);
  if (!tech) throw new NotFoundError("technician not found");
  if (!tech.isActive) throw new ValidationError("technician is not active");

  const result = await assignTechnicianToCase(caseId, data.technicianId, actor.id, data.reason);
  notifyCaseAssigned(caseId, sc.caseNumber, data.technicianId);
  return result;
}
