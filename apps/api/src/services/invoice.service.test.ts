import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as invoiceRepo from "../repositories/invoice.repository.js";
import * as quoteRepo from "../repositories/quote.repository.js";
import * as caseRepo from "../repositories/service-case.repository.js";
import { addPayment, editInvoice, getInvoice, listInvoices, openInvoice } from "./invoice.service.js";

vi.mock("../repositories/invoice.repository.js");
vi.mock("../repositories/quote.repository.js");
vi.mock("../repositories/service-case.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const CASE_ID = "550e8400-e29b-41d4-a716-446655440001";
const INV_ID = "550e8400-e29b-41d4-a716-446655440003";
const QUOTE_ID = "550e8400-e29b-41d4-a716-446655440002";

const mockCase = {
  id: CASE_ID,
  caseNumber: "WFC-2026-0001",
  organization: { id: "org-1", name: "Apollo Hospitals Delhi" },
} as never;

const mockInvoice = {
  id: INV_ID,
  invoiceNumber: "INV-2026-0001",
  caseId: CASE_ID,
  quoteId: null,
  organizationId: "org-1",
  status: "DRAFT" as const,
  issueDate: null,
  dueDate: null,
  subtotal: "0.00" as unknown as number,
  taxAmount: "0.00" as unknown as number,
  totalAmount: "0.00" as unknown as number,
  paidAmount: "0.00" as unknown as number,
  currency: "INR",
  paymentTerms: null,
  cancellationReason: null,
  cancelledAt: null,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  case: { id: CASE_ID, caseNumber: "WFC-2026-0001" },
  organization: { id: "org-1", name: "Apollo Hospitals Delhi" },
  lineItems: [],
  payments: [],
};

const mockPayment = {
  id: "pay-1",
  invoiceId: INV_ID,
  amount: "5900.00" as unknown as number,
  paymentDate: new Date("2026-02-01"),
  method: "BANK_TRANSFER" as const,
  referenceNumber: "TXN001",
  notes: null,
  status: "RECORDED" as const,
  recordedBy: "user-1",
  verifiedBy: null,
  verifiedAt: null,
  createdAt: new Date("2026-02-01"),
};

beforeEach(() => vi.clearAllMocks());

describe("listInvoices", () => {
  it("returns all invoices", async () => {
    vi.mocked(invoiceRepo.findInvoices).mockResolvedValue([mockInvoice]);
    const result = await listInvoices({}, actor);
    expect(result).toHaveLength(1);
    expect(result[0].invoiceNumber).toBe("INV-2026-0001");
  });
});

describe("getInvoice", () => {
  it("returns invoice with payments", async () => {
    vi.mocked(invoiceRepo.findInvoiceById).mockResolvedValue({ ...mockInvoice, payments: [mockPayment] });
    const result = await getInvoice(INV_ID, actor);
    expect(result.payments).toHaveLength(1);
  });

  it("throws NotFoundError when missing", async () => {
    vi.mocked(invoiceRepo.findInvoiceById).mockResolvedValue(null);
    await expect(getInvoice("missing", actor)).rejects.toThrow(NotFoundError);
  });
});

describe("openInvoice", () => {
  it("creates blank invoice for a case", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(mockCase);
    vi.mocked(invoiceRepo.createInvoice).mockResolvedValue(mockInvoice);

    const result = await openInvoice({ caseId: CASE_ID }, actor);
    expect(result.invoiceNumber).toBe("INV-2026-0001");
    expect(invoiceRepo.createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({ caseId: CASE_ID, createdBy: "user-1" }),
    );
  });

  it("throws NotFoundError when case missing", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);
    await expect(openInvoice({ caseId: CASE_ID }, actor)).rejects.toThrow(NotFoundError);
  });

  it("throws ValidationError when quoteId given but quote is not APPROVED", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(mockCase);
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue({
      id: QUOTE_ID, status: "DRAFT",
    } as never);

    await expect(openInvoice({ caseId: CASE_ID, quoteId: QUOTE_ID }, actor)).rejects.toThrow(ValidationError);
  });
});

describe("editInvoice", () => {
  it("updates DRAFT invoice", async () => {
    vi.mocked(invoiceRepo.findInvoiceById).mockResolvedValue(mockInvoice);
    vi.mocked(invoiceRepo.updateInvoice).mockResolvedValue({ ...mockInvoice, status: "ISSUED" as const });

    const result = await editInvoice(INV_ID, { status: "ISSUED" }, actor);
    expect(result.status).toBe("ISSUED");
  });

  it("throws ValidationError when invoice is CANCELLED", async () => {
    vi.mocked(invoiceRepo.findInvoiceById).mockResolvedValue({ ...mockInvoice, status: "CANCELLED" as const });
    await expect(editInvoice(INV_ID, { status: "ISSUED" }, actor)).rejects.toThrow(ValidationError);
  });
});

describe("addPayment", () => {
  it("records payment against invoice", async () => {
    vi.mocked(invoiceRepo.findInvoiceById).mockResolvedValue({
      ...mockInvoice,
      status: "ISSUED" as const,
      totalAmount: "5900.00" as unknown as number,
    });
    vi.mocked(invoiceRepo.recordPayment).mockResolvedValue(mockPayment);

    const result = await addPayment(
      INV_ID,
      { amount: 5900, paymentDate: new Date("2026-02-01"), method: "BANK_TRANSFER" },
      actor,
    );
    expect(result.amount).toBe("5900.00");
    expect(invoiceRepo.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: INV_ID, recordedBy: "user-1" }),
    );
  });

  it("throws ValidationError when invoice is PAID", async () => {
    vi.mocked(invoiceRepo.findInvoiceById).mockResolvedValue({ ...mockInvoice, status: "PAID" as const });
    await expect(
      addPayment(INV_ID, { amount: 100, paymentDate: new Date(), method: "CASH" }, actor),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError when invoice is CANCELLED", async () => {
    vi.mocked(invoiceRepo.findInvoiceById).mockResolvedValue({ ...mockInvoice, status: "CANCELLED" as const });
    await expect(
      addPayment(INV_ID, { amount: 100, paymentDate: new Date(), method: "CASH" }, actor),
    ).rejects.toThrow(ValidationError);
  });
});
