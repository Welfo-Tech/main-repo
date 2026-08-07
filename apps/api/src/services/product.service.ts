import { ConflictError, NotFoundError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  type ProductFilters,
  createProduct,
  findProductById,
  findProducts,
  updateProduct,
} from "../repositories/product.repository.js";
import type { CreateProductInput, UpdateProductInput } from "../routes/v1/products/schema.js";

function handleSerialConflict(err: unknown): never {
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  ) {
    throw new ConflictError("serial number already registered");
  }
  throw err as Error;
}

export async function listProducts(filters: ProductFilters, _actor: AuthUser) {
  return findProducts(filters);
}

export async function getProduct(id: string, _actor: AuthUser) {
  const product = await findProductById(id);
  if (!product) throw new NotFoundError("product not found");
  return product;
}

export async function registerProduct(data: CreateProductInput, _actor: AuthUser) {
  return createProduct(data).catch(handleSerialConflict);
}

export async function editProduct(id: string, data: UpdateProductInput, _actor: AuthUser) {
  const existing = await findProductById(id);
  if (!existing) throw new NotFoundError("product not found");
  return updateProduct(id, data).catch(handleSerialConflict);
}
