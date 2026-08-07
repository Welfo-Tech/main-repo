# 2026-08-08 Service Cases and Tickets

## What was done

Built the Tickets and ServiceCases domains end-to-end — backend API + frontend UI.
This is the most complex domain yet: 18 status values, DB-level transition guard, number generation via SQL sequences, and a full status update flow on the detail page.

Backend branch: `feat/api-v1-service-cases` (from `origin/active-dev-backend`)
Frontend branch: `feat/admin-service-cases-tickets` (from `origin/active-dev-frontend`)

---

## Backend — Tickets

### New files

**`apps/api/src/repositories/ticket.repository.ts`**
- `findTickets(filters)` — filter by status, urgency, orgId
- `findTicketById(id)` — includes org, contact, product with model
- `createTicket(data)` — calls `generate_ticket_number()` via `$queryRaw` before insert; returns `TKT-YYYY-NNNN`
- `updateTicket(id, data)`

**`apps/api/src/services/ticket.service.ts`**
- `listTickets`, `getTicket`, `openTicket`, `editTicket`
- `openTicket` validates org exists before creating

**`apps/api/src/routes/v1/tickets/schema.ts`**
- `CreateTicketSchema`: organizationId (uuid), reportedProblem, urgency (optional)
- `UpdateTicketSchema`: status, urgency, reportedProblem, contactId/productId (nullable)
- `ListTicketsQuerySchema`: status, urgency, orgId

**`apps/api/src/routes/v1/tickets/index.ts`**
- GET `/api/v1/tickets` — all users (auth required)
- GET `/api/v1/tickets/:id` — single ticket
- POST `/api/v1/tickets` — ADMIN/OPERATIONS only
- PATCH `/api/v1/tickets/:id` — ADMIN/OPERATIONS only

**`apps/api/src/services/ticket.service.test.ts`** — 8 tests
**`apps/api/src/routes/v1/tickets/tickets.test.ts`** — 11 tests

---

## Backend — ServiceCases

### New files

**`apps/api/src/repositories/service-case.repository.ts`**
- `findCases(filters)` — filter by status, priority, orgId, technicianId
- `findCaseById(id)` — includes org, contact, product+model, technician+user, ticket
- `createCase(data)` — calls `generate_case_number()` via `$queryRaw`; always starts at `INTAKE` status; returns `WFC-YYYY-NNNN`
- `updateCase(id, data)`

**`apps/api/src/services/service-case.service.ts`**
- `listCases`, `getCase`, `openCase`, `editCase`
- `openCase` validates org and product both exist
- `handleTriggerError` catches Postgres `P0001` (from the `trg_case_status_transition` trigger) and converts to `ValidationError`

**`apps/api/src/routes/v1/service-cases/schema.ts`**
- `CreateCaseSchema`: organizationId (uuid, required), productId (uuid, required), contactId?, type?, priority?, isBillable?, intakeCondition?, slaDeadline?, ticketId?
- `UpdateCaseSchema`: status?, priority?, isBillable?, assignedTechnicianId?, intakeCondition?, slaDeadline?, cancellationReason?, holdReason?
- `ListCasesQuerySchema`: status?, priority?, orgId?, technicianId?

**`apps/api/src/routes/v1/service-cases/index.ts`**
- GET `/api/v1/service-cases` — all users (auth required)
- GET `/api/v1/service-cases/:id`
- POST `/api/v1/service-cases` — ADMIN/OPERATIONS only
- PATCH `/api/v1/service-cases/:id` — ADMIN/OPERATIONS only; invalid transitions return 400

**`apps/api/src/services/service-case.service.test.ts`** — 10 tests
**`apps/api/src/routes/v1/service-cases/service-cases.test.ts`** — 12 tests

### Modified files

**`apps/api/src/routes/v1/index.ts`**
- Added `ticketsRouter` at `/tickets`
- Added `serviceCasesRouter` at `/service-cases`

**Total: 141/141 tests passing across 15 test files**

---

## Key decisions

**DB trigger error handling:**
The `trg_case_status_transition` trigger raises a Postgres exception (error code `P0001`) when a status transition is invalid. The service layer catches this with a duck-typed check on `err.code === "P0001"` and re-raises as `ValidationError`, which maps to HTTP 400.

**Number generation via $queryRaw:**
Both `generate_case_number()` and `generate_ticket_number()` are called with `prisma.$queryRaw<[{ case_number/ticket_number: string }]>`. The sequence auto-increments each call.

