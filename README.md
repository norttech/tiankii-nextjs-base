# tiankii-next-base

Base Next.js template with NextAuth v5, Shadcn, custom fetch proxy, API guards, and pre-configured tooling.

---

## Stack

- **Next.js 16** (App Router)
- **NextAuth v5** (JWT, Credentials provider)
- **Shadcn/ui** + Tailwind CSS v4
- **Zod** + React Hook Form
- **Husky** + lint-staged + Commitlint

---

## Getting Started

```bash
cp .env.example .env.local
npm install        # also runs `husky` via prepare script
npm run dev
```

---

## Folder Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (wraps with <Providers>)
│   ├── error.tsx               # Global error boundary
│   └── not-found.tsx           # 404 page
│
├── components/
│   ├── providers/              # <Providers> wrapper (SessionProvider, etc.)
│   └── ui/                     # Shadcn components (auto-generated, not linted)
│
├── lib/
│   ├── api/                    # Fetch client factories
│   │   └── core/
│   │       ├── apiFetch.ts     # Base fetch with error handling
│   │       └── createFetchClient.ts  # Private/public API factories (+Bearer token)
│   ├── config/                 # Application configuration
│   │   ├── env.ts              # Zod-validated env variables
│   │   └── routes.ts           # Security Route Configuration (PUBLIC_PAGES, PUBLIC_API_ROUTES)
│   └── utils/
│       ├── cn.ts               # Tailwind class merger
│       ├── error-handler.ts    # Typed error classes + handleApiError
│       └── pagination.ts       # getPaginationParams + createPaginatedResponse
│
├── middlewares/
│   ├── index.ts                # Barrel
│   ├── api/
│   │   └── with-guards.ts      # withGuards HOF (auth + role + schema + custom)
│   └── pages/
│       ├── auth-middleware.ts  # Page/API auth redirect middleware
│       └── public-routes.ts    # isPublicRoute helper (sources from config/routes)
│
├── types/
│   ├── api/index.ts            # ApiErrorResponse, ApiSuccessResponse<T>
│   ├── auth/index.ts           # SessionUser type
│   ├── asset/index.ts          # Asset types
│   ├── pagination/index.ts     # PaginatedResponse, PaginationParams
│   ├── index.ts                # Barrel
│   └── global.d.ts             # Global type definitions
│
├── auth.config.ts              # NextAuth config + AppRole enum + mock users
├── auth.ts                     # NextAuth instance (handlers, signIn, signOut, auth)
└── proxy.ts                    # Next.js middleware entry point
```

---

## Available Scripts

| Command                | Description               |
| ---------------------- | ------------------------- |
| `npm run dev`          | Start dev server          |
| `npm run build`        | Production build          |
| `npm run lint`         | Run ESLint                |
| `npm run lint:fix`     | ESLint with auto-fix      |
| `npm run format`       | Prettier format all files |
| `npm run format:check` | Prettier check (CI)       |

---

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/). Enforced via Commitlint + Husky.

```
<type>(<scope>): <subject>
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

---

## Error Classes

Use typed error classes instead of strings in API handlers:

```ts
import { NotFoundError, ForbiddenError } from "@/lib/utils/error-handler";

// Inside a withGuards handler:
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

Validated via Zod at startup in `src/env.ts`. Add new required variables there.

```bash
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
```
