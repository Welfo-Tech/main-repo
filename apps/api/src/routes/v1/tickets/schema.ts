import { TicketStatus, TicketUrgency } from "@repo/db";
import { z } from "zod/v4";

export const CreateTicketSchema = z.object({
  organizationId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  reportedProblem: z.string().min(1),
  urgency: z.nativeEnum(TicketUrgency).optional(),
});

export const UpdateTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  urgency: z.nativeEnum(TicketUrgency).optional(),
  reportedProblem: z.string().min(1).optional(),
  contactId: z.string().uuid().nullable().optional(),
  productId: z.string().uuid().nullable().optional(),
});

export const ListTicketsQuerySchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  urgency: z.nativeEnum(TicketUrgency).optional(),
  orgId: z.string().uuid().optional(),
});
