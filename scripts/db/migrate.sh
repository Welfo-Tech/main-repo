#!/usr/bin/env bash
# Usage: bash scripts/db/migrate.sh
# Runs pending database migrations via Prisma

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations applied."
