#!/usr/bin/env bash
# Usage: bash scripts/testing/run-all.sh
# Runs the full test suite across all apps and packages

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Running full test suite..."

bash "$REPO_ROOT/scripts/testing/run-unit.sh"
bash "$REPO_ROOT/scripts/testing/run-integration.sh"
bash "$REPO_ROOT/scripts/testing/run-e2e.sh"

echo "All tests passed."
