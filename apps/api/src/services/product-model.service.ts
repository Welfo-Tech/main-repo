import { NotFoundError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  type ProductModelFilters,
  createProductModel,
  deactivateProductModel,
  findProductModelById,
  findProductModels,
  updateProductModel,
} from "../repositories/product-model.repository.js";
import type { CreateProductModelInput, UpdateProductModelInput } from "../routes/v1/product-models/schema.js";

export async function listProductModels(filters: ProductModelFilters, _actor: AuthUser) {
  return findProductModels(filters);
}

export async function getProductModel(id: string, _actor: AuthUser) {
  const model = await findProductModelById(id);
  if (!model) throw new NotFoundError("product model not found");
  return model;
}

export async function createModel(data: CreateProductModelInput, _actor: AuthUser) {
  return createProductModel(data);
}

export async function updateModel(id: string, data: UpdateProductModelInput, _actor: AuthUser) {
  const existing = await findProductModelById(id);
  if (!existing) throw new NotFoundError("product model not found");
  return updateProductModel(id, data);
}

export async function deactivateModel(id: string, _actor: AuthUser) {
  const existing = await findProductModelById(id);
  if (!existing) throw new NotFoundError("product model not found");
  return deactivateProductModel(id);
}
