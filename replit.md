# Oxymed Medikal

Turkish medical equipment company website with full CMS backend. Admin panel manages all site content (sliders, products, news, references, quote requests, corporate sections, site settings, media).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with initial data
- Required env: `DATABASE_URL` — Postgres connection string, `JWT_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Tailwind v4 (CSS @theme variables), react-router-dom v7
- API: Express 5, JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- File storage: Google Cloud Storage (Replit Object Storage), presigned URL uploads

## Where things live

- `artifacts/oxymed-medikal/` — React + Vite frontend (7 pages)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, sliders, products, news, references, quotes, corporate, settings, media, storage)
- `artifacts/api-server/src/lib/auth.ts` — JWT middleware and helpers
- `lib/db/src/schema/` — Drizzle ORM table definitions (10 tables)
- `lib/api-spec/openapi.yaml` — OpenAPI 3.1 spec (source of truth)
- `lib/api-zod/` — Generated Zod schemas
- `lib/api-client-react/` — Generated React Query hooks
- `scripts/src/seed.ts` — DB seed script

## DB Tables

- `admin_users` — CMS admin accounts (bcrypt hashed passwords)
- `sliders` — homepage slider/banner items
- `product_categories` — product category tree
- `products` — product catalog with JSON specs field
- `news` — news/blog posts with slugs
- `references` — reference project portfolio
- `quote_requests` — inbound quote form submissions
- `corporate_sections` — key-value content sections for corporate page
- `site_settings` — key-value site-wide settings (phone, email, social links, stats)
- `media_files` — uploaded media file tracking

## Auth

- Admin credentials (seeded): `admin@oxymed.com.tr` / `oxymed2024!`
- JWT Bearer token auth — POST `/api/auth/login` returns token, pass as `Authorization: Bearer <token>`
- Protected routes require `requireAuth` middleware

## Architecture decisions

- OpenAPI-first: spec in `lib/api-spec/openapi.yaml` drives Zod schema and React Query hook codegen
- Schema names must not match Orval-generated operation names (e.g. use `AuthTokenResult` not `AdminLoginResponse`)
- Object Storage uses presigned URL flow: client requests URL from `/api/media/request-upload-url`, uploads directly to GCS
- Turkish content throughout; all nav items, categories, and labels in Turkish

## Product

Corporate website for Oxymed Medikal — a Turkish medical gas systems and hospital equipment manufacturer based in İzmir. The site has 7 public pages (Home, Corporate, Products, References, News, Quote, Admin) with all content driven from the admin CMS.

## User preferences

- All site content in Turkish
- Tailwind v4 with custom colors: `--color-oxynavy-*` and `--color-steel-*`

## Gotchas

- Orval generates response type names from operation IDs; rename schemas in openapi.yaml if TS2308 appears
- `pnpm --filter @workspace/db run push` — schema push, use `push-force` if column conflicts occur
- JWT_SECRET env var is required; defaults to a dev secret if unset
- Object Storage env vars: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
