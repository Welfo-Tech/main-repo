#!/usr/bin/env bash
# Usage: bash scripts/testing/run-e2e.sh
# Runs end-to-end tests — requires the full stack running
# Start the stack first with: make up

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Running e2e tests..."
cd "$REPO_ROOT" && npx turbo run test:e2e
echo "E2E tests done."
