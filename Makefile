SHELL := /usr/bin/env bash

.PHONY: up down build rebuild restart logs logs-service ps \
        test test-unit test-integration test-e2e \
        db-migrate db-seed db-reset \
        health monitoring-up monitoring-down

## Stack controls

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

rebuild:
	docker compose build --no-cache

restart: down up

logs:
	docker compose logs -f

logs-service:
	docker compose logs -f $(service)

ps:
	docker compose ps

## Testing

test:
	bash scripts/testing/run-all.sh

test-unit:
	bash scripts/testing/run-unit.sh

test-integration:
	bash scripts/testing/run-integration.sh

test-e2e:
	bash scripts/testing/run-e2e.sh

## Database

db-migrate:
	bash scripts/db/migrate.sh

db-seed:
	bash scripts/db/seed.sh

db-reset:
	bash scripts/db/reset.sh

## Monitoring

health:
	bash scripts/monitoring/check-health.sh

monitoring-up:
	docker compose up -d prometheus grafana loki promtail alertmanager

monitoring-down:
	docker compose stop prometheus grafana loki promtail alertmanager
