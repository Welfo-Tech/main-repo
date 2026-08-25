export type QuoteStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "SUPERSEDED";

export type QuoteLineItemType = "PART" | "LABOR" | "SHIPPING" | "OTHER";
export type GstType = "CGST_SGST" | "IGST" | "EXEMPT";
export type ApprovalMethod = "EMAIL" | "PHONE" | "PORTAL" | "IN_PERSON";

export interface QuoteLineItem {
  id: string;
  sortOrder: number;
  itemType: QuoteLineItemType;
  partId: string | null;
  description: string;
  quantity: string;
  unitPrice: string;
  discountPct: string;
  lineTotal: string;
  taxRate: string;
  hsnCode: string | null;
  gstType: GstType;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  version: number;
  caseId: string;
  status: QuoteStatus;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  validUntil: string | null;
  terms: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  approvalMethod: ApprovalMethod | null;
  rejectionReason: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  case: {
    id: string;
    caseNumber: string;
    organization: { id: string; name: string };
  };
  lineItems: QuoteLineItem[];
}

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under Review",
  SENT: "Sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  SUPERSEDED: "Superseded",
};

export const STATUS_COLORS: Record<QuoteStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  SENT: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-200 text-slate-500",
  SUPERSEDED: "bg-slate-100 text-slate-400",
};

export const ITEM_TYPE_LABELS: Record<QuoteLineItemType, string> = {
  PART: "Part",
  LABOR: "Labor",
  SHIPPING: "Shipping",
  OTHER: "Other",
};

export function formatINR(value: string | number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value));
}
