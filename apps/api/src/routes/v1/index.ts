import { Hono } from "hono";
import { authRouter } from "./auth/index.js";
import { invoicesRouter } from "./invoices/index.js";
import { organizationsRouter } from "./organizations/index.js";
import { portalAuthRouter } from "./portal/auth/index.js";
import { productModelsRouter } from "./product-models/index.js";
import { productsRouter } from "./products/index.js";
import { quotesRouter } from "./quotes/index.js";
import { serviceCasesRouter } from "./service-cases/index.js";
import { ticketsRouter } from "./tickets/index.js";

export const v1Router = new Hono();

v1Router.route("/auth", authRouter);
v1Router.route("/portal/auth", portalAuthRouter);
v1Router.route("/organizations", organizationsRouter);
v1Router.route("/product-models", productModelsRouter);
v1Router.route("/products", productsRouter);
v1Router.route("/tickets", ticketsRouter);
v1Router.route("/service-cases", serviceCasesRouter);
v1Router.route("/quotes", quotesRouter);
v1Router.route("/invoices", invoicesRouter);
