## Session: Docker, Monitoring, README, and Branch Setup

Date: 2026-06-06
Time: Session 3

---

### What We Did

Set up the full Docker stack and monitoring infrastructure, rewrote the README, and created all project branches with a clean shared state. We are now on active-dev-backend ready for feature work.

---

### What Was Created

**`docker-compose.yml`** (root)
Full stack definition with all services:
- postgres (port 5432) with healthcheck
- api (port 4000) depends on postgres healthy
- services (port 4001) depends on postgres healthy
- admin (port 3000)
- portal (port 3001)
- blog (port 3002)
- prometheus (port 9090)
- grafana (port 9080, internal 3000) with persistent volume
- loki (port 3100) for log storage
- promtail (no external port) ships logs to loki
- alertmanager (port 9093) with Telegram routing

Single network named welfo, named volumes for postgres, prometheus, grafana, loki, alertmanager.

**`.env.example`** (root)
Template with all required env vars: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, DATABASE_URL, GRAFANA_USER, GRAFANA_PASSWORD, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_API_URL.

**`infra/docker/api/Dockerfile`**
Multi-stage build: pruner (turbo prune @welfo/api --docker), installer (npm ci), builder (tsup), runner (node:22-alpine minimal with non-root user, exposes 4000).

**`infra/docker/services/Dockerfile`**
Same pattern as api. Exposes 4001.

**`infra/docker/admin/Dockerfile`**
Multi-stage build using Next.js standalone output. Copies .next/standalone, .next/static, public. Runs apps/admin/server.js.

**`infra/docker/portal/Dockerfile`**
Same as admin. Exposes 3001.

**`infra/docker/blog/Dockerfile`**
Same as admin. Exposes 3002.

**`infra/monitoring/prometheus/prometheus.yml`**
Scrapes: prometheus itself, welfo-api (port 4000 /metrics), welfo-services (port 4001 /metrics), postgres (port 9187). Retention 30 days. References alertmanager.

**`infra/monitoring/prometheus/rules/alerts.yml`**
Alert rules:
- ServiceDown (critical, 1m): service unreachable
- HighErrorRate (warning, 2m): 5xx rate above 5 percent
- HighLatency (warning, 5m): p95 above 2 seconds
- DatabaseConnectionPoolExhausted (critical, 1m): no available DB connections
- ServiceCaseSLABreach (warning, instant): welfo_service_case_sla_breached_total metric
- HighOpenCaseVolume (info, 10m): more than 100 open service cases

**`infra/monitoring/alertmanager/alertmanager.yml`**
Routes to Telegram via bot token and chat ID from env vars. Critical alerts repeat every 1h, warnings repeat every 4h. Inhibition rule: critical suppresses warning for same alert+job.

**`infra/monitoring/grafana/provisioning/datasources/prometheus.yml`**
Auto-provisions Prometheus as default datasource at http://prometheus:9090.

**`infra/monitoring/grafana/provisioning/datasources/loki.yml`**
Auto-provisions Loki datasource at http://loki:3100.

**`infra/monitoring/grafana/provisioning/dashboards/dashboards.yml`**
Auto-provisions dashboards from /var/lib/grafana/dashboards, polls every 30s.

**`infra/monitoring/promtail/promtail.yml`**
Scrapes Docker container logs from the Docker socket. Filters to welfo containers by name. Parses JSON log format (pino compatible). Ships to Loki. Also scrapes /var/log/*.log for system logs.

**`infra/monitoring/loki/loki.yml`**
Loki config: filesystem storage, schema v13, tsdb store, 7 day sample rejection window, alertmanager integration.

**`README.md`** (full rewrite)
Covers: what Welfo is and what it does, why this codebase exists, tech stack, repo directory structure, getting started (install, env setup, make commands), service port table, database commands, testing, monitoring access, branch structure, code standards summary, contributing guide.
No em dashes, no special chars, casual professional tone.

**`apps/admin/next.config.js`**, **`apps/portal/next.config.js`**, **`apps/blog/next.config.js`**
Added `output: "standalone"` to enable the Next.js standalone build needed for the Docker images.

**`Makefile`** (updated)
Added: `rebuild` (no-cache), `logs-service` (single service), `monitoring-up`, `monitoring-down`.

---

### Key Decisions

1. Full Prometheus + Grafana + Loki + Promtail + Alertmanager stack from day one
2. Grafana runs on port 9080 externally to avoid conflict with admin on 3000
3. Telegram for all alerts via Alertmanager, no email dependency
4. Promtail uses Docker socket to auto-discover welfo containers by name
5. Business-level alert rules added alongside infra rules (SLA breach, open case volume) so we get operational visibility from the start
6. All Dockerfiles use turbo prune pattern for minimal build context
7. Non-root user (welfo) in all runner containers

---

### Branch State

All 8 branches created and pointing to the same commit (d6c7b6f):
- main
- dev
- staging
- active-dev
- active-dev-backend
- active-dev-frontend
- backend-base
- frontend-base

**Current branch: active-dev-backend**

---

### What Is Left Open

- No Grafana dashboards JSON files yet (infra/monitoring/grafana/dashboards/ is empty, will be built as we add metrics)
- Prisma schema not yet initialized (next major task)
- api and services have placeholder entry points only
- Authentication system not started yet
