import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError, ValidationError } from "../../../lib/errors.js";
import * as tokenLib from "../../../lib/token.js";
import * as quoteService from "../../../services/quote.service.js";

vi.mock("../../../services/quote.service.js");
vi.mock("../../../lib/token.js");

const CASE_ID = "550e8400-e29b-41d4-a716-446655440001";
const QUOTE_ID = "550e8400-e29b-41d4-a716-446655440002";

const mockQuote = {
  id: QUOTE_ID,
  quoteNumber: "QTE-2026-0001",
  version: 1,
  caseId: CASE_ID,
  status: "DRAFT",
  subtotal: "5000.00",
  taxAmount: "900.00",
  totalAmount: "5900.00",
  currency: "INR",
  validUntil: null,
  terms: null,
  approvedByName: null,
  approvedAt: null,
  approvalMethod: null,
  rejectionReason: null,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
  case: { id: CASE_ID, caseNumber: "WFC-2026-0001", organization: { id: "org-1", name: "Apollo" } },
  lineItems: [],
};

const adminToken = "Bearer valid-token";

function mockValidAuth(role = UserRole.ADMIN) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({ sub: "user-1", role, type: "access" } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/quotes", () => {
  it("returns 200 with list", async () => {
    mockValidAuth();
    vi.mocked(quoteService.listQuotes).mockResolvedValue([mockQuote] as never);
    const res = await app.request("/api/v1/quotes", { headers: { Authorization: adminToken } });
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/quotes");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/quotes/:id", () => {
  it("returns 200 with quote", async () => {
    mockValidAuth();
    vi.mocked(quoteService.getQuote).mockResolvedValue(mockQuote as never);
    const res = await app.request(`/api/v1/quotes/${QUOTE_ID}`, { headers: { Authorization: adminToken } });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body["quoteNumber"]).toBe("QTE-2026-0001");
  });

  it("returns 404 when not found", async () => {
    mockValidAuth();
    vi.mocked(quoteService.getQuote).mockRejectedValue(new NotFoundError("quote not found"));
    const res = await app.request("/api/v1/quotes/missing", { headers: { Authorization: adminToken } });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/quotes", () => {
  it("returns 201 with created quote", async () => {
    mockValidAuth();
    vi.mocked(quoteService.openQuote).mockResolvedValue(mockQuote as never);
    const res = await app.request("/api/v1/quotes", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: CASE_ID,
        lineItems: [{ itemType: "LABOR", description: "Technician labor", quantity: 5, unitPrice: 1000 }],
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body["quoteNumber"]).toBe("QTE-2026-0001");
  });

  it("returns 400 when lineItems is empty", async () => {
    mockValidAuth();
    const res = await app.request("/api/v1/quotes", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: CASE_ID, lineItems: [] }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 403 for TECHNICIAN", async () => {
    mockValidAuth(UserRole.TECHNICIAN);
    const res = await app.request("/api/v1/quotes", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: CASE_ID, lineItems: [{ itemType: "LABOR", description: "x", quantity: 1, unitPrice: 100 }] }),
    });
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/v1/quotes/:id", () => {
  it("returns 200 with updated quote", async () => {
    mockValidAuth();
    vi.mocked(quoteService.editQuote).mockResolvedValue({ ...mockQuote, status: "UNDER_REVIEW" } as never);
    const res = await app.request(`/api/v1/quotes/${QUOTE_ID}`, {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "UNDER_REVIEW" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body["status"]).toBe("UNDER_REVIEW");
  });

  it("returns 400 when quote is not editable", async () => {
    mockValidAuth();
    vi.mocked(quoteService.editQuote).mockRejectedValue(new ValidationError("quote is APPROVED and cannot be edited"));
    const res = await app.request(`/api/v1/quotes/${QUOTE_ID}`, {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ terms: "net 30" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/quotes/:id/line-items", () => {
  it("returns 201 with new line item", async () => {
    mockValidAuth();
    vi.mocked(quoteService.addItem).mockResolvedValue(mockQuote.lineItems[0] as never);
    const res = await app.request(`/api/v1/quotes/${QUOTE_ID}/line-items`, {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ itemType: "SHIPPING", description: "Courier", quantity: 1, unitPrice: 500 }),
    });
    expect(res.status).toBe(201);
  });
});

describe("DELETE /api/v1/quotes/:id/line-items/:itemId", () => {
  it("returns 204 on removal", async () => {
    mockValidAuth();
    vi.mocked(quoteService.removeItem).mockResolvedValue(undefined);
    const res = await app.request(`/api/v1/quotes/${QUOTE_ID}/line-items/li-1`, {
      method: "DELETE",
      headers: { Authorization: adminToken },
    });
    expect(res.status).toBe(204);
  });
});
