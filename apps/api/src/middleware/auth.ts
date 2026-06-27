import type { UserRole } from "@repo/db";
import { createMiddleware } from "hono/factory";
import { AuthError } from "../lib/errors.js";
import { verifyToken } from "../lib/token.js";

export type AuthUser = {
  id: string;
  role: UserRole;
};

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const requireAuth = createMiddleware(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) throw new AuthError();

  const token = header.slice(7);
  const payload = await verifyToken(token).catch(() => {
    throw new AuthError();
  });

  if (payload["type"] !== "access") throw new AuthError();

  c.set("user", {
    id: payload.sub!,
    role: payload["role"] as UserRole,
  });

  await next();
});
