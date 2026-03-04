---
description: Scaffolds a full module including Prisma model, Zod schemas, API routes, and UI pages
---

# Create Module Skill

This skill defines the canonical workflow for scaffolding a new feature module. Every module MUST implement full CRUD. Backend rules are **strict and non-negotiable**. UI rules define required behaviour and integration points — the visual design and component choices are yours to make excellent.

**Reference examples** (in `examples/`):
- `category.schema.ts` — Zod schemas
- `category.route.list.ts` — list + create route
- `category.route.single.ts` — get / update / delete route
- `category.page.list.tsx` — list page
- `category.page.view.tsx` — view page

> **⚠️ NOTE:** Example files contain `// @ts-nocheck` to suppress editor errors (they live outside `src/`). **Never copy this line into generated files.** All generated code must be fully typed.

---

## Step 1 — Gather Requirements

Before writing any code:

1. Ask for the **module name** (e.g. `ProductCategory`).
   - Types/schemas → PascalCase: `ProductCategory`
   - File paths & URLs → kebab-case: `product-category`
   - Prisma model → camelCase: `productCategory`
2. Ask for the **model fields**: name, type, required/optional, unique constraints.
3. Ask for any **module-specific query filters** beyond the built-in search/sort/pagination.
4. **Confirm with the user before generating any code.**

---

## Step 2 — Scaffold Directory Structure

// turbo
Run the scaffold script:

```bash
bash .agents/skills/create-module/scripts/scaffold.sh <module_name>
```

---

## Step 3 — Prisma Model

Add the model to `prisma/schema.prisma`.

Every model MUST include these audit fields — no exceptions:

```prisma
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt
createdBy   String?
updatedBy   String?
```

// turbo
```bash
yarn db:generate
```

// turbo
```bash
yarn db:migrate
```

---

## Step 4 — Zod Schemas

**File:** `src/lib/schemas/[module]/[module].schema.ts`

Create three schemas:

