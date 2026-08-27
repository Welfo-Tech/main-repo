import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { ConflictError, NotFoundError } from "../../../lib/errors.js";
import * as productService from "../../../services/product.service.js";
import * as tokenLib from "../../../lib/token.js";

vi.mock("../../../services/product.service.js");
vi.mock("../../../lib/token.js");

const mockProduct = {
  id: "product-1",
  serialNumber: "WF-2024-00001",
  modelId: "model-1",
  ownerOrgId: "org-1",
  manufactureDate: new Date("2024-01-01").toISOString(),
  saleDate: null,
  warrantyExpiry: null,
  status: "REGISTERED",
  notes: null,
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
  model: { id: "model-1", name: "Olympus CF-HQ190", category: "ENDOSCOPE", manufacturer: "Olympus" },
  ownerOrg: { id: "org-1", name: "City General Hospital" },
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

describe("GET /api/v1/products", () => {
  it("returns 200 with product list", async () => {
    mockValidAuth();
    vi.mocked(productService.listProducts).mockResolvedValue([mockProduct] as never);

    const res = await app.request("/api/v1/products", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/products");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/products/:id", () => {
  it("returns 200 with product including model and owner", async () => {
    mockValidAuth();
    vi.mocked(productService.getProduct).mockResolvedValue(mockProduct as never);

    const res = await app.request("/api/v1/products/product-1", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["id"]).toBe("product-1");
    expect(body["model"]).toBeDefined();
    expect(body["ownerOrg"]).toBeDefined();
  });

  it("returns 404 when product not found", async () => {
    mockValidAuth();
    vi.mocked(productService.getProduct).mockRejectedValue(
      new NotFoundError("product not found"),
    );

    const res = await app.request("/api/v1/products/missing", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/products", () => {
  it("returns 201 with registered product", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(productService.registerProduct).mockResolvedValue(mockProduct as never);

    const res = await app.request("/api/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ serialNumber: "WF-2024-00001" }),
    });

    expect(res.status).toBe(201);
  });

  it("returns 400 on invalid payload", async () => {
    mockValidAuth();

    const res = await app.request("/api/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 when role is TECHNICIAN", async () => {
    mockValidAuth(UserRole.TECHNICIAN);

    const res = await app.request("/api/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ serialNumber: "WF-2024-00001" }),
    });

    expect(res.status).toBe(403);
  });

  it("returns 409 on duplicate serial number", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(productService.registerProduct).mockRejectedValue(
      new ConflictError("serial number already registered"),
    );

    const res = await app.request("/api/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ serialNumber: "WF-2024-00001" }),
    });

    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/v1/products/:id", () => {
  it("returns 200 with updated product", async () => {
    mockValidAuth(UserRole.OPERATIONS);
    vi.mocked(productService.editProduct).mockResolvedValue({
      ...mockProduct,
      status: "IN_SERVICE",
    } as never);

    const res = await app.request("/api/v1/products/product-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ status: "IN_SERVICE" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("IN_SERVICE");
  });

  it("returns 404 when product does not exist", async () => {
    mockValidAuth();
    vi.mocked(productService.editProduct).mockRejectedValue(
      new NotFoundError("product not found"),
    );

    const res = await app.request("/api/v1/products/missing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ notes: "update" }),
    });

    expect(res.status).toBe(404);
  });
});
