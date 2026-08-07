import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "../lib/errors.js";
import * as productRepo from "../repositories/product.repository.js";
import { editProduct, getProduct, listProducts, registerProduct } from "./product.service.js";

vi.mock("../repositories/product.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const mockProduct = {
  id: "product-1",
  serialNumber: "WF-2024-00001",
  modelId: "model-1",
  ownerOrgId: "org-1",
  manufactureDate: new Date("2024-01-01"),
  saleDate: null,
  warrantyExpiry: null,
  status: "REGISTERED" as const,
  notes: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  model: { id: "model-1", name: "Olympus CF-HQ190", category: "ENDOSCOPE" as const, manufacturer: "Olympus" },
  ownerOrg: { id: "org-1", name: "City General Hospital" },
};

beforeEach(() => vi.clearAllMocks());

describe("listProducts", () => {
  it("returns all products matching filters", async () => {
    vi.mocked(productRepo.findProducts).mockResolvedValue([mockProduct]);

    const result = await listProducts({}, actor);

    expect(result).toHaveLength(1);
    expect(result[0].serialNumber).toBe("WF-2024-00001");
    expect(productRepo.findProducts).toHaveBeenCalledWith({});
  });

  it("passes filters through to repo", async () => {
    vi.mocked(productRepo.findProducts).mockResolvedValue([]);

    await listProducts({ status: "UNDER_REPAIR", ownerOrgId: "org-1" }, actor);

    expect(productRepo.findProducts).toHaveBeenCalledWith({
      status: "UNDER_REPAIR",
      ownerOrgId: "org-1",
    });
  });
});

describe("getProduct", () => {
  it("returns product when found", async () => {
    vi.mocked(productRepo.findProductById).mockResolvedValue(mockProduct);

    const result = await getProduct("product-1", actor);

    expect(result.id).toBe("product-1");
    expect(result.model?.name).toBe("Olympus CF-HQ190");
    expect(result.ownerOrg?.name).toBe("City General Hospital");
  });

  it("throws NotFoundError when product does not exist", async () => {
    vi.mocked(productRepo.findProductById).mockResolvedValue(null);

    await expect(getProduct("missing", actor)).rejects.toThrow(NotFoundError);
  });
});

describe("registerProduct", () => {
  it("creates and returns new product", async () => {
    vi.mocked(productRepo.createProduct).mockResolvedValue(mockProduct);

    const result = await registerProduct({ serialNumber: "WF-2024-00001" }, actor);

    expect(result.serialNumber).toBe("WF-2024-00001");
    expect(productRepo.createProduct).toHaveBeenCalledWith({ serialNumber: "WF-2024-00001" });
  });

  it("throws ConflictError on duplicate serial number", async () => {
    vi.mocked(productRepo.createProduct).mockRejectedValue({ code: "P2002" });

    await expect(registerProduct({ serialNumber: "WF-2024-00001" }, actor)).rejects.toThrow(
      ConflictError,
    );
  });
});

describe("editProduct", () => {
  it("updates and returns product", async () => {
    vi.mocked(productRepo.findProductById).mockResolvedValue(mockProduct);
    vi.mocked(productRepo.updateProduct).mockResolvedValue({
      ...mockProduct,
      status: "IN_SERVICE",
    });

    const result = await editProduct("product-1", { status: "IN_SERVICE" }, actor);

    expect(result.status).toBe("IN_SERVICE");
    expect(productRepo.updateProduct).toHaveBeenCalledWith("product-1", { status: "IN_SERVICE" });
  });

  it("throws NotFoundError when product does not exist", async () => {
    vi.mocked(productRepo.findProductById).mockResolvedValue(null);

    await expect(editProduct("missing", { notes: "test" }, actor)).rejects.toThrow(NotFoundError);
    expect(productRepo.updateProduct).not.toHaveBeenCalled();
  });

  it("throws ConflictError on duplicate serial number during update", async () => {
    vi.mocked(productRepo.findProductById).mockResolvedValue(mockProduct);
    vi.mocked(productRepo.updateProduct).mockRejectedValue({ code: "P2002" });

    await expect(
      editProduct("product-1", { serialNumber: "EXISTING-SERIAL" }, actor),
    ).rejects.toThrow(ConflictError);
  });
});
