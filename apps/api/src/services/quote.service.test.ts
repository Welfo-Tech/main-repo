import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as quoteRepo from "../repositories/quote.repository.js";
import * as caseRepo from "../repositories/service-case.repository.js";
import { addItem, editQuote, getQuote, listQuotes, openQuote, removeItem } from "./quote.service.js";

vi.mock("../repositories/quote.repository.js");
vi.mock("../repositories/service-case.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const CASE_ID = "550e8400-e29b-41d4-a716-446655440001";
const QUOTE_ID = "550e8400-e29b-41d4-a716-446655440002";

const mockCase = {
  id: CASE_ID,
  caseNumber: "WFC-2026-0001",
  type: "REPAIR" as const,
  status: "INTAKE" as const,
  isBillable: true,
  priority: "NORMAL" as const,
  slaDeadline: null,
  intakeCondition: null,
  closedAt: null,
  cancellationReason: null,
  holdReason: null,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  organization: { id: "org-1", name: "Apollo Hospitals Delhi" },
  contact: null,
  product: { id: "p-1", serialNumber: "WF-001", model: { id: "m-1", name: "Olympus CF-HQ190L", category: "ENDOSCOPE" as const } },
  technician: null,
  ticket: null,
};

const mockQuote = {
  id: QUOTE_ID,
  quoteNumber: "QTE-2026-0001",
  version: 1,
  caseId: CASE_ID,
  status: "DRAFT" as const,
  subtotal: "5000.00" as unknown as number,
  taxAmount: "900.00" as unknown as number,
  totalAmount: "5900.00" as unknown as number,
  currency: "INR",
  validUntil: null,
  terms: null,
  approvedByName: null,
  approvedAt: null,
  approvalMethod: null,
  rejectionReason: null,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  case: { id: CASE_ID, caseNumber: "WFC-2026-0001", organization: { id: "org-1", name: "Apollo Hospitals Delhi" } },
  lineItems: [
    { id: "li-1", sortOrder: 0, itemType: "LABOR" as const, partId: null, description: "Technician labor", quantity: "5.000" as unknown as number, unitPrice: "1000.00" as unknown as number, discountPct: "0.00" as unknown as number, lineTotal: "5000.00" as unknown as number, taxRate: "18.00" as unknown as number, hsnCode: null, gstType: "CGST_SGST" as const },
  ],
};

beforeEach(() => vi.clearAllMocks());

describe("listQuotes", () => {
  it("returns all quotes", async () => {
    vi.mocked(quoteRepo.findQuotes).mockResolvedValue([mockQuote] as never);
    const result = await listQuotes({}, actor);
    expect(result).toHaveLength(1);
    expect(result[0]!.quoteNumber).toBe("QTE-2026-0001");
  });
});

describe("getQuote", () => {
  it("returns quote when found", async () => {
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(mockQuote as never);
    const result = await getQuote(QUOTE_ID, actor);
    expect(result.id).toBe(QUOTE_ID);
    expect(result.lineItems).toHaveLength(1);
  });

  it("throws NotFoundError when missing", async () => {
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(null);
    await expect(getQuote("missing", actor)).rejects.toThrow(NotFoundError);
  });
});

describe("openQuote", () => {
  it("creates quote after validating case", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(mockCase);
    vi.mocked(quoteRepo.createQuote).mockResolvedValue(mockQuote as never);

    const result = await openQuote(
      { caseId: CASE_ID, lineItems: [{ itemType: "LABOR", description: "labor", quantity: 5, unitPrice: 1000 }] },
      actor,
    );

    expect(result.quoteNumber).toBe("QTE-2026-0001");
    expect(quoteRepo.createQuote).toHaveBeenCalledWith(
      expect.objectContaining({ caseId: CASE_ID, createdBy: "user-1" }),
    );
  });

  it("throws NotFoundError when case missing", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);
    await expect(
      openQuote({ caseId: CASE_ID, lineItems: [] }, actor),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("editQuote", () => {
  it("updates DRAFT quote", async () => {
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(mockQuote as never);
    vi.mocked(quoteRepo.updateQuote).mockResolvedValue({ ...mockQuote, status: "UNDER_REVIEW" as const } as never);

    const result = await editQuote(QUOTE_ID, { status: "UNDER_REVIEW" }, actor);
    expect(result.status).toBe("UNDER_REVIEW");
  });

  it("throws ValidationError when quote is not editable", async () => {
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue({ ...mockQuote, status: "APPROVED" as const } as never);

    await expect(editQuote(QUOTE_ID, { terms: "net 30" }, actor)).rejects.toThrow(ValidationError);
  });
});

describe("addItem", () => {
  it("adds line item to DRAFT quote", async () => {
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(mockQuote as never);
    vi.mocked(quoteRepo.addLineItem).mockResolvedValue(mockQuote.lineItems[0] as never);

    await addItem(QUOTE_ID, { itemType: "SHIPPING", description: "Courier", quantity: 1, unitPrice: 500 }, actor);
    expect(quoteRepo.addLineItem).toHaveBeenCalledWith(QUOTE_ID, expect.objectContaining({ description: "Courier" }));
  });

  it("throws ValidationError when quote is SENT", async () => {
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue({ ...mockQuote, status: "SENT" as const } as never);

    await expect(
      addItem(QUOTE_ID, { itemType: "LABOR", description: "extra", quantity: 1, unitPrice: 100 }, actor),
    ).rejects.toThrow(ValidationError);
  });
});

describe("removeItem", () => {
  it("removes line item from DRAFT quote", async () => {
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(mockQuote as never);
    vi.mocked(quoteRepo.removeLineItem).mockResolvedValue(undefined);

    await removeItem(QUOTE_ID, "li-1", actor);
    expect(quoteRepo.removeLineItem).toHaveBeenCalledWith(QUOTE_ID, "li-1");
  });
});
