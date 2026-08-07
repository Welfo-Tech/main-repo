# Welfo Tech -- Where We Are and What Is Built

Date: June 2026

---

So here is the full picture of where we are with the Welfo codebase and what has been built so far. This is meant for anyone coming in and needing to understand what exists, how it works, and where things need to go next. I will explain the thinking behind decisions, not just list what was done.

---

## What We Are Building and Why

Welfo Fiber Optics is a medical fiber optics and endoscopy company based in Rishikesh, India. We manufacture, repair, and distribute medical scopes and fiber optic devices. Not telecom. Medical. Hospitals, clinics, service centers across the country.

Right now everything runs on paper, spreadsheets, WhatsApp messages, and phone calls. That works at the current scale. It will not work as the company grows. The reason it breaks is not that people are doing something wrong. It breaks because human memory has limits. Once you are dealing with thousands of products spread across hundreds of customers, you cannot remember which scope came in for repair, which spare part was used, whether the invoice was paid, or what the service history looked like. Information scatters.

The way I think about what we are building is this: technology should become the organizational memory of the company. Every product, every repair case, every spare part movement, every quote, every invoice, every customer interaction should be traceable and recoverable through this system. If a hospital calls five years from now about a scope, someone should be able to pull up the full history of that device in seconds. No spreadsheet hunting. No WhatsApp digging.

There is a second thing that shapes the design. I keep coming back to the idea that Welfo is not really in the scope selling business. We are in the trust, service, and uptime business. Customers do not just buy a device. They buy the confidence that it will work, and that when it does not, someone will fix it. That makes the service side of the business just as important as the sale, and eventually more important.

This changes how the data model should be designed. Instead of making tickets the center of the system, products become the center. A ticket exists for a week. A product exists for ten years. The product is the long-lived entity. Service cases are events in a product's life. Every repair, every part deployment, every quote, every invoice is attached to the product. That principle is baked into the data model from the start.

---

## How We Are Building It

The codebase is a Turborepo monorepo. TypeScript throughout. PostgreSQL as the database. Prisma as the ORM. Neon as the hosted database service. Docker Compose runs the full stack. Prometheus, Grafana, Loki, Promtail, and Alertmanager handle monitoring from day one. Telegram gets all the critical alerts.

The repo is at github.com/Welfo-Tech/main-repo.

All five apps and all shared packages live in the same monorepo. They share TypeScript configs, ESLint configs, and the database client. Turbo handles the task pipeline so builds and code generation run in the right order.

---

## What Has Been Built

### The Five Apps

| App | Package | Type | Port |
|-----|---------|------|------|
| apps/admin | @welfo/admin | Next.js 16 | 3000 |
| apps/portal | @welfo/portal | Next.js 16 | 3001 |
| apps/blog | @welfo/blog | Next.js 16 | 3002 |
| apps/api | @welfo/api | Node.js TypeScript | 4000 |
| apps/services | @welfo/services | Node.js TypeScript | 4001 |

Admin is the internal panel. Operations, technicians, managers. This is the core product.

Portal is the customer-facing side. Customers will eventually be able to check repair status, approve quotes, and download invoices.

Blog is the Welfo marketing and content site. Standalone, no connection to the operational apps.

API is the primary backend. All service flow, repair cases, quotations, invoices, and inventory will run through this.

Services is a second backend kept as a clean slate for now. Could handle background jobs, notifications, or async processing once we get there.

Next.js apps all use standalone output so Docker can run them with minimal images. Node backends use tsx for development with no compile step and tsup for production builds, outputting ESM.

### Shared Packages

packages/db is the shared Prisma package. All apps that need database access import from here. It exports a single prisma client instance. This is the only place Prisma lives. No app should have its own Prisma setup.

packages/typescript-config has three tsconfig presets: base.json for common settings, nextjs.json for frontend apps, and node.json for backends. Every app and package extends one of these.

packages/eslint-config and packages/ui come from the create-turbo scaffold and are in place.

### Database

Prisma 7.8.0 with the Neon serverless driver adapter. The database is hosted on Neon. There is no local postgres container. DATABASE_URL in your .env file should point to your Neon project.

