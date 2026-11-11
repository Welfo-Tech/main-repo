import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as caseService from "../../../services/service-case.service.js";
import * as dispatchService from "../../../services/dispatch.service.js";
import * as repairEventService from "../../../services/repair-event.service.js";
import * as photoService from "../../../services/case-photo.service.js";
import * as workbench from "../../../services/technician-workbench.service.js";
import {
  AssignTechnicianSchema,
  CreateCaseSchema,
  CreateDispatchSchema,
  CreateRepairEventSchema,
  ListCasesQuerySchema,
  UpdateCaseSchema,
  UpdateDispatchSchema,
} from "./schema.js";
import {
  AdvanceStatusSchema,
  CasePhotoUploadSchema,
  IrreparableVerdictSchema,
  ProposeIrreparableSchema,
} from "./workbench-schema.js";

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

serviceCasesRouter.post(
  "/:id/assign",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", AssignTechnicianSchema),
  async (c) => {
    const data = c.req.valid("json");
    const sc = await caseService.assignTechnician(
      c.req.param("id"),
      data,
      c.get("user"),
    );
    return c.json(sc, 200);
  },
);

serviceCasesRouter.get("/:id/repair-events", async (c) => {
  const events = await repairEventService.listRepairEvents(
    c.req.param("id"),
    c.get("user"),
  );
  return c.json(events, 200);
});

serviceCasesRouter.post(
  "/:id/repair-events",
  requireRole("ADMIN", "OPERATIONS", "TECHNICIAN"),
  validate("json", CreateRepairEventSchema),
  async (c) => {
    const data = c.req.valid("json");
    const event = await repairEventService.addRepairEvent(
      c.req.param("id"),
      data,
      c.get("user"),
    );
    return c.json(event, 201);
  },
);

serviceCasesRouter.get("/:id/dispatches", async (c) => {
  const dispatches = await dispatchService.listDispatches(
    c.req.param("id"),
    c.get("user"),
  );
  return c.json(dispatches, 200);
});

serviceCasesRouter.post(
  "/:id/dispatches",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateDispatchSchema),
  async (c) => {
    const data = c.req.valid("json");
    const dispatch = await dispatchService.createCaseDispatch(
      c.req.param("id"),
      data,
      c.get("user"),
    );
    return c.json(dispatch, 201);
  },
);

serviceCasesRouter.patch(
  "/:id/dispatches/:dispatchId",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateDispatchSchema),
  async (c) => {
    const data = c.req.valid("json");
    const dispatch = await dispatchService.updateCaseDispatch(
      c.req.param("id"),
      c.req.param("dispatchId"),
      data,
      c.get("user"),
    );
    return c.json(dispatch, 200);
  },
);

serviceCasesRouter.get("/:id/photos", async (c) => {
  const photos = await photoService.listCasePhotos(c.req.param("id")!, c.get("user"));
  return c.json(photos, 200);
});

serviceCasesRouter.post(
  "/:id/photos",
  requireRole("ADMIN", "OPERATIONS", "TECHNICIAN"),
  validate("json", CasePhotoUploadSchema),
  async (c) => {
    const data = c.req.valid("json");
    const result = await photoService.createCasePhotoUploads(
      c.req.param("id")!,
      data,
      c.get("user"),
    );
    return c.json(result, 201);
  },
);

serviceCasesRouter.patch(
  "/:id/progress",
  requireRole("ADMIN", "OPERATIONS", "TECHNICIAN"),
  validate("json", AdvanceStatusSchema),
  async (c) => {
    const { status, note } = c.req.valid("json");
    const sc = await workbench.advanceCaseStatus(
      c.req.param("id")!,
      status,
      note,
      c.get("user"),
    );
    return c.json(sc, 200);
  },
);

serviceCasesRouter.post(
  "/:id/irreparable",
  requireRole("TECHNICIAN", "ADMIN", "OPERATIONS"),
  validate("json", ProposeIrreparableSchema),
  async (c) => {
    const { reason } = c.req.valid("json");
    const sc = await workbench.proposeIrreparable(c.req.param("id")!, reason, c.get("user"));
    return c.json(sc, 201);
  },
);

serviceCasesRouter.post(
  "/:id/irreparable/verdict",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", IrreparableVerdictSchema),
  async (c) => {
    const { verdict, note } = c.req.valid("json");
    const sc = await workbench.ruleOnIrreparable(
      c.req.param("id")!,
      verdict,
      note,
      c.get("user"),
    );
    return c.json(sc, 200);
  },
);

serviceCasesRouter.post(
  "/:id/irreparable/withdraw",
  requireRole("ADMIN", "OPERATIONS", "TECHNICIAN"),
  async (c) => {
    const sc = await workbench.withdrawIrreparable(c.req.param("id")!, c.get("user"));
    return c.json(sc, 200);
  },
);
