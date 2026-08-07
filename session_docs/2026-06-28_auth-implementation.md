2026-06-28 | auth implementation

## What was done

Implemented the full auth layer for the Welfo API. Covers two separate systems: internal (admin/technician) and customer portal.

## Background migration

Added `passwordHash String? @db.Text` to `CustomerContact` model so portal contacts can authenticate. Migration: `20260628_add_contact_password_hash`.

## Files created

**lib/**
- `apps/api/src/lib/errors.ts` — AppError base class + AuthError (401), ForbiddenError (403), NotFoundError (404), ValidationError (400), ConflictError (409)
- `apps/api/src/lib/password.ts` — `hashPassword` / `verifyPassword` via bcryptjs, 12 rounds
- `apps/api/src/lib/token.ts` — `signAccessToken`, `signRefreshToken`, `signPortalAccessToken`, `signPortalRefreshToken`, `verifyToken` via jose / HS256
- `apps/api/src/lib/validate.ts` — `validate()` wrapper around `@hono/zod-validator` with consistent 400 error format

**repositories/**
- `apps/api/src/repositories/user.repository.ts` — `findUserByEmail`, `findUserById`, `updateLastLoginAt`
- `apps/api/src/repositories/contact.repository.ts` — `findContactByEmail` (filters isActive=true and passwordHash not null), `findContactById`

**services/**
- `apps/api/src/services/auth.service.ts` — `login`, `refresh`, `getMe` for internal users
- `apps/api/src/services/portal-auth.service.ts` — `portalLogin`, `portalRefresh`, `getPortalMe` for customer contacts

**middleware/**
- `apps/api/src/middleware/auth.ts` — `requireAuth` middleware, reads `Authorization: Bearer` header, verifies token type=access, sets `c.get("user")`
- `apps/api/src/middleware/portal-auth.ts` — `requirePortalAuth` middleware, verifies type=portal_access, sets `c.get("contact")`
- `apps/api/src/middleware/require-role.ts` — `requireRole(...roles)` factory, requires `requireAuth` to have run first

**routes/**
- `apps/api/src/routes/v1/auth/schema.ts` — loginSchema, refreshSchema
- `apps/api/src/routes/v1/auth/index.ts` — POST /login, POST /logout (204), POST /refresh, GET /me
- `apps/api/src/routes/v1/portal/auth/schema.ts` — portal variants
- `apps/api/src/routes/v1/portal/auth/index.ts` — POST /login, POST /logout (204), POST /refresh, GET /me

**tests/**
- `apps/api/src/services/auth.service.test.ts` — 9 unit tests covering login, refresh, getMe with mocked deps
- `apps/api/src/routes/v1/auth/auth.test.ts` — 7 route-level tests covering status codes and validation

## Files modified

- `apps/api/src/config.ts` — added JWT_SECRET (min 32 chars), JWT_ACCESS_EXPIRY (default 15m), JWT_REFRESH_EXPIRY (default 7d)
- `apps/api/src/middleware/error.ts` — updated `onError` to handle AppError subclasses with correct status codes
- `apps/api/src/routes/v1/index.ts` — mounted authRouter at /auth and portalAuthRouter at /portal/auth
- `apps/api/vitest.config.ts` — added JWT env vars to test environment
- `apps/api/.env.example` — added JWT_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY
- `apps/api/package.json` — added @hono/zod-validator, bcryptjs, jose, @types/bcryptjs
- `packages/db/src/index.ts` — changed from `export *` to explicit named enum exports to avoid Pool type conflict
- `packages/db/src/client.ts` — fixed PrismaNeon constructor: now takes PoolConfig directly, not a Pool instance (API changed in current adapter version)

## Key decisions

**Token type claim**: access tokens carry `type: "access"`, portal access tokens carry `type: "portal_access"`. Prevents cross-use between internal and portal systems at the verification layer.

**Stateless logout V1**: POST /logout returns 204, client drops tokens. No server-side token revocation. OTP and token revocation are deferred.

**Technicians are internal users**: No separate auth system for technicians. They log in via the same `/api/v1/auth/login` endpoint and get `role: TECHNICIAN` in their JWT.

**Portal contacts need passwordHash**: CustomerContact can optionally have a password. Portal accounts without a password cannot log in — `findContactByEmail` filters `passwordHash: { not: null }`.

**PrismaNeon API fix**: `@prisma/adapter-neon` v7+ takes a `PoolConfig` object directly in the constructor instead of a `Pool` instance.

## Test results

19 tests, 3 files, all passing. Type check clean.

## What is NOT done

- Portal auth route tests (similar to internal — low priority, can be added next)
- Admin-only seed endpoint for creating first user (bootstrapping problem — no UI yet)
- OTP / email verification for portal signup
- Token refresh rotation (V1 is stateless, refresh token is reusable until expiry)
