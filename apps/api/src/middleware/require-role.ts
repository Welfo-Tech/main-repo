import type { UserRole } from "@repo/db";
import { createMiddleware } from "hono/factory";
import { ForbiddenError } from "../lib/errors.js";

export function requireRole(...roles: UserRole[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) throw new ForbiddenError();
    await next();
  });
}
