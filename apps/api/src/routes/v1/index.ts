import { Hono } from "hono";
import { authRouter } from "./auth/index.js";
import { organizationsRouter } from "./organizations/index.js";
import { portalAuthRouter } from "./portal/auth/index.js";

export const v1Router = new Hono();

v1Router.route("/auth", authRouter);
v1Router.route("/portal/auth", portalAuthRouter);
v1Router.route("/organizations", organizationsRouter);
