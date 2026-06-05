# Welfo Fiber Optics - Platform

## What is Welfo

Welfo Fiber Optics is a medical fiber optics and endoscopy company based in Rishikesh, Uttarakhand, India.

The company manufactures, assembles, repairs, and distributes precision optical equipment used in surgical and diagnostic procedures. Their products include rigid and flexible endoscopes, fiber optic light guides, surgical illumination systems, endoscopy cameras, and related medical devices. Their customers are hospitals, clinics, ENT specialists, surgeons, and medical equipment distributors across India and neighboring countries.

This is not telecom fiber optics. This is the kind of equipment a surgeon uses to see inside the human body during minimally invasive procedures.

The company has been running for over a decade on paper-based operations: calls, WhatsApp, spreadsheets, and relationships. That works at small scale. At larger scale, information fragments, visibility breaks down, and the business cannot grow without losing track of things. This codebase is the answer to that problem.

## Why This Codebase Exists

The goal is to build Welfo's entire technology layer from scratch.

At its core, the system is organizational memory. If a hospital calls about a scope they bought four years ago, nobody should have to dig through old emails or WhatsApp messages. Someone should be able to enter a serial number and immediately see the full history of that device. Every repair, every part used, every technician who worked on it, every payment made.

Every physical event in the company's operations should have a permanent digital trace. That is the principle behind every design decision in this system.

The immediate product is an internal operations platform that handles:

- Device intake when customers send in equipment for repair
- Service case management from intake through assessment, quotation, repair, quality check, and dispatch
- Quotation workflows with customer approval tracking
- Invoice generation and payment recording
- Spare parts catalog and inventory
- Product serial number registry with full service history
- Role-based access for operations staff, technicians, finance, and admins
- Full audit trail on every significant action

Later phases will add a customer portal, advanced analytics, and the full product lifecycle tracking (what we call Product DNA) where every physical device accumulates a complete digital history over its lifetime.

## Tech Stack

- TypeScript throughout, everywhere
- Node.js 22 with ES modules
- Next.js 16 for frontends
- tsup for compiling TypeScript backends
- tsx for running backends in development
- PostgreSQL as the primary database
- Prisma as the ORM
- REST APIs versioned at /api/v1 and /api/v2
- Docker and Docker Compose for all services
- Prometheus for metrics
- Grafana for dashboards
- Loki for log aggregation
- Promtail for log shipping
- Alertmanager with Telegram for alerts
- Turborepo for managing the monorepo

## Repository Structure

```
main-repo/
  apps/
    admin/       @welfo/admin       Next.js admin panel (port 3000)
    portal/      @welfo/portal      Next.js customer portal (port 3001)
    blog/        @welfo/blog        Next.js marketing and blog site (port 3002)
    api/         @welfo/api         Node.js TypeScript backend - main service API (port 4000)
    services/    @welfo/services    Node.js TypeScript backend - secondary services (port 4001)
  packages/
    ui/                             Shared React component library
    typescript-config/              Shared tsconfig presets (base, nextjs, node)
    eslint-config/                  Shared ESLint configs
  infra/
    docker/                         Dockerfiles for each app
    monitoring/
      prometheus/                   Prometheus config and alert rules
      grafana/                      Grafana provisioning and dashboards
      loki/                         Loki log storage config
      promtail/                     Promtail log scraping config
      alertmanager/                 Alertmanager with Telegram routing
  scripts/
    testing/                        Test runner scripts
    start-stop/                     Stack start and stop scripts
    db/                             Database migration and seed scripts
    monitoring/                     Health check scripts
  company_docs/                     Company background and founder philosophy
  tech_docs/                        Engineering specs, API design, DB design, GitHub rules
  agent_docs/                       Engineering standards and code rules
  session_docs/                     Session-by-session change logs
  claude_docs/                      Design reviews and analysis
  docker-compose.yml                Full stack definition
  Makefile                          Single entry point for all commands
  CLAUDE.md                         Rules and context for AI-assisted development
```

## Getting Started

### Prerequisites

