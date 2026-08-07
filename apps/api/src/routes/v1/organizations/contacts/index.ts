import { Hono } from "hono";
import { validate } from "../../../../lib/validate.js";
import { requireAuth } from "../../../../middleware/auth.js";
import { requireRole } from "../../../../middleware/require-role.js";
import * as contactService from "../../../../services/customer-contact.service.js";
import { CreateContactSchema, UpdateContactSchema } from "./schema.js";

export const contactsRouter = new Hono();

contactsRouter.use(requireAuth);

contactsRouter.get("/", async (c) => {
  const orgId = c.req.param("orgId");
  const contacts = await contactService.listContacts(orgId, c.get("user"));
  return c.json(contacts, 200);
});

contactsRouter.get("/:contactId", async (c) => {
  const orgId = c.req.param("orgId");
  const contactId = c.req.param("contactId");
  const contact = await contactService.getContact(contactId, orgId, c.get("user"));
  return c.json(contact, 200);
});

contactsRouter.post(
  "/",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", CreateContactSchema),
  async (c) => {
    const orgId = c.req.param("orgId");
    const data = c.req.valid("json");
    const contact = await contactService.addContact(orgId, data, c.get("user"));
    return c.json(contact, 201);
  },
);

contactsRouter.patch(
  "/:contactId",
  requireRole("ADMIN", "OPERATIONS"),
  validate("json", UpdateContactSchema),
  async (c) => {
    const orgId = c.req.param("orgId");
    const contactId = c.req.param("contactId");
    const data = c.req.valid("json");
    const contact = await contactService.editContact(contactId, orgId, data, c.get("user"));
    return c.json(contact, 200);
  },
);

contactsRouter.delete(
  "/:contactId",
  requireRole("ADMIN"),
  async (c) => {
    const orgId = c.req.param("orgId");
    const contactId = c.req.param("contactId");
    await contactService.removeContact(contactId, orgId, c.get("user"));
    return c.body(null, 204);
  },
);
