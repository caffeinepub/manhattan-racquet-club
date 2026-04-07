#!/usr/bin/env bash
set -e

# ─── Permanent safeguards ────────────────────────────────────────────────────
# These run on every build to prevent regressions from future platform
# overwrites. If the files don't exist the guards are silently skipped.

# 1. Remove _initializeAccessControlWithSecret call from useActor.ts
for USEACTOR in \
  "src/frontend/src/hooks/useActor.ts" \
  "src/frontend/src/lib/useActor.ts"; do
  if [ -f "$USEACTOR" ]; then
    sed -i '/.*_initializeAccessControlWithSecret.*/d' "$USEACTOR"
    echo "[safeguard] _initializeAccessControlWithSecret removed from $USEACTOR"
  fi
done

# 2. Remove DEFAULT_PROJECT_ID constant and fix "nogateway" fallback in config.ts
for CONFIG in \
  "src/frontend/src/config.ts" \
  "src/frontend/src/lib/config.ts"; do
  if [ -f "$CONFIG" ]; then
    # Remove any line declaring DEFAULT_PROJECT_ID with a placeholder UUID
    sed -i '/.*DEFAULT_PROJECT_ID.*/d' "$CONFIG"
    # Fix ?? "nogateway" fallback (old style)
    sed -i 's|process\.env\.STORAGE_GATEWAY_URL ?? "nogateway"|process.env.STORAGE_GATEWAY_URL || DEFAULT_STORAGE_GATEWAY_URL|g' "$CONFIG"
    # Fix || "nogateway" fallback
    sed -i 's||| "nogateway"||| DEFAULT_STORAGE_GATEWAY_URL|g' "$CONFIG"
    # Replace bare "nogateway" string literal
    sed -i 's|"nogateway"|DEFAULT_STORAGE_GATEWAY_URL|g' "$CONFIG"
    echo "[safeguard] DEFAULT_PROJECT_ID and nogateway fallback patched in $CONFIG"
  fi
done
# ─────────────────────────────────────────────────────────────────────────────

# Install backend dependencies and build
cd src/backend
mops install
mops build

cd ../..
