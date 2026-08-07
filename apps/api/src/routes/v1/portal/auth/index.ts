import { Hono } from "hono";
import { validate } from "../../../../lib/validate.js";
import { requirePortalAuth } from "../../../../middleware/portal-auth.js";
import * as portalAuthService from "../../../../services/portal-auth.service.js";
import { portalLoginSchema, portalRefreshSchema } from "./schema.js";

export const portalAuthRouter = new Hono();

portalAuthRouter.post(
  "/login",
  validate("json", portalLoginSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const result = await portalAuthService.portalLogin(email, password);
    return c.json(result, 200);
  },
);

portalAuthRouter.post("/logout", (c) => c.body(null, 204));

portalAuthRouter.post(
  "/refresh",
  validate("json", portalRefreshSchema),
  async (c) => {
    const { refreshToken } = c.req.valid("json");
    const result = await portalAuthService.portalRefresh(refreshToken);
    return c.json(result, 200);
  },
);

portalAuthRouter.get("/me", requirePortalAuth, async (c) => {
  const { id } = c.get("contact");
  const contact = await portalAuthService.getPortalMe(id);
  return c.json(contact, 200);
});
