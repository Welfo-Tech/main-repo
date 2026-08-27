#!/usr/bin/env bash
# Usage: bash scripts/monitoring/check-health.sh
# Checks health status of all running services

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "Checking service health..."

check_service() {
    local name="$1"
    local url="$2"
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "  $name: OK"
    else
        echo "  $name: FAILED ($url)"
    fi
}

check_service "Admin UI"       "http://localhost:3000"
check_service "Portal"         "http://localhost:3001"
check_service "API"            "http://localhost:4000/health"
check_service "Services"       "http://localhost:4001/health"
check_service "Prometheus"     "http://localhost:9090/-/healthy"
check_service "Grafana"        "http://localhost:9080/api/health"
check_service "Alertmanager"   "http://localhost:9093/-/healthy"

echo "Health check done."
