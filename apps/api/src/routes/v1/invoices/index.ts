import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as invoiceService from "../../../services/invoice.service.js";
import {
  CreateInvoiceSchema,
  CreatePaymentSchema,
  ListInvoicesQuerySchema,
  UpdateInvoiceSchema,
} from "./schema.js";

export const invoicesRouter = new Hono();

invoicesRouter.use(requireAuth);

invoicesRouter.get(
  "/",
  validate("query", ListInvoicesQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const invoices = await invoiceService.listInvoices(query, c.get("user"));
    return c.json(invoices, 200);
  },
);

invoicesRouter.get("/:id", async (c) => {
  const inv = await invoiceService.getInvoice(c.req.param("id"), c.get("user"));
  return c.json(inv, 200);
});

invoicesRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateInvoiceSchema),
  async (c) => {
    const data = c.req.valid("json");
    const inv = await invoiceService.openInvoice(data, c.get("user"));
    return c.json(inv, 201);
  },
);

invoicesRouter.patch(
  "/:id",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateInvoiceSchema),
  async (c) => {
    const data = c.req.valid("json");
    const inv = await invoiceService.editInvoice(c.req.param("id"), data, c.get("user"));
    return c.json(inv, 200);
  },
);

invoicesRouter.get("/:id/payments", async (c) => {
  const payments = await invoiceService.listPayments(c.req.param("id"), c.get("user"));
  return c.json(payments, 200);
});

invoicesRouter.post(
  "/:id/payments",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreatePaymentSchema),
  async (c) => {
    const data = c.req.valid("json");
    const payment = await invoiceService.addPayment(c.req.param("id"), data, c.get("user"));
    return c.json(payment, 201);
  },
);

invoicesRouter.patch(
  "/:id/payments/:paymentId/verify",
  requireRole("ADMIN"),
  async (c) => {
    const payment = await invoiceService.verifyPayment(
      c.req.param("id"),
      c.req.param("paymentId"),
      c.get("user"),
    );
    return c.json(payment, 200);
  },
);
