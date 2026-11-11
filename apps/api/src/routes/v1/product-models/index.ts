import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as productModelService from "../../../services/product-model.service.js";
import { CreateProductModelSchema, ListProductModelsQuerySchema, UpdateProductModelSchema } from "./schema.js";

export const productModelsRouter = new Hono();

productModelsRouter.use(requireAuth);

productModelsRouter.get(
  "/",
  validate("query", ListProductModelsQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const models = await productModelService.listProductModels(query, c.get("user"));
    return c.json(models, 200);
  },
);

productModelsRouter.get("/:id", async (c) => {
  const model = await productModelService.getProductModel(c.req.param("id"), c.get("user"));
  return c.json(model, 200);
});

productModelsRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateProductModelSchema),
  async (c) => {
    const data = c.req.valid("json");
    const model = await productModelService.createModel(data, c.get("user"));
    return c.json(model, 201);
  },
);

productModelsRouter.patch(
  "/:id",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateProductModelSchema),
  async (c) => {
    const data = c.req.valid("json");
    const model = await productModelService.updateModel(c.req.param("id"), data, c.get("user"));
    return c.json(model, 200);
  },
);

productModelsRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  async (c) => {
    await productModelService.deactivateModel(c.req.param("id"), c.get("user"));
    return c.body(null, 204);
  },
);
