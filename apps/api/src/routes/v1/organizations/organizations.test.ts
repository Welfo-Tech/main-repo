import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError } from "../../../lib/errors.js";
import * as orgService from "../../../services/organization.service.js";
import * as tokenLib from "../../../lib/token.js";

vi.mock("../../../services/organization.service.js");
vi.mock("../../../lib/token.js");

const mockOrg = {
  id: "org-1",
  name: "City General Hospital",
  type: "HOSPITAL",
  tier: "STANDARD",
  gstNumber: null,
  panNumber: null,
  paymentTermsDays: 30,
  website: null,
  notes: null,
  isActive: true,
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
};

const adminToken = "Bearer valid-token";
const adminPayload = { sub: "user-1", role: UserRole.ADMIN, type: "access" };

function mockValidAuth(role: UserRole = UserRole.ADMIN) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({
    ...adminPayload,
    role,
    sub: "user-1",
  } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/organizations", () => {
  it("returns 200 with org list", async () => {
    mockValidAuth();
    vi.mocked(orgService.listOrganizations).mockResolvedValue([mockOrg] as never);

    const res = await app.request("/api/v1/organizations", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth token", async () => {
    const res = await app.request("/api/v1/organizations");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/organizations/:id", () => {
  it("returns 200 with org", async () => {
    mockValidAuth();
    vi.mocked(orgService.getOrganization).mockResolvedValue(mockOrg as never);

    const res = await app.request("/api/v1/organizations/org-1", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["id"]).toBe("org-1");
  });

  it("returns 404 when org not found", async () => {
    mockValidAuth();
    vi.mocked(orgService.getOrganization).mockRejectedValue(new NotFoundError("organization not found"));

    const res = await app.request("/api/v1/organizations/missing", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/organizations", () => {
  it("returns 201 with created org", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(orgService.createOrg).mockResolvedValue(mockOrg as never);

    const res = await app.request("/api/v1/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "City General Hospital", type: "HOSPITAL" }),
    });

    expect(res.status).toBe(201);
  });

  it("returns 400 on invalid payload", async () => {
    mockValidAuth();

    const res = await app.request("/api/v1/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "Missing type field" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 when role is TECHNICIAN", async () => {
    mockValidAuth(UserRole.TECHNICIAN);

    const res = await app.request("/api/v1/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "Test", type: "HOSPITAL" }),
    });

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/v1/organizations/:id", () => {
  it("returns 200 with updated org", async () => {
    mockValidAuth(UserRole.OPERATIONS);
    vi.mocked(orgService.updateOrg).mockResolvedValue({ ...mockOrg, paymentTermsDays: 45 } as never);

    const res = await app.request("/api/v1/organizations/org-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ paymentTermsDays: 45 }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["paymentTermsDays"]).toBe(45);
  });

  it("returns 404 when org does not exist", async () => {
    mockValidAuth();
    vi.mocked(orgService.updateOrg).mockRejectedValue(new NotFoundError("organization not found"));

    const res = await app.request("/api/v1/organizations/missing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "New Name" }),
    });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/organizations/:id", () => {
  it("returns 204 on success", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(orgService.deactivateOrg).mockResolvedValue(undefined as never);

    const res = await app.request("/api/v1/organizations/org-1", {
      method: "DELETE",
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(204);
  });

  it("returns 403 when role is OPERATIONS", async () => {
    mockValidAuth(UserRole.OPERATIONS);

    const res = await app.request("/api/v1/organizations/org-1", {
      method: "DELETE",
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(403);
  });
});