- **`Create[Module]Schema`** — all user-facing fields. Omit: `id`, all audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`).
- **`Update[Module]Schema`** — same as Create, fully `.partial()`.
- **`Query[Module]Schema`** — MUST extend `QueryBaseSchema` from `@/lib/schemas/common`. This provides `page`, `pageSize` (0 = all), `search`, and multi-field `sort` (e.g. `+name,-createdAt`). Add any module-specific filter fields on top.

Export inferred TypeScript types for all three: `Create[Module]`, `Update[Module]`, `Query[Module]`.

---

## Step 5 — API Routes

**Files:**
- `src/app/api/[module]/route.ts` — `GET` (list), `POST` (create)
- `src/app/api/[module]/[id]/route.ts` — `GET`, `PATCH`, `DELETE`

### Non-negotiable rules

1. **`withGuards` wraps every handler** — import from `@/middlewares/api/with-guards`. **No `try/catch` blocks** — errors propagate to `withGuards` → `handleApiError`.
2. **Body validation via `withGuards`** — pass `schema` in options; `body` is auto-typed. Never call `.parse()` manually.
3. **Dynamic params typing** — type the second argument as `RouteContext<"/api/[module]/[id]">`. **Globally available — do not import it.**
4. **Audit fields** — always inject `user.id`:
   - Create → `createdBy: user.id`
   - Update → `updatedBy: user.id`
5. **Hard delete** — use `prisma.[model].delete({ where: { id } })`. No soft-delete fields.
6. **List filtering** — use destructuring to separate pagination/sorting from filters: `const { page, pageSize, sort, ...filters } = params;`. Spread `filters` directly into the `where` clause: `const where = { ...filters };`. This ensures "one-to-one" mapping with direct equality. Do not use global search or partial string matching (`contains`) unless explicitly requested.
7. **No `Promise.all` for database queries** — use `prisma.$transaction([])` for concurrent queries or serial await calls up to 2-3 requests, or direct calls.
8. **Response contract**:
   | Operation | Response |
   |-----------|----------|
   | List | `createPaginatedNextResponse(data, total, { page, pageSize })` from `@/lib/utils/pagination` |
   | Create | `NextResponse.json(record, { status: 201 })` |
   | Get / Update / Delete | `NextResponse.json(record)` — no `{ data }` envelope |
   | Not found | `throw new NotFoundError("...")` from `@/lib/utils/error-handler` |

---

## Step 6 — UI Pages & Components

**Pages to create** under `src/app/[locale]/[module]/`:

Every page MUST be a **Server Component**. All client-side logic, state, and fetching MUST be moved to a corresponding component in `src/components/modules/[module]/`.

| Page | Path | Client Component | Purpose |
|------|------|------------------|---------|
| List | `page.tsx` | `[Module]List.tsx` | Main listing view with search/sort/pagination |
| View | `[id]/page.tsx` | `[Module]View.tsx` | Detailed view of a single record |
| Create | `create/page.tsx` | `[Module]Form.tsx` | Create form (can also be reused for edit) |

### Hard rules (non-negotiable)

- **Server Components for Pages** — `page.tsx` files MUST NOT have `"use client"`. They should handle metadata, static SEO content, and pass necessary props to client components.
- **Client Components for UI** — All interactivity, `useQuery`, `useMutation`, and hooks MUST live in client components under `src/components/modules/[module]/`.
- **Data fetching** — `useQuery` / `useMutation` from `@tanstack/react-query` inside client components. All calls go through the API routes created in Step 5.
- **Navigation** — always import `Link`, `useRouter`, `redirect` from `@/lib/i18n/routing`.
- **Toasts** — `import { toast } from "react-hot-toast"` for success/error feedback.
- **i18n** — use `getTranslations` (server) or `useTranslations` (client) from `next-intl`.
- **Forms** — `react-hook-form` + `@hookform/resolvers/zod` + Zod schemas. Show inline field-level validation errors.
- **Type safety** — Every page component and `generateMetadata` function MUST use the global `PageProps<"/route-literal">` helper.
- **Async Props** — In Next.js 16+, `params` and `searchParams` are Promises. You MUST `await` them before access (e.g., `const { id } = await props.params`).
- **Response shape** — list endpoints return `PaginatedResponse<T>`. Batch operations (like delete) send an array of IDs.
- **Required UI behaviours**:
  - **List Actions**: Search input, sortable columns, pagination controls, "Add New" button.
  - **Batch Actions**: The table MUST have checkboxes for each row, and a "Batch Delete" button visible only when rows are selected, submitting to a `DELETE /api/[module]` endpoint containing an array of IDs in the body.
  - **Per-row Actions**: A Dropdown menu with: View, Edit (opens in a `Sheet` drawer on the same page), Print (`window.print()`), Duplicate (POSTs to `/api/.../duplicate`), Delete.
  - Form validation states disable submit buttons. Loading skeletons display while data loads. Empty states show when no data is found.
  - Delete always asks for confirmation before firing.

### Design freedom

The examples in `examples/` are **starting points, not templates to copy**. You are expected to:

- Improve the layout, spacing, and visual hierarchy for the specific module's data.
- Add charts, stats cards, or summary panels if they make sense for the data.
- Use colour, badges, or icons meaningfully (e.g. status indicators, category colours).
- Compose and organise sub-components however best suits the module.
- Combine or split pages differently if it produces a better UX (e.g. a slide-over panel instead of a separate view page for simple models).

The only constraints are the hard rules above. Everything else is a design decision — make it excellent.

---

## Step 7 — Internationalization

Update `src/lib/i18n/messages/en.json` and `es.json`. Use `resources/i18n-template.json` as the key structure reference.

Required key groups:
- Page title & breadcrumb labels
- Table column headers
- Form field labels, placeholders, and hint text
- Button labels (Save, Cancel, Delete, Edit, Duplicate, etc.)
- Success and error toast messages
- Confirmation dialog text
- Empty state and loading messages
