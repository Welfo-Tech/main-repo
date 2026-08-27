import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../lib/errors.js";
import * as productModelRepo from "../repositories/product-model.repository.js";
import { createModel, deactivateModel, getProductModel, listProductModels, updateModel } from "./product-model.service.js";

vi.mock("../repositories/product-model.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const mockModel = {
  id: "model-1",
  name: "Olympus CF-HQ190",
  category: "ENDOSCOPE" as const,
  manufacturer: "Olympus",
  description: null,
  specifications: null,
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

beforeEach(() => vi.clearAllMocks());

describe("listProductModels", () => {
  it("returns all models matching filters", async () => {
    vi.mocked(productModelRepo.findProductModels).mockResolvedValue([mockModel]);

    const result = await listProductModels({}, actor);

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Olympus CF-HQ190");
    expect(productModelRepo.findProductModels).toHaveBeenCalledWith({});
  });

  it("passes filters through to repo", async () => {
    vi.mocked(productModelRepo.findProductModels).mockResolvedValue([]);

    await listProductModels({ category: "ENDOSCOPE", isActive: true }, actor);

    expect(productModelRepo.findProductModels).toHaveBeenCalledWith({
      category: "ENDOSCOPE",
      isActive: true,
    });
  });
});

describe("getProductModel", () => {
  it("returns model when found", async () => {
    vi.mocked(productModelRepo.findProductModelById).mockResolvedValue(mockModel);

    const result = await getProductModel("model-1", actor);

    expect(result.id).toBe("model-1");
    expect(result.name).toBe("Olympus CF-HQ190");
  });

  it("throws NotFoundError when model does not exist", async () => {
    vi.mocked(productModelRepo.findProductModelById).mockResolvedValue(null);

    await expect(getProductModel("missing", actor)).rejects.toThrow(NotFoundError);
  });
});

describe("createModel", () => {
  it("creates and returns new model", async () => {
    vi.mocked(productModelRepo.createProductModel).mockResolvedValue(mockModel);

    const result = await createModel(
      { name: "Olympus CF-HQ190", category: "ENDOSCOPE" },
      actor,
    );

    expect(result.name).toBe("Olympus CF-HQ190");
    expect(productModelRepo.createProductModel).toHaveBeenCalledWith({
      name: "Olympus CF-HQ190",
      category: "ENDOSCOPE",
    });
  });
});

describe("updateModel", () => {
  it("updates and returns model", async () => {
    vi.mocked(productModelRepo.findProductModelById).mockResolvedValue(mockModel);
    vi.mocked(productModelRepo.updateProductModel).mockResolvedValue({
      ...mockModel,
      manufacturer: "Welfo",
    });

    const result = await updateModel("model-1", { manufacturer: "Welfo" }, actor);

    expect(result.manufacturer).toBe("Welfo");
    expect(productModelRepo.updateProductModel).toHaveBeenCalledWith("model-1", {
      manufacturer: "Welfo",
    });
  });

  it("throws NotFoundError when model does not exist", async () => {
    vi.mocked(productModelRepo.findProductModelById).mockResolvedValue(null);

    await expect(updateModel("missing", { isActive: false }, actor)).rejects.toThrow(NotFoundError);
    expect(productModelRepo.updateProductModel).not.toHaveBeenCalled();
  });
});

describe("deactivateModel", () => {
  it("deactivates the model", async () => {
    vi.mocked(productModelRepo.findProductModelById).mockResolvedValue(mockModel);
    vi.mocked(productModelRepo.deactivateProductModel).mockResolvedValue({ id: "model-1" });

    await deactivateModel("model-1", actor);

    expect(productModelRepo.deactivateProductModel).toHaveBeenCalledWith("model-1");
  });

  it("throws NotFoundError when model does not exist", async () => {
    vi.mocked(productModelRepo.findProductModelById).mockResolvedValue(null);

    await expect(deactivateModel("missing", actor)).rejects.toThrow(NotFoundError);
    expect(productModelRepo.deactivateProductModel).not.toHaveBeenCalled();
  });
});
