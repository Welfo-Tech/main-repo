# Repair Lifecycle Backend — API v1

**Branch:** `feat/api-v1-repair-lifecycle`
**Commit:** `be6f4f3`
**Date:** 2026-08-27

---

## What Was Built

Full backend API for the repair lifecycle phase. This covers everything between a service case being opened and it being returned to the customer.

### New Files

**Repositories**
- `apps/api/src/repositories/technician.repository.ts` — CRUD for technicians with user join
- `apps/api/src/repositories/repair-event.repository.ts` — append-only repair events, ordered by eventAt desc
- `apps/api/src/repositories/dispatch.repository.ts` — dispatch records, ordered by id asc (no createdAt on model)

**Services**
- `apps/api/src/services/technician.service.ts` — listTechnicians, getTechnician, createTechnicianProfile (validates user exists, no duplicate profile), editTechnician
- `apps/api/src/services/repair-event.service.ts` — addRepairEvent (validates case is in a workable status, checks technician assignment), listRepairEvents
- `apps/api/src/services/dispatch.service.ts` — createCaseDispatch, updateCaseDispatch (enforces status transition map), listDispatches

**Routes**
- `apps/api/src/routes/v1/technicians/index.ts` — GET /, GET /:id, POST / (ADMIN only), PATCH /:id (ADMIN only)
- `apps/api/src/routes/v1/technicians/schema.ts` — CreateTechnicianSchema, UpdateTechnicianSchema, ListTechniciansQuerySchema

**Tests**
- `apps/api/src/services/technician.service.test.ts` — 8 tests
- `apps/api/src/services/repair-event.service.test.ts` — 4 tests
- `apps/api/src/services/dispatch.service.test.ts` — 5 tests
- `apps/api/src/routes/v1/technicians/technicians.test.ts` — 8 tests

**Seed**
- `packages/db/prisma/seed.ts` — 2 technician users, 2 technician profiles, 1 service case (IN_REPAIR), 2 repair events, 1 dispatch record

### Modified Files

- `apps/api/src/repositories/service-case.repository.ts` — added `assignTechnicianToCase` (transaction: close previous assignment, create new, update case)
- `apps/api/src/services/service-case.service.ts` — added `assignTechnician` function
- `apps/api/src/routes/v1/service-cases/index.ts` — added 6 sub-routes: POST /:id/assign, GET/POST /:id/repair-events, GET/POST /:id/dispatches, PATCH /:id/dispatches/:dispatchId
- `apps/api/src/routes/v1/service-cases/schema.ts` — added 4 schemas: AssignTechnicianSchema, CreateRepairEventSchema, CreateDispatchSchema, UpdateDispatchSchema; changed import from `zod/v4` to `zod` (compatibility with @hono/zod-validator)
- `apps/api/src/routes/v1/index.ts` — registered `techniciansRouter`
- `packages/db/package.json` — added `"prisma": { "seed": "tsx prisma/seed.ts" }` and `db:seed` script
- `package.json` (root) — added `@neondatabase/serverless` as root dependency so vitest can resolve it during tests

---

## Key Decisions

**Zod v3 vs v4**: All new schemas use `import { z } from "zod"` (v3), not `"zod/v4"`. The `@hono/zod-validator@0.5.0` package uses Zod v3 types internally and rejects v4 schema objects with a runtime 400 (schema validation silently fails). This is a pre-existing issue — the service-cases schema was already importing from `zod/v4` and was fixed here.

**DispatchRecord has no `createdAt`**: The Prisma model for `dispatch_records` doesn't include a timestamp. The repository uses `orderBy: { id: "asc" }` instead. The select object was updated to remove `createdAt`.

**Test infrastructure fix**: All 23 test suites were failing before this session due to `@neondatabase/serverless` not being resolvable from the vitest context. Installing the package at the workspace root fixed it. 214 tests now pass across all suites.

**Technician assignment is a transaction**: When reassigning a technician to a case, the previous open assignment is closed (`unassignedAt = now()`) in the same transaction that creates the new one and updates `assignedTechnicianId` on the service case.

**Workable statuses**: Repair events can only be logged when the case is in: ASSIGNED, UNDER_ASSESSMENT, WORK_AUTHORIZED, IN_REPAIR, QC_PENDING, QC_FAILED.

**Dispatch status transitions**: Enforced at the service layer:
- PENDING → DISPATCHED
- DISPATCHED → IN_TRANSIT | FAILED
- IN_TRANSIT → DELIVERED | FAILED
- FAILED → RETURNED
- DELIVERED, RETURNED → terminal

---

## What's Next

Frontend repair lifecycle work on `feat/admin-repair-lifecycle`:
1. New page: `apps/admin/app/technicians/page.tsx`
2. New type: `apps/admin/types/technician.ts`
3. Update Sidebar to add Technicians nav item
4. Update StatusBadge with 8+ missing status mappings (repair lifecycle statuses)
5. Update service case detail page with Assignment, Repair Log, Dispatch sections

After that: PR backend branch → `active-dev-backend`, PR frontend branch → `active-dev-frontend`, merge both into `active-dev`.

The logo-in-sidebar fix (commit 8fab421 on `feat/admin-design-system`) needs to land in `active-dev` — it can be cherry-picked into the frontend repair lifecycle branch.
