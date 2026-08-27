export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "DISPUTED"
  | "CANCELLED"
  | "WRITTEN_OFF";

export type PaymentMethod = "BANK_TRANSFER" | "CHEQUE" | "CASH" | "UPI" | "CARD";
export type PaymentStatus = "RECORDED" | "VERIFIED" | "RECONCILED" | "DISPUTED" | "REFUNDED";

export interface InvoiceLineItem {
  id: string;
  sortOrder: number;
  itemType: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discountPct: string;
  lineTotal: string;
  taxRate: string;
  hsnCode: string | null;
  gstType: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber: string | null;
  notes: string | null;
  status: PaymentStatus;
  recordedBy: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  quoteId: string | null;
  organizationId: string;
  status: InvoiceStatus;
  issueDate: string | null;
  dueDate: string | null;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  paidAmount: string;
  currency: string;
  paymentTerms: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  case: { id: string; caseNumber: string };
  organization: { id: string; name: string };
  lineItems: InvoiceLineItem[];
  payments: Payment[];
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
  WRITTEN_OFF: "Written Off",
};

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ISSUED: "bg-blue-100 text-blue-700",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  DISPUTED: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-slate-200 text-slate-500",
  WRITTEN_OFF: "bg-slate-200 text-slate-400",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
};

export function formatINR(value: string | number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value));
}

export function paidPercent(inv: Invoice): number {
  const total = Number(inv.totalAmount);
  if (total === 0) return 0;
  return Math.min(100, Math.round((Number(inv.paidAmount) / total) * 100));
}
