import { CasePriority, ServiceCaseStatus, ServiceCaseType, UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError, ValidationError } from "../../../lib/errors.js";
import * as tokenLib from "../../../lib/token.js";
import * as caseService from "../../../services/service-case.service.js";

vi.mock("../../../services/service-case.service.js");
vi.mock("../../../lib/token.js");

const ORG_ID = "550e8400-e29b-41d4-a716-446655440001";
const PRODUCT_ID = "550e8400-e29b-41d4-a716-446655440002";
const CASE_ID = "550e8400-e29b-41d4-a716-446655440003";

const mockCase = {
  id: CASE_ID,
  caseNumber: "WFC-2026-0001",
  type: ServiceCaseType.REPAIR,
  status: ServiceCaseStatus.INTAKE,
  isBillable: true,
  priority: CasePriority.NORMAL,
  slaDeadline: null,
  intakeCondition: null,
  closedAt: null,
  cancellationReason: null,
  holdReason: null,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
  organization: { id: "org-1", name: "Apollo Hospitals Delhi" },
  contact: null,
  product: {
    id: "product-1",
    serialNumber: "WF-2024-00001",
    model: { id: "model-1", name: "Olympus CF-HQ190", category: "ENDOSCOPE" },
  },
  technician: null,
  ticket: null,
};

const adminToken = "Bearer valid-token";

function mockValidAuth(role = UserRole.ADMIN) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({
    sub: "user-1",
    role,
    type: "access",
  } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/service-cases", () => {
  it("returns 200 with case list", async () => {
    mockValidAuth();
    vi.mocked(caseService.listCases).mockResolvedValue([mockCase] as never);

    const res = await app.request("/api/v1/service-cases", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/service-cases");
    expect(res.status).toBe(401);
  });

  it("passes query filters to service", async () => {
    mockValidAuth();
    vi.mocked(caseService.listCases).mockResolvedValue([]);

    await app.request("/api/v1/service-cases?status=INTAKE&priority=HIGH", {
      headers: { Authorization: adminToken },
    });

    expect(caseService.listCases).toHaveBeenCalledWith(
      expect.objectContaining({ status: "INTAKE", priority: "HIGH" }),
      expect.anything(),
    );
  });
});

describe("GET /api/v1/service-cases/:id", () => {
  it("returns 200 with case details including relations", async () => {
    mockValidAuth();
    vi.mocked(caseService.getCase).mockResolvedValue(mockCase as never);

    const res = await app.request("/api/v1/service-cases/${CASE_ID}", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["caseNumber"]).toBe("WFC-2026-0001");
    expect(body["organization"]).toBeDefined();
    expect(body["product"]).toBeDefined();
  });

  it("returns 404 when case not found", async () => {
    mockValidAuth();
    vi.mocked(caseService.getCase).mockRejectedValue(
      new NotFoundError("service case not found"),
    );

    const res = await app.request("/api/v1/service-cases/missing", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/service-cases", () => {
  it("returns 201 with created case", async () => {
    mockValidAuth();
    vi.mocked(caseService.openCase).mockResolvedValue(mockCase as never);

    const res = await app.request("/api/v1/service-cases", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: ORG_ID,
        productId: PRODUCT_ID,
        type: "REPAIR",
        priority: "NORMAL",
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["caseNumber"]).toBe("WFC-2026-0001");
  });

  it("returns 400 when required fields are missing", async () => {
    mockValidAuth();

    const res = await app.request("/api/v1/service-cases", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: ORG_ID }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 for TECHNICIAN role", async () => {
    mockValidAuth(UserRole.TECHNICIAN);

    const res = await app.request("/api/v1/service-cases", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: ORG_ID, productId: PRODUCT_ID }),
    });

    expect(res.status).toBe(403);
  });

  it("returns 404 when org or product not found", async () => {
    mockValidAuth();
    vi.mocked(caseService.openCase).mockRejectedValue(
      new NotFoundError("product not found"),
    );

    const res = await app.request("/api/v1/service-cases", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: ORG_ID, productId: "00000000-0000-0000-0000-000000000000" }),
    });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/service-cases/:id", () => {
  it("returns 200 with updated case", async () => {
    mockValidAuth();
    vi.mocked(caseService.editCase).mockResolvedValue({
      ...mockCase,
      status: ServiceCaseStatus.ASSIGNED,
    } as never);

    const res = await app.request("/api/v1/service-cases/${CASE_ID}", {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ASSIGNED" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("ASSIGNED");
  });

  it("returns 400 on invalid status transition", async () => {
    mockValidAuth();
    vi.mocked(caseService.editCase).mockRejectedValue(
      new ValidationError("invalid status transition to ASSIGNED"),
    );

    const res = await app.request("/api/v1/service-cases/${CASE_ID}", {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ASSIGNED" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 404 when case not found", async () => {
    mockValidAuth();
    vi.mocked(caseService.editCase).mockRejectedValue(
      new NotFoundError("service case not found"),
    );

    const res = await app.request("/api/v1/service-cases/missing", {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ASSIGNED" }),
    });

    expect(res.status).toBe(404);
  });
});
