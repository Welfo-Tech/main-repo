# 2026-08-08 CustomerContacts Domain API

## What was done

CustomerContacts API built as a nested resource under organizations.

Branch: `feat/api-v1-customer-contacts` (branched from `feat/api-v1-organizations`)
Commit: `98a15db feat: add customer-contacts domain — repo, service, routes, tests`

---

## Files created

- `apps/api/src/repositories/customer-contact.repository.ts` — findContactsByOrgId, findContactById, createContact, updateContact, softDeleteContact
- `apps/api/src/services/customer-contact.service.ts` — listContacts, getContact, addContact, editContact, removeContact
- `apps/api/src/routes/v1/organizations/contacts/schema.ts` — CreateContactSchema, UpdateContactSchema (Zod)
- `apps/api/src/routes/v1/organizations/contacts/index.ts` — 5 routes with requireAuth and requireRole guards
- `apps/api/src/services/customer-contact.service.test.ts` — 10 service tests
- `apps/api/src/routes/v1/organizations/contacts/contacts.test.ts` — 12 route tests

## Files modified

- `apps/api/src/routes/v1/organizations/index.ts` — added contactsRouter import, mounted at `/:orgId/contacts`

---

## Endpoints

All routes require auth. Base: `/api/v1/organizations/:orgId/contacts`

| Method | Path          | Role               |
|--------|---------------|--------------------|
| GET    | /             | any                |
| GET    | /:contactId   | any                |
| POST   | /             | ADMIN, OPERATIONS  |
| PATCH  | /:contactId   | ADMIN, OPERATIONS  |
| DELETE | /:contactId   | ADMIN only         |

---

## Key decisions

**isPrimary enforcement at DB/service boundary:**
Creating or updating a contact with `isPrimary: true` runs a Prisma `$transaction` that first unsets `isPrimary` on all other contacts in the org, then creates/updates the target contact. This keeps exactly one primary contact per org without a DB-level constraint.

**passwordHash never exposed:**
`contactSelect` explicitly omits `passwordHash` and `deletedAt`. The portal auth layer uses `passwordHash` for customer login, but it must never appear in internal API responses.

**Org existence guard in service layer:**
`requireOrg(orgId)` calls `findOrganizationById` at the start of every service function. If the org is soft-deleted or missing, `NotFoundError` is thrown before any contact operation runs. This gives a clean 404 at the org level, not a Prisma FK error.

**Nested routing via Hono `.route()`:**
`organizationsRouter.route("/:orgId/contacts", contactsRouter)` mounts the contacts router. Hono exposes parent params to child routers — `c.req.param("orgId")` is accessible inside contactsRouter handlers.

---

## Test results

61/61 passing across 7 test files.

---

## What is next

Domain APIs to build next (in order):
1. Products (+ ProductModels)
2. ServiceCases
3. Tickets
4. Quotes
5. Invoices + Payments