Prisma 7 has some breaking changes versus older versions worth knowing. The generator now uses provider = "prisma-client" instead of "prisma-client-js". The datasource block in schema.prisma no longer has a url field. Connection configuration lives in prisma.config.ts which sits at the root of packages/db. The generated client lives at packages/db/generated/prisma/ and is gitignored. Turbo regenerates it as part of the build pipeline so you never need to commit it.

The migration pipeline is confirmed working. We ran an init migration that created a setup_test table on Neon to verify the full flow. The migration files are committed in packages/db/prisma/migrations/. This setup_test table is a placeholder and will be dropped or replaced when real schema work begins.

To run migrations, cd into packages/db and run npx prisma migrate dev. Or use make db-migrate from the repo root.

To consume the database client in any app, add "@repo/db": "*" to that app's dependencies and import like this:

```typescript
import { prisma } from "@repo/db";
```

### Docker and Infrastructure

docker-compose.yml at the repo root defines the full stack. It covers all five apps, Prometheus, Grafana, Loki, Promtail, and Alertmanager. No local postgres. Apps connect to Neon via DATABASE_URL.

Dockerfiles live under infra/docker/. Each app has its own Dockerfile using Turbo's prune and Docker pattern for minimal build context. Node backends use a four-stage build: pruner, installer, builder, runner. Next.js apps use Next's standalone output and copy only what is needed. All containers run as a non-root user named welfo.

The monitoring stack is fully configured. Prometheus scrapes API and services metrics at /metrics. Grafana runs on port 9080, not 3000, which is already used by admin. Loki stores logs. Promtail ships logs from Docker containers to Loki. Alertmanager routes alerts to Telegram.

Alert rules are already in place in infra/monitoring/prometheus/rules/alerts.yml. They cover service downtime, high error rate, high latency, database connection exhaustion, SLA breaches, and high open case volume. Critical alerts hit Telegram immediately. Warnings repeat every four hours.

All you need to do to get the monitoring stack running is set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env file and run make monitoring-up.

### Branch Structure

All eight branches are set up locally. Once you authenticate with GitHub (run gh auth login or set up SSH), run git push origin --all and everything will be up on remote.

The branch hierarchy:

- master is production. Never touch this directly.
- dev sits under master.
- staging sits under dev.
- active-dev is the integration branch for ongoing development.
- active-dev-backend is where all backend work lands.
- active-dev-frontend is where all frontend work lands.
- backend-base is where feature branches for backend work check out from.
- frontend-base is where feature branches for frontend work check out from.

We are currently on active-dev-backend. When you create a new feature, check out from backend-base or frontend-base, do your work, and open a PR back to the base branch. From there it flows to active-dev, staging, dev, and master. Full details in tech_docs/github_rules.md.

### Scripts and Makefile

There is a Makefile at the root that is the single entry point for everything. The main commands:

```
make up              start the full stack
make down            stop everything
make build           build Docker images
make db-migrate      run Prisma migrations
make db-generate     regenerate the Prisma client
make test            run the full test suite
make health          check health endpoints on all services
make install         install npm dependencies for all workspaces
make logs            tail all container logs
make ps              show running containers
```

There is also scripts/install.sh for installing a single workspace:

```
bash scripts/install.sh --app api
bash scripts/install.sh --app db
bash scripts/install.sh            # installs everything
```

Database scripts live in scripts/db/. Migrate, seed, and reset are all there. Reset is blocked in production and staging environments.

### Engineering Standards

A few non-negotiables worth knowing so you do not have to figure them out from context:

No inline comments in code. If code needs a comment to explain what it does, rename things instead. Context lives in session docs, not in code comments.

Every work session produces a session doc in session_docs/. The naming format is YYYY-MM-DD_HH-MM_short-description.md. This is what a future reader uses to understand why something was done, what changed, and what was left open.

Plan before building. Before writing code for any new feature, write out the plan and get it approved. No quick implementations.

Tests go alongside every feature. Not after. At the same time.

No console.log. Use pino for structured logging. Every log has a timestamp, level, module name, and structured fields.

Every service exposes /metrics for Prometheus.

