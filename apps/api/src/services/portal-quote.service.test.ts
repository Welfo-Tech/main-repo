import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as quoteRepo from "../repositories/quote.repository.js";
import { decideOnQuote, getPortalQuote } from "./portal-quote.service.js";

vi.mock("../repositories/quote.repository.js");
vi.mock("./notification.service.js");

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { webInquiry: { findUnique: vi.fn() } },
}));
vi.mock("@repo/db", async importOriginal => ({
  ...(await importOriginal<typeof import("@repo/db")>()),
  prisma: prismaMock,
}));

const REF = "WFI-2026-0001";
const EMAIL = "anand@apollodelhi.com";

const inquiry = {
  inquiryNumber: REF,
  submitterEmail: EMAIL,
  convertedCaseId: "case-1",
  serialNumber: "WF-2024-00002",
  product: { model: { name: "Welfo Laparoscope 10mm 30deg" } },
};

function quote(over: Record<string, unknown> = {}) {
  return {
    id: "q-1",
    quoteNumber: "QTE-2026-0001",
    version: 1,
    caseId: "case-1",
    status: "SENT",
    currency: "INR",
    subtotal: "1000.00",
    taxAmount: "180.00",
    totalAmount: "1180.00",
    validUntil: null,
    terms: null,
    approvedByName: null,
    approvedAt: null,
    lineItems: [],
    ...over,
  } as never;
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.webInquiry.findUnique.mockResolvedValue(inquiry);
});

describe("getPortalQuote", () => {
  it("returns the live quote for a matching reference and email", async () => {
    vi.mocked(quoteRepo.findQuotes).mockResolvedValue([quote()]);

    const res = await getPortalQuote(REF, EMAIL);

    expect(res.found).toBe(true);
    expect(res.quote?.quoteNumber).toBe("QTE-2026-0001");
    expect(res.instrument?.serialNumber).toBe("WF-2024-00002");
  });

  it("reveals nothing on a wrong email", async () => {
    const res = await getPortalQuote(REF, "attacker@evil.com");

    expect(res).toEqual({ found: false });
    expect(JSON.stringify(res)).not.toContain("QTE-");
  });

  it("looks the same for an unknown reference as for a wrong email", async () => {
    prismaMock.webInquiry.findUnique.mockResolvedValue(null);
    expect(await getPortalQuote("WFI-9999-9999", EMAIL)).toEqual({ found: false });
  });

  it("reports nothing when the inquiry never became a case", async () => {
    prismaMock.webInquiry.findUnique.mockResolvedValue({ ...inquiry, convertedCaseId: null });
    expect(await getPortalQuote(REF, EMAIL)).toEqual({ found: false });
  });
});

describe("decideOnQuote", () => {
  it("records an approval as coming from the customer, not staff", async () => {
    vi.mocked(quoteRepo.findQuotes).mockResolvedValue([quote()]);
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(quote());
    vi.mocked(quoteRepo.updateQuote).mockResolvedValue(
      quote({ status: "APPROVED" }),
    );

    await decideOnQuote(REF, EMAIL, "APPROVE", "Dr. Anand Mehta");

    expect(quoteRepo.updateQuote).toHaveBeenCalledWith(
      "q-1",
      expect.objectContaining({
        status: "APPROVED",
        approvedByName: "Dr. Anand Mehta",
        approvalMethod: "PORTAL",
      }),
    );
  });

  it("does NOT move the case — staff authorise work separately", async () => {
    vi.mocked(quoteRepo.findQuotes).mockResolvedValue([quote()]);
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(quote());
    vi.mocked(quoteRepo.updateQuote).mockResolvedValue(quote({ status: "APPROVED" }));

    await decideOnQuote(REF, EMAIL, "APPROVE", "Dr. Anand Mehta");

    const touched = JSON.stringify(vi.mocked(quoteRepo.updateQuote).mock.calls);
    expect(touched).not.toContain("WORK_AUTHORIZED");
  });

  it("records a rejection reason", async () => {
    vi.mocked(quoteRepo.findQuotes).mockResolvedValue([quote()]);
    vi.mocked(quoteRepo.findQuoteById).mockResolvedValue(quote());
    vi.mocked(quoteRepo.updateQuote).mockResolvedValue(quote({ status: "REJECTED" }));

    await decideOnQuote(REF, EMAIL, "REJECT", "Dr. Anand Mehta", "Too expensive");

    expect(quoteRepo.updateQuote).toHaveBeenCalledWith(
      "q-1",
      expect.objectContaining({ status: "REJECTED", rejectionReason: "Too expensive" }),
    );
  });

  it("refuses a second decision once settled", async () => {
    vi.mocked(quoteRepo.findQuotes).mockResolvedValue([quote({ status: "APPROVED" })]);

    await expect(
      decideOnQuote(REF, EMAIL, "APPROVE", "Someone Else"),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(quoteRepo.updateQuote).not.toHaveBeenCalled();
  });

  it("refuses when the email does not match", async () => {
    await expect(
      decideOnQuote(REF, "attacker@evil.com", "APPROVE", "Attacker"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(quoteRepo.updateQuote).not.toHaveBeenCalled();
  });
});
