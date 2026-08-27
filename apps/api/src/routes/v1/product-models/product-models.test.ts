import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError } from "../../../lib/errors.js";
import * as productModelService from "../../../services/product-model.service.js";
import * as tokenLib from "../../../lib/token.js";

vi.mock("../../../services/product-model.service.js");
vi.mock("../../../lib/token.js");

const mockModel = {
  id: "model-1",
  name: "Olympus CF-HQ190",
  category: "ENDOSCOPE",
  manufacturer: "Olympus",
  description: null,
  specifications: null,
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

describe("GET /api/v1/product-models", () => {
  it("returns 200 with model list", async () => {
    mockValidAuth();
    vi.mocked(productModelService.listProductModels).mockResolvedValue([mockModel] as never);

    const res = await app.request("/api/v1/product-models", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/product-models");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/product-models/:id", () => {
  it("returns 200 with model", async () => {
    mockValidAuth();
    vi.mocked(productModelService.getProductModel).mockResolvedValue(mockModel as never);

    const res = await app.request("/api/v1/product-models/model-1", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["id"]).toBe("model-1");
  });

  it("returns 404 when model not found", async () => {
    mockValidAuth();
    vi.mocked(productModelService.getProductModel).mockRejectedValue(
      new NotFoundError("product model not found"),
    );

    const res = await app.request("/api/v1/product-models/missing", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/product-models", () => {
  it("returns 201 with created model", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(productModelService.createModel).mockResolvedValue(mockModel as never);

    const res = await app.request("/api/v1/product-models", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "Olympus CF-HQ190", category: "ENDOSCOPE" }),
    });

    expect(res.status).toBe(201);
  });

  it("returns 400 on invalid payload", async () => {
    mockValidAuth();

    const res = await app.request("/api/v1/product-models", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "Missing category" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 when role is TECHNICIAN", async () => {
    mockValidAuth(UserRole.TECHNICIAN);

    const res = await app.request("/api/v1/product-models", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "Test", category: "ENDOSCOPE" }),
    });

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/v1/product-models/:id", () => {
  it("returns 200 with updated model", async () => {
    mockValidAuth(UserRole.OPERATIONS);
    vi.mocked(productModelService.updateModel).mockResolvedValue({
      ...mockModel,
      manufacturer: "Welfo",
    } as never);

    const res = await app.request("/api/v1/product-models/model-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ manufacturer: "Welfo" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["manufacturer"]).toBe("Welfo");
  });

  it("returns 404 when model does not exist", async () => {
    mockValidAuth();
    vi.mocked(productModelService.updateModel).mockRejectedValue(
      new NotFoundError("product model not found"),
    );

    const res = await app.request("/api/v1/product-models/missing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ isActive: false }),
    });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/product-models/:id", () => {
  it("returns 204 on success", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(productModelService.deactivateModel).mockResolvedValue(undefined as never);

    const res = await app.request("/api/v1/product-models/model-1", {
      method: "DELETE",
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(204);
  });

  it("returns 403 when role is OPERATIONS", async () => {
    mockValidAuth(UserRole.OPERATIONS);

    const res = await app.request("/api/v1/product-models/model-1", {
      method: "DELETE",
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(403);
  });
});