**UUID validation in route tests:**
Zod validates `organizationId` and `productId` as `.uuid()` in POST schemas. Route test bodies must use real UUID strings (e.g., `550e8400-e29b-41d4-a716-446655440001`), not shorthand IDs like `"org-1"`.

---

## Frontend

### New type files

- `apps/admin/types/ticket.ts` — Ticket interface, TicketStatus/TicketUrgency types, STATUS_LABELS, STATUS_COLORS, URGENCY_LABELS, URGENCY_COLORS
- `apps/admin/types/service-case.ts` — ServiceCase interface, all enum types, STATUS_LABELS/COLORS, TYPE_LABELS, PRIORITY_LABELS/COLORS

### Modified pages

**`apps/admin/app/tickets/page.tsx`** (replaced stub)
- List all tickets with status filter chips
- `+ Open Ticket` button loads org dropdown, then reveals inline create form
- Table: Ticket#, Organization, Problem (truncated), Urgency badge, Status badge, Opened date

**`apps/admin/app/service-cases/page.tsx`** (replaced stub)
- List all cases with status filter chips
- `+ Open Case` button loads orgs + products dropdowns
- Table: Case#, Type, Org, Product+model, Priority badge, Status badge, Opened, View →
- After creating, navigates to the new case's detail page

### New pages

**`apps/admin/app/service-cases/[id]/page.tsx`**
- Fetches case with full relations on load
- Header: case number (monospace), type, status badge, priority badge
- Detail grid: org, product+serial, contact, technician, billable, SLA deadline, ticket link, dates
- Intake condition card (if set)
- Hold reason card (if set), Cancellation reason card (if set)
- Status update panel: shows valid next statuses as toggle buttons
  - If CANCELLED selected: shows cancellationReason textarea
  - If ON_HOLD selected: shows holdReason textarea
  - Confirm button sends PATCH, refreshes the case

---

## Demo seed

**`packages/db/prisma/seed.ts`**
Creates:
- Admin user: `admin@welfo.local` / `welfo@admin123` (role: ADMIN)
- Ops user: `ops@welfo.local` / `welfo@ops123` (role: OPERATIONS)
- Organization: Apollo Hospitals Delhi (HOSPITAL, PREMIUM)
- Contact: Dr. Neha Sharma (primary)
- Product model: Olympus CF-HQ190L (COLONOSCOPE, Olympus)
- Product: serial `WF-2024-00001`, IN_SERVICE, owned by Apollo Hospitals

Passwords are pre-hashed with bcrypt (rounds=12) and hardcoded in the seed to avoid adding bcryptjs as a dependency to @repo/db.

---

## Demo setup checklist

To get a fully working demo, these steps are needed:

1. `apps/api/.env` must have `JWT_SECRET`:
   ```
   JWT_SECRET=$(openssl rand -hex 32)
   ```

2. `apps/admin/.env.local` must have (create this file — it's gitignored):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. Run Neon migrations (needs DATABASE_URL in .env):
   ```
   cd packages/db && npx prisma migrate deploy
   ```

4. Run seed:
   ```
   cd packages/db && npx tsx prisma/seed.ts
   ```

5. Start both apps:
   ```
   make up
   ```

---

## Demo workflow (what you can verify end-to-end)

1. Go to `/login` — login as `admin@welfo.local` / `welfo@admin123`
2. Go to `/organizations` — create an organization, view its detail, add a contact
3. Go to `/product-models` — create a product model
4. Go to `/products` — register a product (link it to the org and model)
5. Go to `/tickets` — open a ticket for the org
6. Go to `/service-cases` — open a service case for the org+product
7. On the service case detail page — move the case through status transitions (INTAKE → ASSIGNED → UNDER_ASSESSMENT → WORK_AUTHORIZED → IN_REPAIR → QC_PENDING → QC_PASSED → DISPATCH_READY → DISPATCHED → DELIVERED → CLOSED)

---

## PR targets

- `feat/api-v1-service-cases` → `active-dev-backend`
- `feat/admin-service-cases-tickets` → `active-dev-frontend`

Then both base branches → `active-dev` → `staging` → `dev` → `master`

---

## What is NOT synced yet (backend not built)

- Quotes
- Invoices + Payments
- Dispatch (full tracking)
- Spare Parts
