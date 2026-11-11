import { CasePriority, DispatchDirection, DispatchStatus, RepairEventType, ServiceCaseStatus, ServiceCaseType } from "@repo/db";
import { z } from "zod";

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

export const AssignTechnicianSchema = z.object({
  technicianId: z.string().uuid(),
  reason: z.string().optional(),
});

export const CreateRepairEventSchema = z.object({
  eventType: z.nativeEnum(RepairEventType),
  description: z.string().min(1),
  eventAt: z.coerce.date().optional(),
});

export const CreateDispatchSchema = z.object({
  direction: z.nativeEnum(DispatchDirection),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  dispatchDate: z.string().optional(),
  expectedDelivery: z.string().optional(),
  fromAddress: z.record(z.string()).optional(),
  toAddress: z.record(z.string()).optional(),
  conditionNotes: z.string().optional(),
});

export const UpdateDispatchSchema = z.object({
  status: z.nativeEnum(DispatchStatus).optional(),
  trackingNumber: z.string().optional(),
  actualDelivery: z.string().optional(),
  conditionNotes: z.string().optional(),
});
