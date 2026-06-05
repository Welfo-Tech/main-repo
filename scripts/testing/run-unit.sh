#!/usr/bin/env bash
# Usage: bash scripts/testing/run-unit.sh
# Runs unit tests only — no database, no external dependencies

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Running unit tests..."
cd "$REPO_ROOT" && npx turbo run test:unit
echo "Unit tests done."
