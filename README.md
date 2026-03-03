# tiankii-next-base

Production-ready Next.js 16 base template with NextAuth v5, next-intl, Shadcn UI, Prisma v7, Playwright, and Docker/Cloud Run deployment out of the box.

---

## Stack

- **Next.js 16** (App Router, standalone output)
- **NextAuth v5** (JWT, Credentials provider)
- **next-intl** (i18n: `en` / `es`)
- **Prisma v7** + PostgreSQL (pg adapter, custom generated output)
- **Shadcn/ui** + Tailwind CSS v4
- **Zod** + React Hook Form
- **Playwright** (E2E Testing)
- **Husky** + lint-staged + Commitlint

---

## Getting Started

```bash
cp .env.example .env.local
yarn install        # also runs `husky` via prepare script
yarn db:generate    # generate Prisma client
yarn dev
```

---

## Folder Structure

```
src/
├── app/
│   ├── [locale]/               # All pages live under the locale segment
│   │   ├── layout.tsx          # Root layout (NextIntlClientProvider + Providers)
│   │   └── page.tsx            # Home page (uses useTranslations)
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth Route Handlers
│       ├── ping/               # Public Health Check → GET /api/ping
│       └── [...slug]/          # Catch-all API Fallback (returns JSON 404)
│
├── components/
│   ├── providers/              # <Providers> wrapper (SessionProvider, etc.)
│   └── ui/                     # Shadcn components (auto-generated, not linted)
│
├── lib/
│   ├── api/                    # Fetch client factories
│   │   └── core/
│   │       ├── apiFetch.ts     # Base fetch with error handling
│   │       └── createFetchClient.ts
│   ├── config/                 # Application configuration
│   │   ├── env.ts              # Zod-validated env variables (AUTH_SECRET, DATABASE_URL…)
│   │   └── routes.ts           # Security route config (PUBLIC_PAGES, PUBLIC_API_ROUTES)
│   ├── i18n/                   # Internationalization
│   │   ├── routing.ts          # Locale definitions + createNavigation
│   │   ├── request.ts          # next-intl server config
│   │   └── messages/
│   │       ├── en.json         # English translations
│   │       └── es.json         # Spanish translations
│   ├── db.ts                   # Prisma singleton client (pg adapter)
│   └── utils/
│       ├── cn.ts               # Tailwind class merger
│       ├── error-handler.ts    # Typed error classes + handleApiError
│       └── pagination.ts       # getPaginationParams + createPaginatedResponse
│
├── middlewares/
│   ├── index.ts
│   ├── api/
│   │   └── with-guards.ts      # withGuards HOF (auth + role + schema validation)
│   └── pages/
│       ├── auth-middleware.ts  # Auth redirect / JSON 401 for API
│       ├── i18n-middleware.ts  # next-intl locale injection
│       └── public-routes.ts    # isPublicRoute helper
│
├── types/
│   ├── global.d.ts             # Global types (no import needed): SessionUser, Nullable<T>…
│   └── …
│
├── auth.config.ts              # NextAuth base config
├── auth.ts                     # NextAuth instance
└── proxy.ts                    # Middleware entry point (i18n + auth chain)

prisma/
├── schema.prisma               # provider: prisma-client, output: ./generated/prisma
└── generated/                  # ← gitignored, re-generated via `yarn db:generate`

prisma.config.ts                # Prisma v7 config (schema path + DATABASE_URL)
Dockerfile                      # Multi-stage build (deps → builder → runner)
cloudbuild.yaml                 # Cloud Build → Artifact Registry → Cloud Run
```

---

## Available Scripts

| Command               | Description                 |
| --------------------- | --------------------------- |
| `yarn dev`            | Start dev server            |
| `yarn build`          | Production build            |
| `yarn lint`           | Run ESLint                  |
| `yarn lint:fix`       | ESLint with auto-fix        |
| `yarn format`         | Prettier format all files   |
| `yarn format:check`   | Prettier check (CI)         |
| `yarn test:e2e`       | Playwright (run all)        |
| `yarn test:e2e:ui`    | Playwright (interactive UI) |
| `yarn test:e2e:debug` | Playwright (debug mode)     |
| `yarn db:generate`    | Generate Prisma client      |
| `yarn db:migrate`     | Run Prisma migrations (dev) |
| `yarn db:studio`      | Open Prisma Studio          |

---

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/). Enforced via Commitlint + Husky.

```
<type>(<scope>): <subject>   ← subject must be lowercase
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

---

## Internationalization

All pages live under `src/app/[locale]/`. Translations are in `src/lib/i18n/messages/`.

```ts
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Index");
  return <h1>{t("title")}</h1>;
}
```

Add new keys to both `en.json` and `es.json`. Supported locales are defined in `src/lib/i18n/routing.ts`.

---

## Database (Prisma)

```ts
import { db } from "@/lib/db";

// Usage inside Server Components, API routes, or Server Actions:
const users = await db.user.findMany();
```

After adding models to `prisma/schema.prisma`, re-generate the client:

```bash
yarn db:generate
yarn db:migrate   # creates a migration and applies it
```

---

## Error Classes

```ts
import { NotFoundError, ForbiddenError } from "@/lib/utils/error-handler";

throw new NotFoundError("Product not found"); // → 404
throw new ForbiddenError(); // → 403
```

---

## Guard Usage

```ts
import { withGuards } from "@/middlewares";

export const GET = withGuards({ roles: ["admin"] }, async ({ user }) => {
  return NextResponse.json({ user });
});
```

---

## Env Variables

Validated via Zod at startup in `src/lib/config/env.ts`. The app will fail fast if any required variable is missing.

```bash
AUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

---

## API Endpoints

| Method | Path                      | Auth   | Description           |
| ------ | ------------------------- | ------ | --------------------- |
| GET    | `/api/ping`               | Public | Health check (`pong`) |
| ANY    | `/api/auth/[...nextauth]` | Public | NextAuth handlers     |
| ANY    | `/api/[...slug]`          | —      | Returns JSON 404      |

---

## Deployment

Build and deploy to Cloud Run using the included `cloudbuild.yaml`. Set `AUTH_SECRET` and `DATABASE_URL` directly in the Cloud Run service environment variables.

```bash
# Local Docker build test:
docker build -t tiankii-base .
docker run -p 8080:8080 --env-file .env.local tiankii-base
```
