# Session: Install Script and Prisma DB Package

Date: 2026-06-06
Branch: active-dev-backend

## What was done

Added two things: a workspace install helper script and the shared database package with Prisma 7.

### scripts/install.sh

New script that installs npm dependencies across all workspaces or for a single one.

- No args: runs `npm install` at the repo root (installs everything)
- `--app <name>`: looks up the package name from its package.json, then runs `npm install --workspace=<name>`
- Resolves the target by checking `apps/<name>` first, then `packages/<name>`
- Errors with a helpful listing if the name is not found

Usage:
```
bash scripts/install.sh               # all workspaces
bash scripts/install.sh --app api     # only apps/api
bash scripts/install.sh --app db      # only packages/db
```

### packages/db - Prisma 7 shared database package

Prisma version: 7.8.0 (latest as of this session)

**Prisma 7 breaking changes handled:**

1. `prisma-client` provider - Prisma 7 uses `provider = "prisma-client"` in schema generator, not `"prisma-client-js"`
2. No `url` in datasource - Prisma 7 removed `url = env("DATABASE_URL")` from schema.prisma entirely
3. `prisma.config.ts` - connection config now lives in this file alongside the schema
4. Driver adapters GA - `previewFeatures = ["driverAdapters"]` is no longer needed
5. Generated client entrypoint is `client.ts`, not `index.ts`

**Files created:**

- `package.json` - name `@repo/db`, deps: `@prisma/client`, `@prisma/adapter-pg`, `pg`; devDeps: `prisma`
- `tsconfig.json` - extends `@repo/typescript-config/node.json`, noEmit true
- `.gitignore` - ignores `generated/` and `.env`
- `.env.example` - DATABASE_URL placeholder
- `prisma/schema.prisma` - SetupTest model (uuid id, varchar note, timestamptz createdAt)
- `prisma.config.ts` - defineConfig with migrate adapter using PrismaPg
- `src/client.ts` - global singleton PrismaClient with PrismaPg adapter
- `src/index.ts` - exports `prisma` and `PrismaClient` type

**How to use from another app:**

```ts
import { prisma } from "@repo/db";
const rows = await prisma.setupTest.findMany();
```

**Consuming app package.json must add:**
```json
"dependencies": { "@repo/db": "*" }
```

**Schema structure (SetupTest model):**
```
id        UUID primary key, default uuid()
note      varchar(255)
createdAt timestamptz, default now()
```

### turbo.json updates

- Added `globalEnv: ["DATABASE_URL"]` so all tasks get cache-busted when DATABASE_URL changes
- Added `db:generate` task with `prisma/schema.prisma` as input and `generated/**` as output
- `build` and `dev` now `dependsOn: ["^db:generate"]` so the generated client always exists before building

### Makefile updates

- Added `db:generate` target: `npm run db:generate --workspace=@repo/db`
- Added `install` target: `bash scripts/install.sh`

### Next.js CVE fix

Updated all three Next.js apps from `16.2.0` to `16.2.7` to resolve high-severity CVEs:
- GHSA-q4gf-8mx6-v5v3 (DoS with Server Components)
- GHSA-8h8q-6873-q5fj and others (middleware/proxy bypasses)

Remaining 5 moderate vulns are all inside `@prisma/dev` (Prisma 7 CLI internal dep on `@hono/node-server`).
The npm-suggested fix is downgrading to Prisma 6 which we will not do. Monitor for a Prisma patch.

### scripts/db fixes

migrate.sh, seed.sh, reset.sh now `cd "$REPO_ROOT/packages/db"` before running prisma CLI commands
so that prisma picks up `prisma.config.ts` from the right location.

## Decisions

- `@repo/db` scope (not `@welfo/db`) to match the existing `@repo/eslint-config`, `@repo/ui`, `@repo/typescript-config` pattern for shared internal packages
- Generated client is gitignored and turbo regenerates it at build/dev time
- SetupTest model is a throwaway table for verifying the Prisma pipeline end-to-end; it gets replaced by real domain models when schema design work begins
- prisma.config.ts lives in packages/db root (sibling to the prisma/ folder) as required by the Prisma CLI
