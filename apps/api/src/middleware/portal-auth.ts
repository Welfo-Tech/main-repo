import { createMiddleware } from "hono/factory";
import { AuthError } from "../lib/errors.js";
import { verifyToken } from "../lib/token.js";

export type PortalContact = {
  id: string;
  orgId: string;
};

declare module "hono" {
  interface ContextVariableMap {
    contact: PortalContact;
  }
}

export const requirePortalAuth = createMiddleware(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) throw new AuthError();

  const token = header.slice(7);
  const payload = await verifyToken(token).catch(() => {
    throw new AuthError();
  });

  if (payload["type"] !== "portal_access") throw new AuthError();

  c.set("contact", {
    id: payload.sub!,
    orgId: payload["orgId"] as string,
  });

  await next();
});
