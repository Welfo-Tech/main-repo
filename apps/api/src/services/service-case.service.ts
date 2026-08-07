import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import { findOrganizationById } from "../repositories/organization.repository.js";
import { findProductById } from "../repositories/product.repository.js";
import {
  type CaseFilters,
  type CreateCaseData,
  type UpdateCaseData,
  createCase,
  findCaseById,
  findCases,
  updateCase,
} from "../repositories/service-case.repository.js";

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

export async function listCases(filters: CaseFilters, _actor: AuthUser) {
  return findCases(filters);
}

export async function getCase(id: string, _actor: AuthUser) {
  return requireCase(id);
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
  await requireCase(id);
  return updateCase(id, data).catch(handleTriggerError);
}
