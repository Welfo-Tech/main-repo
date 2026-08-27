import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as techService from "../../../services/technician.service.js";
import {
  CreateTechnicianSchema,
  ListTechniciansQuerySchema,
  UpdateTechnicianSchema,
} from "./schema.js";

export const techniciansRouter = new Hono();

techniciansRouter.use(requireAuth);

techniciansRouter.get(
  "/",
  validate("query", ListTechniciansQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const technicians = await techService.listTechnicians(query, c.get("user"));
    return c.json(technicians, 200);
  },
);

techniciansRouter.get("/:id", async (c) => {
  const tech = await techService.getTechnician(c.req.param("id"), c.get("user"));
  return c.json(tech, 200);
});

techniciansRouter.post(
  "/",
  requireRole("ADMIN"),
  validate("json", CreateTechnicianSchema),
  async (c) => {
    const data = c.req.valid("json");
    const tech = await techService.createTechnicianProfile(data, c.get("user"));
    return c.json(tech, 201);
  },
);

techniciansRouter.patch(
  "/:id",
  requireRole("ADMIN"),
  validate("json", UpdateTechnicianSchema),
  async (c) => {
    const data = c.req.valid("json");
    const tech = await techService.editTechnician(c.req.param("id"), data, c.get("user"));
    return c.json(tech, 200);
  },
);
