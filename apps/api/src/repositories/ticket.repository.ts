import { TicketStatus, TicketUrgency, prisma } from "@repo/db";

const ticketSelect = {
  id: true,
  ticketNumber: true,
  organizationId: true,
  contactId: true,
  productId: true,
  reportedProblem: true,
  urgency: true,
  status: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  organization: { select: { id: true, name: true } },
  contact: { select: { id: true, name: true, phone: true } },
  product: {
    select: {
      id: true,
      serialNumber: true,
      model: { select: { id: true, name: true, category: true } },
    },
  },
} as const;

export interface TicketFilters {
  status?: TicketStatus;
  urgency?: TicketUrgency;
  orgId?: string;
}

export async function findTickets(filters: TicketFilters) {
  return prisma.ticket.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.urgency ? { urgency: filters.urgency } : {}),
      ...(filters.orgId ? { organizationId: filters.orgId } : {}),
    },
    select: ticketSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findTicketById(id: string) {
  return prisma.ticket.findUnique({ where: { id }, select: ticketSelect });
}

export interface CreateTicketData {
  organizationId: string;
  contactId?: string;
  productId?: string;
  reportedProblem: string;
  urgency?: TicketUrgency;
  createdBy: string;
}

export async function createTicket(data: CreateTicketData) {
  const [{ ticket_number }] = await prisma.$queryRaw<[{ ticket_number: string }]>`
    SELECT generate_ticket_number() AS ticket_number
  `;
  return prisma.ticket.create({
    data: {
      ticketNumber: ticket_number,
      organizationId: data.organizationId,
      contactId: data.contactId,
      productId: data.productId,
      reportedProblem: data.reportedProblem,
      urgency: data.urgency ?? TicketUrgency.NORMAL,
      status: TicketStatus.OPEN,
      createdBy: data.createdBy,
    },
    select: ticketSelect,
  });
}

export interface UpdateTicketData {
  status?: TicketStatus;
  urgency?: TicketUrgency;
  reportedProblem?: string;
  contactId?: string | null;
  productId?: string | null;
}

export async function updateTicket(id: string, data: UpdateTicketData) {
  return prisma.ticket.update({ where: { id }, data, select: ticketSelect });
}