- Node.js 22 or higher
- Docker and Docker Compose
- npm 11 or higher

### First time setup

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd main-repo
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

At minimum you need to set POSTGRES_PASSWORD and GRAFANA_PASSWORD. For Telegram alerts, set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.

### Running the stack

Start everything with one command:

```bash
make up
```

This starts all five apps, PostgreSQL, Prometheus, Grafana, Loki, Promtail, and Alertmanager.

To start only the monitoring stack without the apps:

```bash
make monitoring-up
```

To stop everything:

```bash
make down
```

### Running in development mode

For local development without Docker, run individual apps:

```bash
# run all apps in dev mode via turbo
npm run dev

# run a specific app
npx turbo dev --filter=@welfo/api
npx turbo dev --filter=@welfo/admin
```

### Building

Build all apps:

```bash
npm run build
```

Build a specific app:

```bash
npx turbo build --filter=@welfo/api
```

Or build the Docker images:

```bash
make build
```

## Service Ports

| Service | Port | Notes |
|---------|------|-------|
| admin | 3000 | Internal operations panel |
| portal | 3001 | Customer-facing portal (future) |
| blog | 3002 | Marketing and blog site |
| api | 4000 | Main backend API |
| services | 4001 | Secondary backend (future use) |
| PostgreSQL | 5432 | |
| Prometheus | 9090 | Metrics |
| Grafana | 9080 | Dashboards |
| Loki | 3100 | Log storage |
| Alertmanager | 9093 | Alert routing |

## Database

Run migrations:

```bash
make db-migrate
```

Seed development data:

```bash
make db-seed
```

Reset the database (development only, blocked in production):

```bash
make db-reset
```

## Testing

Run the full test suite:

```bash
make test
```

Run specific test types:

```bash
make test-unit           # unit tests only, no database needed
make test-integration    # integration tests, requires the DB container
make test-e2e            # end to end tests, requires the full stack
```

We test everything. Every feature gets tests written at the same time as the feature code. Every bug fix gets a regression test. Tests never get disabled to make CI pass.

## Monitoring

Once the monitoring stack is running, access:

- Grafana at http://localhost:9080 (default login is admin / your GRAFANA_PASSWORD)
- Prometheus at http://localhost:9090
- Alertmanager at http://localhost:9093

Grafana is pre-configured with Prometheus and Loki as data sources. Dashboard provisioning is automatic from the infra/monitoring/grafana/dashboards directory.

Alerts route to Telegram. You need a Telegram bot token and chat ID in your .env to receive alerts.

Check service health:

```bash
make health
```

View logs from all services:

```bash
make logs
```

View logs from one service:

```bash
make logs-service service=api
```

## Branch Structure

We follow a structured branching model. The full rules are in tech_docs/github_rules.md.

```
master
  dev
    staging
      active-dev
        active-dev-backend
          feat/...  fix/...
        active-dev-frontend
          feat/...  fix/...
```

New backend work: checkout a feature branch from backend-base, merge to active-dev-backend.
New frontend work: checkout a feature branch from frontend-base, merge to active-dev-frontend.

The base branches represent the latest stable state for each side. Feature branches always start from a base branch, not from active-dev directly.

Never push to master, dev, staging, or active-dev directly. Every change goes through a PR.

## Code Standards

The full engineering standards are in agent_docs/engineering_standards.md.

Short version:

- No inline comments in code. Context goes in session docs under session_docs/.
- Every session produces a session doc: YYYY-MM-DD_HH-MM_description.md
- Every new feature gets tests written alongside the code, not after
- Use pino for logging, not console.log
- Every service runs in Docker
- Commit message format: type: short description (feat, fix, chore, test, docs, refactor)

## Contributing

Read tech_docs/github_rules.md and agent_docs/engineering_standards.md before touching the codebase. Then:

1. Pull the latest from master
2. Create a feature branch from backend-base or frontend-base
3. Write your code with tests alongside it
4. Open a PR to the correct base branch
5. Get it reviewed and merged

Questions go to the lead before going into code. The 5 minutes it takes to ask is cheaper than the rework.
