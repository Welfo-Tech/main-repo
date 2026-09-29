export type WebInquiryStatus = "PENDING" | "ACKNOWLEDGED" | "CONVERTED" | "CLOSED";
export type InquiryUrgency = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export type CasePriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface InquiryProduct {
  id: string;
  serialNumber: string;
  status: string;
  ownerOrgId: string | null;
  model: { id: string; name: string; category: string; manufacturer: string | null } | null;
  ownerOrg: { id: string; name: string } | null;
}

export interface WebInquiry {
  id: string;
  inquiryNumber: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string | null;
  organizationName: string;
  city: string | null;
  serialNumber: string;
  productId: string;
  reportedProblem: string;
  urgency: InquiryUrgency;
  status: WebInquiryStatus;
  photoPaths: string[];
  convertedCaseId: string | null;
  submittedAt: string;
  updatedAt: string;
  product: InquiryProduct;
}

export interface ConvertResult {
  inquiry: WebInquiry;
  ticket: { id: string; ticketNumber: string; status: string };
  serviceCase: { id: string; caseNumber: string; status: string; priority: string };
}

export const STATUS_LABELS: Record<WebInquiryStatus, string> = {
  PENDING: "Pending",
  ACKNOWLEDGED: "Acknowledged",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const URGENCY_LABELS: Record<InquiryUrgency, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const URGENCY_COLORS: Record<InquiryUrgency, string> = {
  LOW: "var(--w-prio-low)",
  NORMAL: "var(--w-prio-normal)",
  HIGH: "var(--w-prio-high)",
  CRITICAL: "var(--w-prio-critical)",
};

export const ALL_PRIORITIES: CasePriority[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
