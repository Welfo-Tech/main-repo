import { NotFoundError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import { findOrganizationById } from "../repositories/organization.repository.js";
import {
  type CreateTicketData,
  type TicketFilters,
  type UpdateTicketData,
  createTicket,
  findTicketById,
  findTickets,
  updateTicket,
} from "../repositories/ticket.repository.js";

async function requireOrg(orgId: string) {
  const org = await findOrganizationById(orgId);
  if (!org) throw new NotFoundError("organization not found");
}

async function requireTicket(id: string) {
  const ticket = await findTicketById(id);
  if (!ticket) throw new NotFoundError("ticket not found");
  return ticket;
}

export async function listTickets(filters: TicketFilters, _actor: AuthUser) {
  return findTickets(filters);
}

export async function getTicket(id: string, _actor: AuthUser) {
  return requireTicket(id);
}

export async function openTicket(
  data: Omit<CreateTicketData, "createdBy">,
  actor: AuthUser,
) {
  await requireOrg(data.organizationId);
  return createTicket({ ...data, createdBy: actor.id });
}

export async function editTicket(
  id: string,
  data: UpdateTicketData,
  _actor: AuthUser,
) {
  await requireTicket(id);
  return updateTicket(id, data);
}
