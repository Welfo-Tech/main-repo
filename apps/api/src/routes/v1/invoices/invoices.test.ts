import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError, ValidationError } from "../../../lib/errors.js";
import * as tokenLib from "../../../lib/token.js";
import * as invoiceService from "../../../services/invoice.service.js";

vi.mock("../../../services/invoice.service.js");
vi.mock("../../../lib/token.js");

const CASE_ID = "550e8400-e29b-41d4-a716-446655440001";
const INV_ID = "550e8400-e29b-41d4-a716-446655440003";

const mockInvoice = {
  id: INV_ID,
  invoiceNumber: "INV-2026-0001",
  caseId: CASE_ID,
  quoteId: null,
  organizationId: "org-1",
  status: "DRAFT",
  issueDate: null,
  dueDate: null,
  subtotal: "0.00",
  taxAmount: "0.00",
  totalAmount: "0.00",
  paidAmount: "0.00",
  currency: "INR",
  paymentTerms: null,
  cancellationReason: null,
  cancelledAt: null,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
  case: { id: CASE_ID, caseNumber: "WFC-2026-0001" },
  organization: { id: "org-1", name: "Apollo Hospitals Delhi" },
  lineItems: [],
  payments: [],
};

const mockPayment = {
  id: "pay-1",
  invoiceId: INV_ID,
  amount: "5900.00",
  paymentDate: new Date("2026-02-01").toISOString(),
  method: "BANK_TRANSFER",
  referenceNumber: "TXN001",
  notes: null,
  status: "RECORDED",
  recordedBy: "user-1",
  verifiedBy: null,
  verifiedAt: null,
  createdAt: new Date("2026-02-01").toISOString(),
};

const adminToken = "Bearer valid-token";

function mockValidAuth(role: UserRole = UserRole.ADMIN) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({ sub: "user-1", role, type: "access" } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/invoices", () => {
  it("returns 200 with list", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.listInvoices).mockResolvedValue([mockInvoice] as never);
    const res = await app.request("/api/v1/invoices", { headers: { Authorization: adminToken } });
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/invoices");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/invoices/:id", () => {
  it("returns 200 with invoice including payments", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.getInvoice).mockResolvedValue({ ...mockInvoice, payments: [mockPayment] } as never);
    const res = await app.request(`/api/v1/invoices/${INV_ID}`, { headers: { Authorization: adminToken } });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body["invoiceNumber"]).toBe("INV-2026-0001");
    expect(body["payments"]).toBeDefined();
  });

  it("returns 404 when not found", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.getInvoice).mockRejectedValue(new NotFoundError("invoice not found"));
    const res = await app.request("/api/v1/invoices/missing", { headers: { Authorization: adminToken } });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/invoices", () => {
  it("returns 201 with created invoice", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.openInvoice).mockResolvedValue(mockInvoice as never);
    const res = await app.request("/api/v1/invoices", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body["invoiceNumber"]).toBe("INV-2026-0001");
  });

  it("returns 403 for TECHNICIAN", async () => {
    mockValidAuth(UserRole.TECHNICIAN);
    const res = await app.request("/api/v1/invoices", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 400 when quote not approved", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.openInvoice).mockRejectedValue(new ValidationError("only approved quotes can be invoiced"));
    const res = await app.request("/api/v1/invoices", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: CASE_ID, quoteId: "550e8400-e29b-41d4-a716-446655440002" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/v1/invoices/:id", () => {
  it("returns 200 on status update", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.editInvoice).mockResolvedValue({ ...mockInvoice, status: "ISSUED" } as never);
    const res = await app.request(`/api/v1/invoices/${INV_ID}`, {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ISSUED" }),
    });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/invoices/:id/payments", () => {
  it("returns 201 with recorded payment", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.addPayment).mockResolvedValue(mockPayment as never);
    const res = await app.request(`/api/v1/invoices/${INV_ID}/payments`, {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 5900, paymentDate: "2026-02-01", method: "BANK_TRANSFER", referenceNumber: "TXN001" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body["amount"]).toBe("5900.00");
  });

  it("returns 400 when invoice is already PAID", async () => {
    mockValidAuth();
    vi.mocked(invoiceService.addPayment).mockRejectedValue(new ValidationError("invoice is already fully paid"));
    const res = await app.request(`/api/v1/invoices/${INV_ID}/payments`, {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100, paymentDate: "2026-02-01", method: "CASH" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 403 for TECHNICIAN", async () => {
    mockValidAuth(UserRole.TECHNICIAN);
    const res = await app.request(`/api/v1/invoices/${INV_ID}/payments`, {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100, paymentDate: "2026-02-01", method: "CASH" }),
    });
    expect(res.status).toBe(403);
  });
});
