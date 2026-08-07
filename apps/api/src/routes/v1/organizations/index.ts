import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as orgService from "../../../services/organization.service.js";
import { CreateOrgSchema, ListOrgsQuerySchema, UpdateOrgSchema } from "./schema.js";

export const organizationsRouter = new Hono();

organizationsRouter.use(requireAuth);

organizationsRouter.get(
  "/",
  validate("query", ListOrgsQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const orgs = await orgService.listOrganizations(query, c.get("user"));
    return c.json(orgs, 200);
  },
);

organizationsRouter.get("/:id", async (c) => {
  const org = await orgService.getOrganization(c.req.param("id"), c.get("user"));
  return c.json(org, 200);
});

organizationsRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateOrgSchema),
  async (c) => {
    const data = c.req.valid("json");
    const org = await orgService.createOrg(data, c.get("user"));
    return c.json(org, 201);
  },
);

organizationsRouter.patch(
  "/:id",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateOrgSchema),
  async (c) => {
    const data = c.req.valid("json");
    const org = await orgService.updateOrg(c.req.param("id"), data, c.get("user"));
    return c.json(org, 200);
  },
);

organizationsRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  async (c) => {
    await orgService.deactivateOrg(c.req.param("id"), c.get("user"));
    return c.body(null, 204);
  },
);
