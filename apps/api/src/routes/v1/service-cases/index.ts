import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as caseService from "../../../services/service-case.service.js";
import {
  CreateCaseSchema,
  ListCasesQuerySchema,
  UpdateCaseSchema,
} from "./schema.js";

export const serviceCasesRouter = new Hono();

serviceCasesRouter.use(requireAuth);

serviceCasesRouter.get(
  "/",
  validate("query", ListCasesQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const cases = await caseService.listCases(query, c.get("user"));
    return c.json(cases, 200);
  },
);

serviceCasesRouter.get("/:id", async (c) => {
  const sc = await caseService.getCase(c.req.param("id"), c.get("user"));
  return c.json(sc, 200);
});

serviceCasesRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateCaseSchema),
  async (c) => {
    const data = c.req.valid("json");
    const sc = await caseService.openCase(data, c.get("user"));
    return c.json(sc, 201);
  },
);

serviceCasesRouter.patch(
  "/:id",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateCaseSchema),
  async (c) => {
    const data = c.req.valid("json");
    const sc = await caseService.editCase(
      c.req.param("id"),
      data,
      c.get("user"),
    );
    return c.json(sc, 200);
  },
);
