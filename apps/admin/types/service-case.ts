export type ServiceCaseType = "REPAIR" | "SPARE_DEPLOYMENT" | "INSPECTION" | "WARRANTY_CLAIM";
export type ServiceCaseStatus =
  | "DRAFT"
  | "INTAKE"
  | "ASSIGNED"
  | "UNDER_ASSESSMENT"
  | "AWAITING_QUOTE_APPROVAL"
  | "WORK_AUTHORIZED"
  | "IN_REPAIR"
  | "QC_PENDING"
  | "QC_PASSED"
  | "QC_FAILED"
  | "DISPATCH_READY"
  | "DISPATCHED"
  | "DELIVERED"
  | "CLOSED"
  | "ON_HOLD"
  | "IRREPAIRABLE"
  | "QUOTE_REJECTED"
  | "CANCELLED";
export type CasePriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface ServiceCase {
  id: string;
  caseNumber: string;
  type: ServiceCaseType;
  status: ServiceCaseStatus;
  isBillable: boolean;
  priority: CasePriority;
  slaDeadline: string | null;
  intakeCondition: string | null;
  closedAt: string | null;
  cancellationReason: string | null;
  holdReason: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string };
  contact: { id: string; name: string; phone: string | null } | null;
  product: {
    id: string;
    serialNumber: string;
    model: { id: string; name: string; category: string };
  };
  technician: {
    id: string;
    user: { id: string; name: string };
  } | null;
  ticket: { id: string; ticketNumber: string } | null;
}

export const TYPE_LABELS: Record<ServiceCaseType, string> = {
  REPAIR: "Repair",
  SPARE_DEPLOYMENT: "Spare Deployment",
  INSPECTION: "Inspection",
  WARRANTY_CLAIM: "Warranty Claim",
};

export const STATUS_LABELS: Record<ServiceCaseStatus, string> = {
  DRAFT: "Draft",
  INTAKE: "Intake",
  ASSIGNED: "Assigned",
  UNDER_ASSESSMENT: "Under Assessment",
  AWAITING_QUOTE_APPROVAL: "Awaiting Quote Approval",
  WORK_AUTHORIZED: "Work Authorized",
  IN_REPAIR: "In Repair",
  QC_PENDING: "QC Pending",
  QC_PASSED: "QC Passed",
  QC_FAILED: "QC Failed",
  DISPATCH_READY: "Dispatch Ready",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CLOSED: "Closed",
  ON_HOLD: "On Hold",
  IRREPAIRABLE: "Irrepairable",
  QUOTE_REJECTED: "Quote Rejected",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<ServiceCaseStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  INTAKE: "bg-sky-100 text-sky-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  UNDER_ASSESSMENT: "bg-indigo-100 text-indigo-700",
  AWAITING_QUOTE_APPROVAL: "bg-amber-100 text-amber-700",
  WORK_AUTHORIZED: "bg-emerald-100 text-emerald-700",
  IN_REPAIR: "bg-teal-100 text-teal-700",
  QC_PENDING: "bg-purple-100 text-purple-700",
  QC_PASSED: "bg-green-100 text-green-700",
  QC_FAILED: "bg-red-100 text-red-700",
  DISPATCH_READY: "bg-cyan-100 text-cyan-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-200 text-slate-600",
  ON_HOLD: "bg-orange-100 text-orange-700",
  IRREPAIRABLE: "bg-red-200 text-red-800",
  QUOTE_REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export const PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const PRIORITY_COLORS: Record<CasePriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};
