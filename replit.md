# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Media Management**: Cloudinary integration for image and video uploads

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/informe-portal` (`@workspace/informe-portal`)

React + Vite frontend for Informe Centro-Oeste news portal. Brand color: `#474085`.

**Public pages** (at `/`):
- Home, Article (`/noticia/:slug`), Category (`/categoria/:slug`), Search (`/busca`)

**Admin pages** (at `/admin/*`, JWT-protected):
- Login, Dashboard, Notícias (list + form), Categorias, Banners (accordion by position), Vídeos, Instagram Videos, Articulistas, Programas, Cidades (`/admin/cidades`), Usuários (admin-only), Configurações (admin-only), Logs de Auditoria (admin-only), Importar WordPress (admin-only)

**Cities system**:
- Admin registers cities linked to categories (e.g., "Regional" → Pains, Córrego Fundo)
- News form shows city dropdown when selected category has linked cities
- Category pages show city filter chips when cities exist for that category
- API: `/api/admin/cities` (CRUD), `/api/public/cities?category=<slug>`, `/api/public/news?city=<slug>`
- Schema: `lib/db/src/schema/cities.ts`, news table has `city_id` FK

**Banner system**:
- Positions: TOP, ABOVE_DESTAQUE, BELOW_DESTAQUE, BELOW_ARTICULISTAS, ABOVE_POLITICA, SIDE_POLITICA, SIDE_GERAL, SIDEBAR, BETWEEN_SECTIONS, BELOW_PLAYER
- Each position supports up to 5 banners, auto-rotating every 5s with dots navigation
- `BannerCarousel` component (`src/components/shared/BannerCarousel.tsx`) fetches banners by position and renders carousel
- Admin page shows positions as expandable accordions with thumbnail previews
- Cloudinary integration for image uploads: `CloudinaryUpload` component at `src/components/admin/CloudinaryUpload.tsx`

**Cloudinary integration**:
- Backend route: `POST /api/admin/cloudinary/image` (images) and `POST /api/admin/cloudinary/video` (videos)
- Frontend component: `CloudinaryUpload.tsx` — handles file selection, upload progress, and preview
- Used in: BannersAdmin (banner images), NewsForm (featured images), VideosAdmin (video thumbnails)
- Credentials: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (stored as Replit secrets)

**Admin credentials**: `admin@informecentrooeste.com.br` / `admin@2024Informe!`

**Key files**:
- `src/App.tsx` — routing, ProtectedRoute
- `src/hooks/use-auth.ts` — JWT auth state
- `src/hooks/use-admin.ts` — all admin CRUD hooks (wraps generated API client with auth headers)
- `src/hooks/use-public.ts` — public data hooks
- `src/components/layout/AdminLayout.tsx` — admin sidebar + header
- `src/components/shared/PublicLayout.tsx` — public nav + footer

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
