import { NotFoundError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  type OrgFilters,
  createOrganization,
  findOrganizationById,
  findOrganizations,
  softDeleteOrganization,
  updateOrganization,
} from "../repositories/organization.repository.js";
import type { CreateOrgInput, UpdateOrgInput } from "../routes/v1/organizations/schema.js";

export async function listOrganizations(filters: OrgFilters, _actor: AuthUser) {
  return findOrganizations(filters);
}

export async function getOrganization(id: string, _actor: AuthUser) {
  const org = await findOrganizationById(id);
  if (!org) throw new NotFoundError("organization not found");
  return org;
}

export async function createOrg(data: CreateOrgInput, _actor: AuthUser) {
  return createOrganization(data);
}

export async function updateOrg(id: string, data: UpdateOrgInput, actor: AuthUser) {
  const existing = await findOrganizationById(id);
  if (!existing) throw new NotFoundError("organization not found");
  return updateOrganization(id, data);
}

export async function deactivateOrg(id: string, actor: AuthUser) {
  const existing = await findOrganizationById(id);
  if (!existing) throw new NotFoundError("organization not found");
  return softDeleteOrganization(id);
}
