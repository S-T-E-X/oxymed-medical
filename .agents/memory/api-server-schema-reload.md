---
name: API server must restart after lib/db schema change
description: Why newly added DB columns silently don't persist until the API workflow is restarted
---

# API server caches the Drizzle schema at boot

After adding a column to a table in `lib/db/src/schema/*` and running `pnpm --filter @workspace/db run push`, the **running api-server workflow must be restarted** (`restart_workflow "artifacts/api-server: API Server"`).

**Why:** the api-server runs under tsx watch, which watches its own source but does NOT reload the linked `@workspace/db` workspace package. The Drizzle table object is captured at process boot. Inserts use `db.insert(table).values({ ...item })`; Drizzle only writes keys present in its in-memory schema, so a freshly-added column is **silently dropped** on insert (value comes back null/default) even though the DB column exists and the Zod body accepted it. Reads also won't select the new column. This manifests as "the new field does nothing / the feature doesn't work" with no error.

**How to apply:** any lib/db schema change → `push` → restart the api-server workflow → verify the field round-trips via the API before assuming the feature is broken.
