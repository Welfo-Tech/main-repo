import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import { findQuoteById } from "../repositories/quote.repository.js";
import { findCaseById } from "../repositories/service-case.repository.js";
import {
  type CreatePaymentData,
  type InvoiceFilters,
  type UpdateInvoiceData,
  createInvoice,
  findInvoiceById,
  findInvoices,
  findPaymentsByInvoice,
  recordPayment,
  updateInvoice,
  updatePaymentStatus,
} from "../repositories/invoice.repository.js";

async function requireInvoice(id: string) {
  const inv = await findInvoiceById(id);
  if (!inv) throw new NotFoundError("invoice not found");
  return inv;
}

export async function listInvoices(filters: InvoiceFilters, _actor: AuthUser) {
  return findInvoices(filters);
}

export async function getInvoice(id: string, _actor: AuthUser) {
  return requireInvoice(id);
}

export interface CreateInvoiceInput {
  caseId: string;
  quoteId?: string;
  issueDate?: Date;
  dueDate?: Date;
  paymentTerms?: string;
}

export async function openInvoice(data: CreateInvoiceInput, actor: AuthUser) {
  const sc = await findCaseById(data.caseId);
  if (!sc) throw new NotFoundError("service case not found");

  let lineItems: Array<{
    sortOrder?: number;
    itemType: "PART" | "LABOR" | "SHIPPING" | "OTHER";
    description: string;
    quantity: string;
    unitPrice: string;
    discountPct?: string;
    lineTotal: string;
    taxRate?: string;
    hsnCode?: string;
    gstType?: "CGST_SGST" | "IGST" | "EXEMPT";
  }> = [];
  let subtotal = "0.00";
  let taxAmount = "0.00";
  let totalAmount = "0.00";

  if (data.quoteId) {
    const quote = await findQuoteById(data.quoteId);
    if (!quote) throw new NotFoundError("quote not found");
    if (quote.status !== "APPROVED") {
      throw new ValidationError("only approved quotes can be invoiced");
    }
    lineItems = quote.lineItems.map((li) => ({
      itemType: li.itemType as "PART" | "LABOR" | "SHIPPING" | "OTHER",
      description: li.description,
      quantity: li.quantity.toString(),
      unitPrice: li.unitPrice.toString(),
      discountPct: li.discountPct.toString(),
      lineTotal: li.lineTotal.toString(),
      taxRate: li.taxRate.toString(),
      hsnCode: li.hsnCode ?? undefined,
      gstType: li.gstType as "CGST_SGST" | "IGST" | "EXEMPT",
    }));
    subtotal = quote.subtotal.toString();
    taxAmount = quote.taxAmount.toString();
    totalAmount = quote.totalAmount.toString();
  }

  return createInvoice({
    caseId: data.caseId,
    organizationId: sc.organization.id,
    quoteId: data.quoteId,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    paymentTerms: data.paymentTerms,
    subtotal,
    taxAmount,
    totalAmount,
    lineItems,
    createdBy: actor.id,
  });
}

export async function editInvoice(
  id: string,
  data: UpdateInvoiceData,
  _actor: AuthUser,
) {
  const inv = await requireInvoice(id);
  if (inv.status === "CANCELLED" || inv.status === "WRITTEN_OFF") {
    throw new ValidationError(`invoice is ${inv.status} and cannot be updated`);
  }
  return updateInvoice(id, data);
}

export async function addPayment(
  invoiceId: string,
  data: Omit<CreatePaymentData, "invoiceId" | "recordedBy">,
  actor: AuthUser,
) {
  const inv = await requireInvoice(invoiceId);
  if (inv.status === "PAID") throw new ValidationError("invoice is already fully paid");
  if (inv.status === "CANCELLED") throw new ValidationError("invoice is cancelled");
  return recordPayment({ ...data, invoiceId, recordedBy: actor.id });
}

export async function listPayments(invoiceId: string, _actor: AuthUser) {
  const inv = await requireInvoice(invoiceId);
  return findPaymentsByInvoice(inv.id);
}

export async function verifyPayment(
  invoiceId: string,
  paymentId: string,
  actor: AuthUser,
) {
  await requireInvoice(invoiceId);
  return updatePaymentStatus(paymentId, "VERIFIED", actor.id);
}
