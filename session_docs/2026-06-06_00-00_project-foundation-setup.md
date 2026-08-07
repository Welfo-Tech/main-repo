## Session: Project Foundation Setup

Date: 2026-06-06
Time: Start of project — session 1

---

### What We Did

Read and synthesized all company and technical documentation to build full context on the Welfo platform. Then established the engineering standards and project scaffolding that all future work will follow.

---

### What Was Read

- `company_docs/Welfo_Fiber_Optics_Deep_Dossier.md` — company background, products, supply chain
- `company_docs/mind_spec.md` — founder philosophy: technology as organizational memory, product-centric design thinking, digital twin vision
- `tech_docs/Engg_Spec.md` — engineering spec: 7 workflows, service case state machine, data model, API surface, auth design
- `tech_docs/db_spec.md` — full Prisma schema with all enums and models
- `tech_docs/api_spec.md` — REST API endpoint list with auth requirements
- `claude_docs/welfo_system_design_review.md` — design review: 10 domains, 6 actors, lifecycle state machines, 17 entities, 10 identified gaps before implementation

---

### What Was Created

**`CLAUDE.md`** (repo root)
Auto-loaded into every Claude Code session. Contains all project rules, directory map, the 10 pre-implementation fixes, and key architectural decisions.

**`tech_docs/github_rules.md`**
Full GitHub rules: branch hierarchy, naming conventions, commit message format, PR description format, pre-push checklist, promotion flow, what never belongs in git.

**`agent_docs/engineering_standards.md`**
Full engineering standards: no inline comments, session docs, plan-first workflow, testing rules, Docker rules, logging standards, monitoring stack, tone and naming conventions.

**`Makefile`** (repo root)
Single-command interface for common operations: `make up`, `make down`, `make build`, `make test`, `make test-unit`, `make test-integration`, `make test-e2e`, `make db-migrate`, `make db-seed`, `make db-reset`, `make health`, `make logs`, `make ps`.

**`scripts/testing/run-all.sh`** — runs full test suite
**`scripts/testing/run-unit.sh`** — unit tests only
**`scripts/testing/run-integration.sh`** — integration tests (requires DB container)
**`scripts/testing/run-e2e.sh`** — end to end tests (requires full stack)
**`scripts/start-stop/start.sh`** — start stack or single service
**`scripts/start-stop/stop.sh`** — stop stack, optional `--volumes` flag
**`scripts/db/migrate.sh`** — run Prisma migrations
**`scripts/db/seed.sh`** — seed development data
**`scripts/db/reset.sh`** — drop + recreate DB, blocked in production/staging
**`scripts/monitoring/check-health.sh`** — curl health endpoints on all services

All scripts have execute permission set.

---

### Key Decisions Made

1. CLAUDE.md is the primary source of truth for all session rules — it loads automatically
2. Session docs replace inline comments as the project's running memory
3. Engineering standards and GitHub rules are written once in dedicated docs and referenced from CLAUDE.md
4. Makefile is the single entry point for all operations — no need to remember long commands
5. Scripts are organized by concern: testing, start-stop, db, monitoring — extensible as the project grows

---

### The 10 Pre-Implementation Fixes (from design review)

These must be resolved before building any feature:
1. Add users table
2. Define PostgreSQL sequences for ID generation
3. Add DB-level state transition trigger
4. Make outstanding_amount a generated column
5. Add attachments table
6. Add GST/HSN fields to line items
7. Add isBillable to ServiceCase
8. Add SlaEvent table
9. Status-based voiding for financial records
10. Replace intakePhotoUrls with attachments table

---

### What Is Left Open

- Docker Compose file not created yet — needs service definitions before writing it
- Prisma schema not initialized yet — waiting for user direction on first feature
- apps/ directory has only create-turbo scaffold — backend and frontend apps not scaffolded yet
- Monitoring stack (Prometheus, Grafana, Promtail, Alertmanager, TG alerts) not set up yet

---

### Next Steps

User to indicate which area to start building first. Recommended starting point based on the 10 pre-implementation fixes: scaffold the users table and auth service as the foundation everything else depends on.
