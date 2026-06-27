import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import * as authService from "../../../services/auth.service.js";
import { loginSchema, refreshSchema } from "./schema.js";

export const authRouter = new Hono();

authRouter.post("/login", validate("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const result = await authService.login(email, password);
  return c.json(result, 200);
});

authRouter.post("/logout", (c) => c.body(null, 204));

authRouter.post("/refresh", validate("json", refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid("json");
  const result = await authService.refresh(refreshToken);
  return c.json(result, 200);
});

authRouter.get("/me", requireAuth, async (c) => {
  const { id } = c.get("user");
  const user = await authService.getMe(id);
  return c.json(user, 200);
});
