import { CasePriority, ServiceCaseStatus, ServiceCaseType } from "@repo/db";
import { z } from "zod/v4";

export const CreateCaseSchema = z.object({
  organizationId: z.string().uuid(),
  productId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  type: z.nativeEnum(ServiceCaseType).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  isBillable: z.boolean().optional(),
  intakeCondition: z.string().optional(),
  slaDeadline: z.coerce.date().optional(),
  ticketId: z.string().uuid().optional(),
});

export const UpdateCaseSchema = z.object({
  status: z.nativeEnum(ServiceCaseStatus).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  isBillable: z.boolean().optional(),
  assignedTechnicianId: z.string().uuid().nullable().optional(),
  intakeCondition: z.string().optional(),
  slaDeadline: z.coerce.date().nullable().optional(),
  cancellationReason: z.string().optional(),
  holdReason: z.string().optional(),
});

export const ListCasesQuerySchema = z.object({
  status: z.nativeEnum(ServiceCaseStatus).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  orgId: z.string().uuid().optional(),
  technicianId: z.string().uuid().optional(),
});
