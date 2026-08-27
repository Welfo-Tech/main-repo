## Session: fix make up — Docker stack fully healthy

Date: 2026-08-26
Branch: feat/admin-quotes-invoices
Commit: 650930f

---

### What was done

Resolved three separate failures that prevented `make up` from producing a healthy stack.

---

### Fix 1 — API crash: Dynamic require of "path" not supported

**Root cause:** `tsup` bundles `@repo/db` inline (via `noExternal: ["@repo/db"]`). The Prisma generated client is part of that bundle, and its runtime (`@prisma/client/runtime/client.js`) uses CommonJS `require()` for Node built-ins (`path`, `fs`, etc.). When bundled into an ESM output file, those `require()` calls have no `require` function available, so Node throws.

**Fix:** Added a `banner` to the tsup config that injects a `createRequire` shim at the top of the ESM bundle:

```typescript
banner: {
  js: `import { createRequire } from "module"; const require = createRequire(import.meta.url);`,
},
```

This gives the bundled CJS code a working `require` function inside the ESM module.

**Files changed:**
- `apps/api/tsup.config.ts` — added `banner`

---

### Fix 2 — Services crash: process exits immediately (exit 0)

**Root cause:** `apps/services/src/index.ts` was a one-line stub — it printed a log message and exited. No HTTP server was ever started, so Docker restarted it in a loop.

**Discovery:** `apps/services` has no Hono or any HTTP framework in its `package.json`. It also has no `@repo/db` dependency. Previous session incorrectly added `noExternal: ["@repo/db"]` to its tsup config and `prisma generate` to its Dockerfile — both were wrong.

**Fix:**
1. Replaced stub with a minimal `http.createServer` server that exposes `/health` using Node built-ins.
2. Cleaned up services tsup config: removed `noExternal` and `banner` (services has no DB dependency).
3. Cleaned up services Dockerfile: removed `db:generate` step and `packages` copy (not needed).

**Files changed:**
- `apps/services/src/index.ts` — minimal HTTP server listening on PORT
- `apps/services/tsup.config.ts` — removed noExternal/banner
- `infra/docker/services/Dockerfile` — removed db:generate, removed COPY packages

---

### Fix 3 — Alertmanager crash: missing chat_id on telegram_config

**Root cause:** Even when the default receiver is set to `"null"`, alertmanager validates ALL defined receivers at startup. The telegram receiver was always present in the config with `chat_id: 0` (the placeholder value), which alertmanager rejects as invalid.

**Fix:** Changed the docker-compose entrypoint to write a completely different config depending on whether a real chat ID is configured:
- `TELEGRAM_CHAT_ID=0` or empty → writes a minimal null-receiver config with no telegram block
- Real chat ID → runs `sed` substitution on the full template

**Files changed:**
- `infra/monitoring/alertmanager/alertmanager.yml` — added `${TELEGRAM_RECEIVER}` placeholder, added `"null"` receiver
- `docker-compose.yml` — entrypoint now branches on `TELEGRAM_CHAT_ID`

---

### Final health check result

```
Admin UI:    OK
Portal:      OK
API:         OK
Services:    OK
Prometheus:  OK
Grafana:     OK
Alertmanager: OK
```

---

### What is still open

- Services is a stub with a minimal HTTP server and no real functionality. Routes and workers will be added when the background job domain is designed.
- Two PRs still need to be raised:
  - `feat/api-v1-quotes-invoices` → `active-dev-backend`
  - `feat/admin-quotes-invoices` → `active-dev-frontend`
- Seed data (`packages/db/prisma/seed.ts`) has a new ServiceCase, Quote, Invoice, and Payment — run `npm run db:seed --workspace=@repo/db` to load them.
