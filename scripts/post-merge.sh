#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push
# Idempotent: fills the new category card fields and creates the product rows
# that used to be hardcoded. Safe to re-run; it never overwrites admin edits.
pnpm --filter @workspace/scripts run migrate-product-cards
