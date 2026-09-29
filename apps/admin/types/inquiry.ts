export type WebInquiryStatus = "PENDING" | "ACKNOWLEDGED" | "CONVERTED" | "CLOSED";
export type InquiryUrgency = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface WebInquiry {
  id: string;
  inquiryNumber: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string | null;
  organizationName: string;
  city: string | null;
  productModel: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  reportedProblem: string;
  urgency: InquiryUrgency;
  status: WebInquiryStatus;
  submittedAt: string;
  updatedAt: string;
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
