import { NotFoundError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  createContact,
  findContactById,
  findContactsByOrgId,
  softDeleteContact,
  updateContact,
} from "../repositories/customer-contact.repository.js";
import { findOrganizationById } from "../repositories/organization.repository.js";
import type { CreateContactInput, UpdateContactInput } from "../routes/v1/organizations/contacts/schema.js";

async function requireOrg(orgId: string) {
  const org = await findOrganizationById(orgId);
  if (!org) throw new NotFoundError("organization not found");
}

export async function listContacts(orgId: string, _actor: AuthUser) {
  await requireOrg(orgId);
  return findContactsByOrgId(orgId);
}

export async function getContact(contactId: string, orgId: string, _actor: AuthUser) {
  await requireOrg(orgId);
  const contact = await findContactById(contactId, orgId);
  if (!contact) throw new NotFoundError("contact not found");
  return contact;
}

export async function addContact(orgId: string, data: CreateContactInput, _actor: AuthUser) {
  await requireOrg(orgId);
  return createContact(orgId, data);
}

export async function editContact(
  contactId: string,
  orgId: string,
  data: UpdateContactInput,
  _actor: AuthUser,
) {
  await requireOrg(orgId);
  const existing = await findContactById(contactId, orgId);
  if (!existing) throw new NotFoundError("contact not found");
  return updateContact(contactId, orgId, data);
}

export async function removeContact(contactId: string, orgId: string, _actor: AuthUser) {
  await requireOrg(orgId);
  const existing = await findContactById(contactId, orgId);
  if (!existing) throw new NotFoundError("contact not found");
  return softDeleteContact(contactId);
}
