#!/usr/bin/env bash
# Usage:
#   bash scripts/install.sh              install dependencies for every workspace
#   bash scripts/install.sh --app api    install only for apps/api
#   bash scripts/install.sh --app admin  install only for apps/admin
#   bash scripts/install.sh --app db     install only for packages/db

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --app)
      if [[ -z "${2:-}" ]]; then
        echo "error: --app requires a name (e.g. --app api)"
        exit 1
      fi
      APP="$2"
      shift 2
      ;;
    *)
      echo "unknown flag: $1"
      echo "usage: bash scripts/install.sh [--app <name>]"
      exit 1
      ;;
  esac
done

cd "$REPO_ROOT"

if [[ -z "$APP" ]]; then
  echo "installing dependencies for all workspaces..."
  npm install
  echo "done"
  exit 0
fi

if [[ -d "apps/$APP" ]]; then
  TARGET_DIR="apps/$APP"
elif [[ -d "packages/$APP" ]]; then
  TARGET_DIR="packages/$APP"
else
  echo "error: no app or package found with name '$APP'"
  echo ""
  echo "available apps:"
  ls apps/ | sed 's/^/  /'
  echo ""
  echo "available packages:"
  ls packages/ | sed 's/^/  /'
  exit 1
fi

WORKSPACE_NAME=$(node -p "require('./${TARGET_DIR}/package.json').name" 2>/dev/null || echo "")

if [[ -z "$WORKSPACE_NAME" ]]; then
  echo "error: could not read package name from ${TARGET_DIR}/package.json"
  exit 1
fi

echo "installing dependencies for $WORKSPACE_NAME ($TARGET_DIR)..."
npm install --workspace="$WORKSPACE_NAME"
echo "done"
