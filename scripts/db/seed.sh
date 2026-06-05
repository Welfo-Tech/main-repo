#!/usr/bin/env bash
# Usage: bash scripts/db/seed.sh
# Seeds the database with initial data for development

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "Seeding database..."
npx prisma db seed
echo "Seed complete."
