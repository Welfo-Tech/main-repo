import { prisma } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import { findQuoteById, findQuotes, updateQuote } from "../repositories/quote.repository.js";
import { notifyQuoteDecision } from "./notification.service.js";

export interface PortalQuoteView {
  found: boolean;
  quote?: {
    quoteNumber: string;
    version: number;
    status: string;
    currency: string;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
    validUntil: Date | null;
    terms: string | null;
    approvedByName: string | null;
    approvedAt: Date | null;
    lineItems: {
      description: string;
      quantity: string;
      unitPrice: string;
      discountPct: string;
      taxRate: string;
      lineTotal: string;
    }[];
  };
  instrument?: { serialNumber: string; model: string | null };
  reference?: string;
}

/**
 * Gated on the inquiry reference plus the submitting email, the same pair the
 * tracking page uses. A mismatch returns the same empty shape as a reference
 * that does not exist, so neither can be used to probe the other.
 */
async function resolveCaseFor(reference: string, email: string) {
  const inquiry = await prisma.webInquiry.findUnique({
    where: { inquiryNumber: reference.trim().toUpperCase() },
    select: {
      inquiryNumber: true,
      submitterEmail: true,
      convertedCaseId: true,
      serialNumber: true,
      product: { select: { model: { select: { name: true } } } },
    },
  });

  if (!inquiry) return null;
  if (inquiry.submitterEmail.toLowerCase() !== email.trim().toLowerCase()) return null;
  if (!inquiry.convertedCaseId) return null;
  return inquiry;
}

/** The quote a customer is being asked to decide on, if there is one. */
export async function getPortalQuote(
  reference: string,
  email: string,
): Promise<PortalQuoteView> {
  const inquiry = await resolveCaseFor(reference, email);
  if (!inquiry) return { found: false };

  const quotes = await findQuotes({ caseId: inquiry.convertedCaseId! });
  const live =
    quotes.find(q => q.status === "SENT") ??
    quotes.find(q => q.status === "APPROVED") ??
    quotes.find(q => q.status === "REJECTED");

  if (!live) return { found: false };

  return {
    found: true,
    reference: inquiry.inquiryNumber,
    instrument: {
      serialNumber: inquiry.serialNumber,
      model: inquiry.product.model?.name ?? null,
    },
    quote: {
      quoteNumber: live.quoteNumber,
      version: live.version,
      status: live.status,
      currency: live.currency,
      subtotal: live.subtotal.toString(),
      taxAmount: live.taxAmount.toString(),
      totalAmount: live.totalAmount.toString(),
      validUntil: live.validUntil,
      terms: live.terms,
      approvedByName: live.approvedByName,
      approvedAt: live.approvedAt,
      lineItems: live.lineItems.map(li => ({
        description: li.description,
        quantity: li.quantity.toString(),
        unitPrice: li.unitPrice.toString(),
        discountPct: li.discountPct.toString(),
        taxRate: li.taxRate.toString(),
        lineTotal: li.lineTotal.toString(),
      })),
    },
  };
}

export async function decideOnQuote(
  reference: string,
  email: string,
  decision: "APPROVE" | "REJECT",
  approverName: string,
  reason?: string,
) {
  const inquiry = await resolveCaseFor(reference, email);
  if (!inquiry) throw new NotFoundError("no quote found for that reference");

  const quotes = await findQuotes({ caseId: inquiry.convertedCaseId! });
  const live = quotes.find(q => q.status === "SENT");

  if (!live) {
    const settled = quotes.find(q => q.status === "APPROVED" || q.status === "REJECTED");
    throw new ValidationError(
      settled
        ? `quote ${settled.quoteNumber} has already been ${settled.status.toLowerCase()}`
        : "there is no quote awaiting your decision",
    );
  }

  const quote = await findQuoteById(live.id);
  if (!quote) throw new NotFoundError("quote not found");

  // approvalMethod records that this came from the customer themselves rather
  // than staff transcribing a phone call. Quote approval is a commercial act.
  const updated = await updateQuote(live.id, {
    status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
    ...(decision === "APPROVE"
      ? {
          approvedByName: approverName.trim(),
          approvedAt: new Date(),
          approvalMethod: "PORTAL" as const,
        }
      : { rejectionReason: reason?.trim() || "Declined by the customer" }),
  });

  notifyQuoteDecision(
    inquiry.convertedCaseId!,
    updated.quoteNumber,
    decision,
    approverName.trim(),
    reason?.trim() || null,
  );

  return {
    quoteNumber: updated.quoteNumber,
    status: updated.status,
    decidedAt: new Date(),
  };
}