Commit messages follow the format type: short description. Imperative mood, under 72 characters for the subject line. No Co-Authored-By or AI attribution lines. Total commit message under 100 words.

Full standards are in agent_docs/engineering_standards.md. GitHub rules are in tech_docs/github_rules.md.

---

## What Is NOT Done Yet

This is the important part for whoever picks this up.

**The 10 pre-implementation schema fixes must happen before any feature work starts.** These were identified during the design review. They are schema-level gaps that will block proper implementation if left unresolved.

1. Add a users table. Everything in the system references a user as an actor. There is currently no users table for these foreign keys to point to.
2. Define PostgreSQL sequences for human-readable ID generation. Things like WFC-2024-0001 for work order numbers.
3. Add a database-level state transition trigger. The state machine for service cases is critical and needs enforcement at the DB level, not just the application layer.
4. Make outstanding_amount on invoices a generated column. This should always be computed from payments, not stored manually.
5. Add an attachments table and replace intakePhotoUrls TEXT[] with a proper foreign key. Photos and documents need a proper table, not a text array.
6. Add GST and HSN fields to line items. This is a legal requirement in India for invoicing. Cannot ship invoicing without this.
7. Add isBillable to ServiceCase. Needed for warranty claim handling where repair is done but not billed.
8. Add an SlaEvent table for tracking SLA breach events over time.
9. Use status-based voiding for financial records instead of deletedAt. Deleting invoices or payments is not allowed. They get voided.
10. Attachments table replacing the intakePhotoUrls text array (covered in fix 5).

Beyond the schema fixes, nothing application-level has been built yet. There are placeholder entry points in apps/api and apps/services but no routes, no controllers, no services, no auth, nothing. The database has only the setup_test table which is a throwaway. The frontend apps have the create-turbo scaffold pages. Nothing domain-specific exists yet.

The auth system has not been started. User identity is a dependency for everything else so this needs to go in early.

No Grafana dashboards have been created yet. The provisioning infrastructure is in place but the actual dashboard JSON files need to be built as we add metrics.

No tests exist yet beyond the empty scripts. Vitest and Playwright configs are not set up in any app yet.

---

## How to Pick This Up

Clone the repo and install dependencies:

```
git clone https://github.com/Welfo-Tech/main-repo.git
cd main-repo
npm install
```

Create your .env file from .env.example and fill in the Neon database URL. Get it from the Neon project dashboard.

```
cp .env.example .env
```

Authenticate with GitHub and push all branches to remote:

```
gh auth login
git push origin --all
```

From there the natural next step is to work through the 10 pre-implementation fixes and get a proper schema in place. Then build the users table and auth. Then start on the core domain: service cases, products, customers.

**Key docs to read before building anything domain-specific:**

- tech_docs/Engg_Spec.md -- full engineering spec with all 7 workflows and state machines
- tech_docs/db_spec.md -- full data model and Prisma schema
- tech_docs/api_spec.md -- REST API endpoint list with auth requirements
- company_docs/Welfo_Fiber_Optics_Deep_Dossier.md -- company background
- company_docs/mind_spec.md -- founder philosophy and product thinking
- agent_docs/engineering_standards.md -- how we write and ship code
- tech_docs/github_rules.md -- branching, commits, and PRs

CLAUDE.md at the repo root auto-loads into every Claude Code session and is the single source of truth for all project rules.

---

## Current Commit State

Five commits on active-dev-backend beyond the initial Turborepo scaffold:

1. Initial commit from create-turbo -- base scaffold
2. chore: project foundation setup -- all scripts, Makefile, standards docs
3. chore: remove scaffolded apps/web and apps/docs -- cleanup of default create-turbo apps
4. chore: add shared db package, install script, and neon adapter -- packages/db, Docker stack, Neon adapter, Next.js CVE patch
5. fix: correct prisma config format and run init migration -- Prisma 7 config corrected, first migration applied to Neon and confirmed working

The remote currently shows only the initial commit because GitHub auth was not configured at the time. Running git push origin --all after auth fixes this.

---

The foundation is solid. The patterns are established. The database is connected and confirmed working against Neon. What comes next is domain work, and the path to starting that is through the 10 pre-implementation schema fixes.
