#!/usr/bin/env bash
# Starts the careers app dev server standalone.
# Usage: bash scripts/start-stop/start-careers.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CAREERS_DIR="$REPO_ROOT/apps/careers"

if [ ! -f "$CAREERS_DIR/.env" ]; then
  echo "No .env found in apps/careers/"
  echo "Copy apps/careers/.env.example to apps/careers/.env and fill in your Supabase credentials."
  exit 1
fi

cd "$CAREERS_DIR"
echo "Starting careers app at http://localhost:5174"
npx vite --port 5174
