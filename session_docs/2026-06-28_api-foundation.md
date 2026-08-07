# Session: API App Foundation

**Date:** 2026-06-28
**Branch:** active-dev-backend

---

## What was done

Set up the `apps/api` foundation — HTTP server, structured logging, Prometheus metrics, request logging middleware, error handling, and basic tests. The app was a stub with a console.log before this session.

---

## Framework decision

**Hono + @hono/node-server**. TypeScript-native, lightweight, greenfield project with no legacy to worry about. Type inference flows through routes end-to-end without casting.

---

## Files changed

**`apps/api/package.json`**
Added runtime deps: hono, @hono/node-server, pino, prom-client, zod, dotenv, @repo/db.
Added dev deps: pino-pretty, vitest, @vitest/coverage-v8.

**`apps/api/src/config.ts`** (new)
Zod schema validates all env vars at startup. Throws with a clear message if DATABASE_URL is missing. All other fields have defaults (PORT=4000, NODE_ENV=development, LOG_LEVEL=info).

**`apps/api/src/logger.ts`** (new)
Single pino instance. Uses pino-pretty transport in development, raw JSON in production. All logs include `service: "welfo-api"` base field. No console.log anywhere.

**`apps/api/src/metrics.ts`** (new)
prom-client registry with default Node.js metrics enabled. All metrics prefixed `welfo_api_` to avoid collisions.

**`apps/api/src/middleware/request-log.ts`** (new)
Hono middleware. Logs method, path, status code, and duration on every request via pino.

**`apps/api/src/middleware/error.ts`** (new)
`onError` function for Hono's error handler. Returns `{ error: "internal server error" }` JSON and logs the full error via pino.

**`apps/api/src/routes/health.ts`** (new)
Two Hono routers: healthRouter (`GET /`) returns `{ status, timestamp, uptime }`, metricsRouter (`GET /`) returns Prometheus text format from prom-client registry.

**`apps/api/src/routes/v1/index.ts`** (new)
Empty Hono router. All domain routes will be added under `/api/v1` in future sessions.

**`apps/api/src/app.ts`** (new)
Composes the Hono app: attaches requestLog middleware, mounts /health, /metrics, /api/v1. Registers notFound and onError handlers.

**`apps/api/src/index.ts`** (rewritten)
Imports dotenv/config first, then starts @hono/node-server on config.PORT. Logs startup with pino.

**`apps/api/vitest.config.ts`** (new)
Unit test config. Sets DATABASE_URL and NODE_ENV=test in test env so config validation passes without a real .env file.

**`apps/api/vitest.integration.ts`** (new)
Integration test config. 30s timeout.

**`apps/api/src/routes/health.test.ts`** (new)
3 tests: /health returns 200 + correct shape, /metrics returns prometheus content-type, unknown routes return 404 + `{ error: "not found" }`.

**`apps/api/.env.example`** (new)
Template for local dev. DATABASE_URL is the only required field.

---

## What was verified

- `npm run check-types` passes with zero errors
- `npm run build` compiles to `dist/index.js` in 28ms
- `vitest run` — 3/3 tests pass

---

## What is NOT done

- Auth routes (login, logout, me) — separate work stream
- Domain routes (organizations, cases, quotes, etc.) — separate
- JWT middleware — not needed until auth is built
- `apps/services` app — separate session
- `apps/api/.env` — developer must create this locally (template in .env.example)

---

## Local dev setup (one-time)

```bash
cp apps/api/.env.example apps/api/.env
# fill in DATABASE_URL from your Neon project
npm run dev --workspace=@welfo/api
```
