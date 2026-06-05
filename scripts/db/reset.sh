#!/usr/bin/env bash
# Usage: bash scripts/db/reset.sh
# WARNING: Drops and recreates the database then runs migrations and seed
# Only for development. Never run against staging or production.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [ "${NODE_ENV:-}" = "production" ] || [ "${NODE_ENV:-}" = "staging" ]; then
    echo "ERROR: db reset is not allowed in $NODE_ENV"
    exit 1
fi

echo "Resetting database (dev only)..."
npx prisma migrate reset --force
echo "Database reset and seeded."
