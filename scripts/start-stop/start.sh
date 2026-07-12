#!/usr/bin/env bash
# Usage: bash scripts/start-stop/start.sh [service]
# Starts the full stack or a specific service
# Examples:
#   bash scripts/start-stop/start.sh           -- starts everything
#   bash scripts/start-stop/start.sh backend   -- starts backend only

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICE="${1:-}"

cd "$REPO_ROOT"

if [ -z "$SERVICE" ]; then
    echo "Starting full stack..."das
    docker compose up -d
    echo "Stack is up. Run 'make logs' to follow logs."
else
    echo "Starting service: $SERVICE"
    docker compose up -d "$SERVICE"
fi
