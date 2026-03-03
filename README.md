# tiankii-next-base

Production-ready Next.js base template. A fully-configured starter for building full-stack applications with authentication, internationalization, type-safe API routes, and database access — ready to deploy to Cloud Run.

---

## Stack

| Layer        | Technology                                               |
| ------------ | -------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, standalone output)           |
| Auth         | **NextAuth v5** (JWT, Credentials provider)              |
| i18n         | **next-intl** (`en` / `es`)                              |
| Database     | **Prisma v6** + PostgreSQL (pg adapter)                  |
| UI           | **Shadcn/ui** + Tailwind CSS v4                          |
| Validation   | **Zod** + React Hook Form                                |
| Testing      | **Playwright** (E2E)                                     |
| Code Quality | **Husky** + lint-staged + Commitlint + ESLint + Prettier |

---

## Getting Started

```bash
# 1. Copy environment variables
cp .env.example .env.local

# 2. Install dependencies (also installs Husky hooks via prepare script)
yarn install

# 3. Generate the Prisma client
yarn db:generate

# 4. Start the development server
yarn dev
```

> The app validates all env variables on startup via Zod (`src/lib/config/env.ts`) and will **fail fast** if any required variable is missing.

---

## Folder Structure

```
src/
├── app/
│   ├── [locale]/                    # All UI pages live under the locale segment
│   │   ├── layout.tsx               # Root layout (NextIntlClientProvider + Providers)
│   │   └── page.tsx                 # Home page
│   └── api/
│       ├── auth/[...nextauth]/      # NextAuth route handlers
│       ├── ping/                    # Public health check  →  GET /api/ping
│       └── [...slug]/               # Catch-all fallback   →  JSON 404
│
├── components/
│   ├── providers/                   # <Providers> wrapper (SessionProvider, etc.)
│   └── ui/                          # Shadcn components (auto-generated, not linted)
│
├── hooks/
│   └── use-session.ts               # Typed wrapper around next-auth useSession
│
├── lib/
│   ├── api/                         # Fetch client factories
│   │   └── core/
│   │       ├── apiFetch.ts          # Base fetch with error handling
│   │       └── createFetchClient.ts
│   ├── config/
│   │   ├── env.ts                   # Zod-validated env variables
│   │   └── routes.ts                # PUBLIC_PAGES / PUBLIC_API_ROUTES
│   ├── i18n/
│   │   ├── routing.ts               # Locale definitions + createNavigation
│   │   ├── request.ts               # next-intl server config
│   │   └── messages/
│   │       ├── en.json
│   │       └── es.json
│   ├── schemas/
│   │   └── common/                  # Shared Zod schemas for list/query endpoints
│   │       ├── pagination.schema.ts # { page, pageSize }  — pageSize=0 means fetch all
│   │       ├── sorting.schema.ts    # sort string parser  (+field,-field)
│   │       ├── search.schema.ts     # { search? }
│   │       ├── query-base.schema.ts # Combined: pagination + sorting + search
│   │       └── index.ts             # Barrel export
│   ├── db.ts                        # Prisma singleton client (pg adapter)
│   └── utils/
│       ├── cn.ts                    # Tailwind class merger
│       ├── error-handler.ts         # Typed error classes + handleApiError
│       └── pagination.ts            # getPaginationParams + createPaginatedNextResponse
│
├── middlewares/
│   ├── index.ts
│   ├── api/
│   │   └── with-guards.ts           # withGuards HOF: auth + body validation + error handling
│   └── pages/
│       ├── auth-middleware.ts       # Auth redirect / JSON 401 for API routes
│       ├── i18n-middleware.ts       # next-intl locale injection
│       └── public-routes.ts        # isPublicRoute helper
│
├── types/
│   ├── global.d.ts                  # Global ambient types: SessionUser, Nullable<T>, PaginatedResponse<T>…
│   ├── next-auth.d.ts               # NextAuth Session augmentation
│   ├── api.ts                       # API response types (ApiErrorResponse, etc.)
│   └── pagination/index.ts          # PaginatedQueryParams
│
├── auth.config.ts                   # NextAuth base config (Credentials provider + mock users)
├── auth.ts                          # NextAuth instance export
└── proxy.ts                         # Middleware entry point (i18n + auth chain)

prisma/
├── schema.prisma                    # Prisma schema (output: ./generated/prisma)
└── generated/                       # ← gitignored, regenerate via `yarn db:generate`

prisma.config.ts                     # Prisma v7 config (schema path + DATABASE_URL)
Dockerfile                           # Multi-stage build  (deps → builder → runner)
cloudbuild.yaml                      # Cloud Build → Artifact Registry → Cloud Run
```

---

## Available Scripts

| Command               | Description                 |
| --------------------- | --------------------------- |
| `yarn dev`            | Start dev server            |
| `yarn build`          | Production build            |
| `yarn start`          | Start production server     |
| `yarn lint`           | Run ESLint                  |
| `yarn lint:fix`       | ESLint with auto-fix        |
| `yarn format`         | Prettier — format all files |
| `yarn format:check`   | Prettier check (CI)         |
| `yarn test:e2e`       | Playwright — run all tests  |
| `yarn test:e2e:ui`    | Playwright — interactive UI |
| `yarn test:e2e:debug` | Playwright — debug mode     |
| `yarn db:generate`    | Generate Prisma client      |
| `yarn db:migrate`     | Create + apply migration    |
| `yarn db:studio`      | Open Prisma Studio          |

---

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/). Enforced via Commitlint + Husky on every commit.

```
<type>(<scope>): <Subject sentence-case>
```

