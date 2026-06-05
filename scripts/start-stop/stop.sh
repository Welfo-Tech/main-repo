#!/usr/bin/env bash
# Usage: bash scripts/start-stop/stop.sh [--volumes]
# Stops all containers
# Pass --volumes to also remove persistent volumes (WARNING: destroys data)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [ "${1:-}" = "--volumes" ]; then
    echo "Stopping stack and removing volumes..."
    docker compose down -v
else
    echo "Stopping stack..."
    docker compose down
fi

echo "Stack is down."
