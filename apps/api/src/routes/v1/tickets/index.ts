import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as ticketService from "../../../services/ticket.service.js";
import {
  CreateTicketSchema,
  ListTicketsQuerySchema,
  UpdateTicketSchema,
} from "./schema.js";

export const ticketsRouter = new Hono();

ticketsRouter.use(requireAuth);

ticketsRouter.get(
  "/",
  validate("query", ListTicketsQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const tickets = await ticketService.listTickets(query, c.get("user"));
    return c.json(tickets, 200);
  },
);

ticketsRouter.get("/:id", async (c) => {
  const ticket = await ticketService.getTicket(c.req.param("id"), c.get("user"));
  return c.json(ticket, 200);
});

ticketsRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateTicketSchema),
  async (c) => {
    const data = c.req.valid("json");
    const ticket = await ticketService.openTicket(data, c.get("user"));
    return c.json(ticket, 201);
  },
);

ticketsRouter.patch(
  "/:id",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateTicketSchema),
  async (c) => {
    const data = c.req.valid("json");
    const ticket = await ticketService.editTicket(
      c.req.param("id"),
      data,
      c.get("user"),
    );
    return c.json(ticket, 200);
  },
);
