#!/usr/bin/env bash
# Usage: bash scripts/testing/run-integration.sh
# Runs integration tests — requires the database container to be running
# Start the stack first with: make up

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Running integration tests..."
cd "$REPO_ROOT" && npx turbo run test:integration
echo "Integration tests done."
