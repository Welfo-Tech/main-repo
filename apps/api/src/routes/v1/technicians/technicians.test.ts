import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError, ValidationError } from "../../../lib/errors.js";
import * as techService from "../../../services/technician.service.js";
import * as tokenLib from "../../../lib/token.js";

vi.mock("../../../services/technician.service.js");
vi.mock("../../../lib/token.js");

const mockTech = {
  id: "tech-1",
  employeeId: "EMP-001",
  phone: "+91-9876543210",
  specializations: ["fiber-repair", "endoscopy"],
  isActive: true,
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
  user: { id: "user-1", name: "Ravi Sharma", email: "ravi@welfo.com" },
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

describe("GET /api/v1/technicians", () => {
  it("returns 200 with technician list", async () => {
    mockValidAuth();
    vi.mocked(techService.listTechnicians).mockResolvedValue([mockTech] as never);

    const res = await app.request("/api/v1/technicians", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth token", async () => {
    const res = await app.request("/api/v1/technicians");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/technicians/:id", () => {
  it("returns 200 with technician", async () => {
    mockValidAuth();
    vi.mocked(techService.getTechnician).mockResolvedValue(mockTech as never);

    const res = await app.request("/api/v1/technicians/tech-1", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe("tech-1");
  });

  it("returns 404 when technician not found", async () => {
    mockValidAuth();
    vi.mocked(techService.getTechnician).mockRejectedValue(
      new NotFoundError("technician not found"),
    );

    const res = await app.request("/api/v1/technicians/bad-id", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/technicians", () => {
  it("returns 201 with created technician", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(techService.createTechnicianProfile).mockResolvedValue(mockTech as never);

    const res = await app.request("/api/v1/technicians", {
      method: "POST",
      headers: {
        Authorization: adminToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Ravi Sharma",
        email: "ravi@welfo.local",
        password: "secret123",
        employeeId: "EMP-001",
        phone: "+91-9876543210",
        specializations: ["fiber-repair"],
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { employeeId: string };
    expect(body.employeeId).toBe("EMP-001");
  });

  it("returns 403 for non-admin role", async () => {
    mockValidAuth(UserRole.OPERATIONS);

    const res = await app.request("/api/v1/technicians", {
      method: "POST",
      headers: {
        Authorization: adminToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Ravi Sharma",
        email: "ravi@welfo.local",
        password: "secret123",
        employeeId: "EMP-001",
      }),
    });

    expect(res.status).toBe(403);
  });

  it("returns 400 when user already has a technician profile", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(techService.createTechnicianProfile).mockRejectedValue(
      new ValidationError("user already has a technician profile"),
    );

    const res = await app.request("/api/v1/technicians", {
      method: "POST",
      headers: {
        Authorization: adminToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Ravi Sharma",
        email: "ravi@welfo.local",
        password: "secret123",
        employeeId: "EMP-002",
      }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("technician profile");
  });
});

describe("PATCH /api/v1/technicians/:id", () => {
  it("returns 200 with updated technician", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(techService.editTechnician).mockResolvedValue({
      ...mockTech,
      isActive: false,
    } as never);

    const res = await app.request("/api/v1/technicians/tech-1", {
      method: "PATCH",
      headers: {
        Authorization: adminToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive: false }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { isActive: boolean };
    expect(body.isActive).toBe(false);
  });
});
