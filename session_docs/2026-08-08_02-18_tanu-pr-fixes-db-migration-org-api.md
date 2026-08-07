# 2026-08-08 Tanu PR Fixes, DB Migration, Organizations API

## What was done

Three separate workstreams completed and committed to three branches.

---

## 1. Tanu PR fixes (branch: feature/tanu-frontend)

Commit: `3287417 fix: remove console calls, fix brand colors, fix broken Tailwind class`

Files changed:
- `apps/portal/app/page.tsx` — removed `console.log(payload)` (line 35), updated gradient and button colors from purple to navy/teal
- `apps/portal/app/register/page.tsx` — updated gradient from purple to navy/teal, replaced `text-purple-200/100` with teal/white equivalents, updated `focus:border-purple-600` to `focus:border-[#00B4D8]`
- `apps/portal/components/layout/Header.tsx` — replaced `text-purple-700` and `hover:text-violet-900` with brand navy colors
- `apps/admin/app/login/page.tsx` — removed `console.error(error)` in catch block, updated gradient and button colors
- `apps/admin/components/layout/Sidebar.tsx` — fixed `bg-` (broken class) to `bg-white`, changed active nav item from `bg-indigo-600` to `bg-[#0F4C81]`
- `apps/admin/components/layout/Header.tsx` — same purple → navy color update as portal header

Brand color applied:
- Gradient: `#0a3560 → #0F4C81 → #1a6aab` (was `#2d1b75 → #3b2295 → #4a29c4`)
- Buttons: `#0F4C81` hover `#0a3560` (was `#25155e` hover `#1f114d`)

---

## 2. DB pre-impl migration (branch: feat/db-pre-impl-fixes)

Commit: `4e617f1 feat: add outstandingAmount generated column to invoices`

Files changed:
- `packages/db/prisma/migrations/20260807202951_add_invoice_outstanding_amount/migration.sql` — raw SQL to add `outstandingAmount DECIMAL(12,2) GENERATED ALWAYS AS ("totalAmount" - "paidAmount") STORED`
- `packages/db/prisma/schema.prisma` — added `outstandingAmount` field with `@default(dbgenerated(...))` so Prisma reads it but never writes to it

Note: Neon endpoint was unreachable from this environment (likely paused on free tier). Migration SQL is prepared and must be applied from a machine with DB access using `prisma migrate deploy`.

Sequences, number generation functions, and state transition trigger were already in migration `20260627200500_domain_schema`. Only the generated column was missing.

---

## 3. Organizations domain API (branch: feat/api-v1-organizations)

Commit: `f4c8012 feat: add organizations domain — repo, service, routes, tests`

Files created:
- `apps/api/src/repositories/organization.repository.ts` — findOrganizationById, findOrganizations, createOrganization, updateOrganization, softDeleteOrganization
- `apps/api/src/services/organization.service.ts` — listOrganizations, getOrganization, createOrg, updateOrg, deactivateOrg
- `apps/api/src/routes/v1/organizations/schema.ts` — CreateOrgSchema, UpdateOrgSchema, ListOrgsQuerySchema (Zod)
- `apps/api/src/routes/v1/organizations/index.ts` — GET /, GET /:id, POST /, PATCH /:id, DELETE /:id with requireAuth and requireRole guards
- `apps/api/src/services/organization.service.test.ts` — 9 service unit tests
- `apps/api/src/routes/v1/organizations/organizations.test.ts` — 11 route-level tests covering auth, RBAC, 404, 400 cases

Files modified:
- `apps/api/src/routes/v1/index.ts` — registered organizationsRouter at /organizations

Test results: 39/39 passing across all test files.

Access control:
- GET /organizations — requireAuth (any authenticated role)
- GET /organizations/:id — requireAuth
- POST /organizations — requireAuth + ADMIN or OPERATIONS
- PATCH /organizations/:id — requireAuth + ADMIN or OPERATIONS
- DELETE /organizations/:id — requireAuth + ADMIN only (soft delete)

---

## Branch context note

backend-base is behind — it does not contain the DB schema or auth work. Those commits landed on active-dev-backend directly. All new branches were created from active-dev-backend.

## What is next

Domain APIs to build next (in order):
1. CustomerContacts (nested under organizations)
2. Products
3. ServiceCases
4. Tickets
5. Quotes
6. Invoices + Payments