**Allowed types:** `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `revert`

> ⚠️ The subject **must be sentence-case** (first word capitalized, rest lowercase). The commit will be rejected otherwise.

---

## Internationalization

All UI pages live under `src/app/[locale]/`. Translation files are in `src/lib/i18n/messages/`.

```ts
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Index");
  return <h1>{t("title")}</h1>;
}
```

- Add new keys to **both** `en.json` and `es.json`.
- Supported locales and navigation helpers are defined in `src/lib/i18n/routing.ts`.

---

## Database (Prisma)

The Prisma client is a singleton exported from `src/lib/db.ts`:

```ts
import { db } from "@/lib/db";

const users = await db.user.findMany();
```

After modifying `prisma/schema.prisma`:

```bash
yarn db:generate   # regenerate the typed Prisma client
yarn db:migrate    # create migration file and apply it to the DB
```

---

## Common Query Schemas

Reusable Zod schemas for list endpoints live in `src/lib/schemas/common/` and are exported from the barrel `index.ts`.

```ts
import { QueryBaseSchema } from "@/lib/schemas/common";

// Extend with module-specific filters
export const QueryProductSchema = QueryBaseSchema.extend({
  category: z.string().optional(),
});
```

`QueryBaseSchema` provides:

- `page` — page number (min: 1, default: 1)
- `pageSize` — records per page (min: 0, max: 100, default: 10). **`pageSize: 0` fetches all records** (no limit applied to Prisma).
- `search` — optional search string
- `sort` — multi-field sort string. Format: `+field` (asc) or `-field` (desc), comma-separated:
  ```
  ?sort=+name,-createdAt   →  [{ name: "asc" }, { createdAt: "desc" }]
  ```

---

## Pagination Utility

`src/lib/utils/pagination.ts` exports two functions used in every list endpoint:

```ts
import { getPaginationParams, createPaginatedNextResponse } from "@/lib/utils/pagination";

export const GET = withGuards({}, async ({ req }) => {
  const { page, pageSize, skip, take } = getPaginationParams(req);
  // skip and take are undefined when pageSize = 0 (Prisma returns all records)

  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take, orderBy: params.sort }),
    prisma.product.count({ where }),
  ]);

  return createPaginatedNextResponse(data, total, { page, pageSize });
});
```

All list responses follow this shape:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## API Guards (`withGuards`)

All API handlers MUST be wrapped with `withGuards` from `@/middlewares/api/with-guards`.

It handles, in order:

1. **Authentication** — returns `401` if no valid session
2. **Body validation** — if `schema` is provided, parses and validates `req.json()` via Zod; returns `400` on failure
3. **Custom guards** — any additional `guards` functions are run in sequence
4. **Error handling** — all uncaught errors are passed to `handleApiError` (no `try/catch` needed in handlers)

```ts
import { withGuards } from "@/middlewares/api/with-guards";
import { CreateProductSchema } from "@/lib/schemas/product/product.schema";
import { NextResponse } from "next/server";

// No body — only auth
export const GET = withGuards({}, async ({ req, user }) => {
  const products = await prisma.product.findMany();
  return NextResponse.json(products); // return record directly, no wrapper
});

// With schema — body is typed as z.infer<typeof CreateProductSchema>
export const POST = withGuards({ schema: CreateProductSchema }, async ({ user, body }) => {
  const product = await prisma.product.create({
    data: { ...body, createdBy: user.id },
  });
  return NextResponse.json(product, { status: 201 });
});
```

For dynamic route segments, use the globally available `RouteContext` type (generated by `next build` / `next typegen` — **no import needed**):

```ts
export const GET = withGuards({}, async ({ user }, ctx: RouteContext<"/api/products/[id]">) => {
  const { id } = await ctx.params;
  // ...
});
```

---

## Error Classes

Throw typed errors from anywhere inside a `withGuards` handler — they are caught and serialized automatically into the correct HTTP response:

```ts
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@/lib/utils/error-handler";

throw new NotFoundError("Product not found"); // → 404 NOT_FOUND
throw new ForbiddenError(); // → 403 FORBIDDEN
throw new ConflictError("Already exists"); // → 409 CONFLICT
throw new ValidationError("Invalid input"); // → 400 VALIDATION_ERROR
```

Zod errors thrown by `withGuards` schema validation are also formatted automatically as `400` responses with per-field details.

---

## Session Hook

```ts
import { useSession } from "@/hooks/use-session";

const { user, isAuthenticated, isLoading, session, update } = useSession();
```

---

## Route Security

Public pages and API routes that bypass authentication are configured in `src/lib/config/routes.ts`:

```ts
export const PUBLIC_PAGES: string[] = ["/"];
export const PUBLIC_API_ROUTES: string[] = ["/api/auth/*", "/api/ping"];
```

Add new public paths here. Everything else requires a valid session.

---

## Env Variables

Validated at startup via Zod in `src/lib/config/env.ts`. The app **fails fast** if any required variable is missing.

```bash
AUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

---

## Built-in API Endpoints

| Method | Path                      | Auth   | Description        |
| ------ | ------------------------- | ------ | ------------------ |
| `GET`  | `/api/ping`               | Public | Health check       |
| `ANY`  | `/api/auth/[...nextauth]` | Public | NextAuth handlers  |
| `ANY`  | `/api/[...slug]`          | —      | Catch-all JSON 404 |

---

## Deployment

Deploy to Cloud Run using the included `cloudbuild.yaml`. Set `AUTH_SECRET` and `DATABASE_URL` in the Cloud Run service's environment variables.

```bash
# Test the Docker build locally:
docker build -t tiankii-base .
docker run -p 8080:8080 --env-file .env.local tiankii-base
```
