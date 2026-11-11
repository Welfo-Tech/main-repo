import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as productService from "../../../services/product.service.js";
import { CreateProductSchema, ListProductsQuerySchema, UpdateProductSchema } from "./schema.js";

export const productsRouter = new Hono();

productsRouter.use(requireAuth);

productsRouter.get(
  "/",
  validate("query", ListProductsQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const products = await productService.listProducts(query, c.get("user"));
    return c.json(products, 200);
  },
);

productsRouter.get("/:id", async (c) => {
  const product = await productService.getProduct(c.req.param("id"), c.get("user"));
  return c.json(product, 200);
});

productsRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateProductSchema),
  async (c) => {
    const data = c.req.valid("json");
    const product = await productService.registerProduct(data, c.get("user"));
    return c.json(product, 201);
  },
);

productsRouter.patch(
  "/:id",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateProductSchema),
  async (c) => {
    const data = c.req.valid("json");
    const product = await productService.editProduct(c.req.param("id"), data, c.get("user"));
    return c.json(product, 200);
  },
);
