export type TicketStatus = "OPEN" | "INTAKE_RECEIVED" | "CONVERTED" | "REJECTED" | "DEFERRED";
export type TicketUrgency = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface Ticket {
  id: string;
  ticketNumber: string;
  organizationId: string;
  contactId: string | null;
  productId: string | null;
  reportedProblem: string;
  urgency: TicketUrgency;
  status: TicketStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string };
  contact: { id: string; name: string; phone: string | null } | null;
  product: {
    id: string;
    serialNumber: string;
    model: { id: string; name: string; category: string };
  } | null;
}

export const URGENCY_LABELS: Record<TicketUrgency, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const URGENCY_COLORS: Record<TicketUrgency, string> = {
  LOW: "bg-slate-100 text-slate-700",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  INTAKE_RECEIVED: "Intake Received",
  CONVERTED: "Converted",
  REJECTED: "Rejected",
  DEFERRED: "Deferred",
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  INTAKE_RECEIVED: "bg-blue-100 text-blue-700",
  CONVERTED: "bg-purple-100 text-purple-700",
  REJECTED: "bg-red-100 text-red-700",
  DEFERRED: "bg-slate-100 text-slate-700",
};
