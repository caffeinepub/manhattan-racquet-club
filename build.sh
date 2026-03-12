#!/usr/bin/env bash
set -e

CALM_MOC_PATH="/home/ubuntu/.motoko/moc/0.16.3-implicits-26/bin/moc"
CALM_MOTOKO_CORE="/home/ubuntu/.motoko/core/implicits-20"

# Remove any prior src to avoid nested src/src
BUILD_DIR=$(mktemp -d)
cp -rf ./src/. "$BUILD_DIR/"
cd "$BUILD_DIR"

ls -la

if [ ! -x "$CALM_MOC_PATH" ]; then
    echo "Error: Motoko compiler not found at $CALM_MOC_PATH" >&2
    exit 1
fi

if [ ! -d "$CALM_MOTOKO_CORE" ]; then
    echo "Error: Motoko core library not found at $CALM_MOTOKO_CORE" >&2
    exit 1
fi

# ─── Permanent safeguards ────────────────────────────────────────────────────
# 1. Remove _initializeAccessControlWithSecret call from useActor.ts
USEACTOR="frontend/src/hooks/useActor.ts"
if [ -f "$USEACTOR" ]; then
  sed -i '/.*_initializeAccessControlWithSecret.*/d' "$USEACTOR"
  echo "[safeguard] _initializeAccessControlWithSecret removed from useActor.ts"
fi

# 2. Remove DEFAULT_PROJECT_ID constant and fix "nogateway" fallback in config.ts
CONFIG="frontend/src/config.ts"
if [ -f "$CONFIG" ]; then
  sed -i '/.*DEFAULT_PROJECT_ID.*/d' "$CONFIG"
  sed -i 's|process\.env\.STORAGE_GATEWAY_URL ?? "nogateway"|process.env.STORAGE_GATEWAY_URL || DEFAULT_STORAGE_GATEWAY_URL|g' "$CONFIG"
  echo "[safeguard] DEFAULT_PROJECT_ID and nogateway removed from config.ts"
fi
# ─────────────────────────────────────────────────────────────────────────────

pnpm install --prefer-offline --child-concurrency 2 --network-concurrency 6
pnpm --filter '@caffeine/template-frontend' build:skip-bindings
node scripts/prune-unused-images.js
node scripts/resize-images.js

$CALM_MOC_PATH --implicit-package core --default-persistent-actors -no-check-ir -E M0236 -E M0235 -E M0223 -E M0237 --actor-idl src/backend/system-idl --package core "$CALM_MOTOKO_CORE" src/backend/main.mo -o src/backend/backend.wasm

mkdir -p /workdir/src/frontend/
mkdir -p /workdir/src/backend/
cp -rf src/frontend/dist/ /workdir/src/frontend/ 2>/dev/null || echo "No frontend dist to copy"
cp -f src/backend/backend.wasm /workdir/src/backend/ 2>/dev/null || echo "No backend wasm to copy"
