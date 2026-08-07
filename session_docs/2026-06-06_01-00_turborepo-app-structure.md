## Session: Turborepo App Structure Setup

Date: 2026-06-06
Time: Session 2

---

### What We Did

Renamed the two create-turbo scaffold apps and created three new apps to match the actual product lineup. Updated turbo.json to cover tsup build outputs and test tasks. Added a node.json tsconfig for backend apps.

---

### App Lineup (Final)

| App | Name | Type | Port | Purpose |
|-----|------|------|------|---------|
| apps/admin | @welfo/admin | Next.js | 3000 | Internal admin panel |
| apps/portal | @welfo/portal | Next.js | 3001 | User-facing customer portal |
| apps/blog | @welfo/blog | Next.js | 3002 | Welfo marketing/blog website |
| apps/api | @welfo/api | Node.js TS | 4000 | Primary service flow backend |
| apps/services | @welfo/services | Node.js TS | 4001 | Secondary backend, future use |

---

### What Changed

**Renames:**
- `apps/web` -> `apps/admin` — package name changed from `"web"` to `"@welfo/admin"`
- `apps/docs` -> `apps/portal` — package name changed from `"docs"` to `"@welfo/portal"`
- Both files: `apps/admin/package.json` line 2, `apps/portal/package.json` line 2

**Created — `packages/typescript-config/node.json`**
- New tsconfig preset for Node.js backends
- Extends `base.json` but removes DOM from lib (lib is `["es2022"]` only)
- Keeps `module: NodeNext` and `moduleResolution: NodeNext` from base
- Used by apps/api and apps/services

**Created — `apps/api/`**
- `package.json` — `@welfo/api`, scripts: dev=tsx watch, build=tsup, start=node dist/index.js
- `tsconfig.json` — extends `@repo/typescript-config/node.json`
- `tsup.config.ts` — entry src/index.ts, format esm, outDir dist, sourcemap true
- `eslint.config.js` — uses `@repo/eslint-config/base`
- `src/index.ts` — minimal placeholder entry point
- `.gitignore`

**Created — `apps/services/`**
- Same structure as api
- `package.json` — `@welfo/services`, port 4001
- `tsup.config.ts`, `tsconfig.json`, `eslint.config.js`, `src/index.ts`, `.gitignore`

**Created — `apps/blog/`**
- `package.json` — `@welfo/blog`, port 3002
- `tsconfig.json` — extends `@repo/typescript-config/nextjs.json`
- `next.config.js` — minimal config
- `eslint.config.js` — uses `@repo/eslint-config/next-js`
- `app/layout.tsx`, `app/page.tsx` — minimal Next.js app router scaffold
- `.gitignore`

**Updated — `turbo.json`**
- Added `dist/**` to build task outputs (covers tsup compiled backends)
- Added `test:unit`, `test:integration`, `test:e2e` tasks with proper cache settings
  - unit: cached (pure function tests)
  - integration: cache false (requires live DB)
  - e2e: cache false (requires full stack)

**Updated — `apps/admin/package.json` and `apps/portal/package.json`**
- Added `test:unit`, `test:integration`, `test:e2e` scripts

---

### Key Decisions

1. All app package names scoped under `@welfo/` for consistency and clarity
2. Shared packages keep `@repo/` scope (already established by create-turbo)
3. Node.js backends use `tsx watch` for dev (fast, no compile step) and `tsup` for production build
4. Both backends output ESM (`format: ["esm"]`) consistent with `"type": "module"` in package.json
5. Blog is plain Next.js — no special treatment needed for a marketing/content site
6. tsup outputs to `dist/` with sourcemaps for production debugging

---

### What Is Left Open

- No runtime dependencies added yet to api or services (Hono/Express, Prisma, Pino logger — when we start building)
- No vitest or playwright configs added yet — to be done when adding first real tests
- Docker Compose not created yet — covers all 5 apps plus postgres, monitoring stack
- apps/admin and apps/portal still have create-turbo scaffold page content — will be replaced when UI work starts
