---
description: Scaffolds a full enterprise-grade CRUD module including Prisma model, Zod schemas, API routes, and UI pages with TanStack Table, Side Drawer, Bulk Actions, Pagination, and Mobile Card View
---

# Create Module Skill — Enterprise-Grade CRUD

This skill defines the canonical workflow for scaffolding a new feature module. Every module MUST implement full CRUD with **enterprise-grade UX**. Backend rules are **strict and non-negotiable**. UI rules define required behaviour, patterns, and component architecture — the visual polish and exact styling are yours to make excellent.

You are acting as a **Senior Frontend Architect & UX Expert** specialising in corporate SaaS systems and high-data-density B2B applications.

**Reference examples** (in `examples/`):

| File | Purpose |
|------|---------|
| `category.schema.ts` | Zod schemas (Create, Update, Query) |
| `category.route.list.ts` | List + Create + Batch Delete + Batch Archive API route |
| `category.route.single.ts` | Get / Update / Delete API route |
| `category.page.tsx` | Server Component — list page |
| `category.view.page.tsx` | Server Component — view page |
| `category.data-table.tsx` | TanStack Table + column visibility + page header + pagination |
| `category.columns.tsx` | Column definitions with select, sortable headers, row actions |
| `category.drawer.tsx` | Side Drawer (Sheet) for Create/Update with multi-step mobile support |
| `category.bulk-toolbar.tsx` | Sticky Bulk Action Toolbar with aria-live + overflow menu |
| `category.delete-dialog.tsx` | Permanent delete confirmation with ID transcription friction |
| `category.card-view.tsx` | Mobile card layout |
| `category.url-state.ts` | URL state management using nuqs |
| `category.query.ts` | TanStack Query hooks for data fetching |
| `category.mutations.ts` | TanStack Mutation hooks for CRUD operations |

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
4. Ask which fields are **suitable for mobile card view** (primary label, secondary label, badge).
5. **Confirm with the user before generating any code.**

---

## Step 2 — Scaffold Directory Structure

// turbo
Run the scaffold script:

```bash
bash .agents/skills/create-module/scripts/scaffold.sh <module_name>
```

This creates:
- `src/app/api/<module>/[id]/` — API routes
- `src/lib/schemas/<module>/` — Zod schemas
- `src/app/[locale]/<module>/[id]/` — UI pages
- `src/components/modules/<module>/` — Client components (table, drawer, toolbar, columns, delete dialog)
- `src/lib/hooks/<module>/` — Custom hooks (queries, mutations, URL state)

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

Every model MUST include these status fields for the archival pattern (archive = deactivate, not delete):

```prisma
isArchived  Boolean   @default(false)
archivedAt  DateTime?
archivedBy  String?
```

// turbo
```bash
yarn db:generate
```

// turbo
```bash
yarn db:migrate
```

### Prisma Seed

For every module implemented, you MUST add seed data to `prisma/seed.ts`. Append dummy data creation logic for the new model to `prisma/seed.ts` (e.g., using `prisma.[model].createMany([...])`).

// turbo
```bash
npx prisma db seed
```

---

## Step 4 — Zod Schemas

**File:** `src/lib/schemas/[module]/[module].schema.ts`

Create three schemas:

- **`Create[Module]Schema`** — all user-facing fields. Omit: `id`, all audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`), and status fields (`isArchived`, `archivedAt`, `archivedBy`).
- **`Update[Module]Schema`** — all user-facing fields plus `isArchived` for status toggling, fully `.partial()`. Omit: `id`, and system-managed fields (`archivedAt`, `archivedBy` — these are set automatically by the route when `isArchived` changes).
- **`Query[Module]Schema`** — MUST extend `QueryBaseSchema` from `@/lib/schemas/common`. This provides `page`, `pageSize` (0 = all), `search`, and multi-field `sort` (e.g. `+name,-createdAt`). Add any module-specific filter fields on top. Include `isArchived` as an optional boolean filter defaulting to `false`.

Export inferred TypeScript types for all three: `Create[Module]`, `Update[Module]`, `Query[Module]`.

### Domain Types

Domain types MUST live in `src/types/[module]/index.ts`, **separate from Zod schemas**. Schemas are for validation; types define the data shape.

- **Base model types** — re-export directly from Prisma v7 generated client:
  ```ts
  export type { Customer } from "@prisma/client";
  ```
- **Composite types with relations** — extend base models in `src/types/prisma/index.ts`:
  ```ts
  import type { Customer, User } from "@prisma/client";
  export type UserWithCustomers = User & { customers: Customer[] };
  ```
- **Enums** — always import from `@prisma/client` (Prisma v7 generates them as TypeScript enums):
  ```ts
  export type { CustomerStatus } from "@prisma/client";
  ```

> **Never define a type that duplicates a Prisma model.** Import from the generated client instead.

---

## Step 5 — API Routes

**Files:**
- `src/app/api/[module]/route.ts` — `GET` (list), `POST` (create), `DELETE` (batch delete), `PATCH` (batch archive/restore)
- `src/app/api/[module]/[id]/route.ts` — `GET`, `PATCH`, `DELETE`

### Non-negotiable rules

1. **`withGuards` wraps every handler** — import from `@/middlewares/api/with-guards`. **No `try/catch` blocks** — errors propagate to `withGuards` → `handleApiError`.
2. **Body validation via `withGuards`** — pass `schema` in options; `body` is auto-typed. Never call `.parse()` manually.
3. **Dynamic params typing** — type the second argument as `RouteContext<"/api/[module]/[id]">`. **Globally available — do not import it.**
4. **Audit fields** — always inject `user.id`:
   - Create → `createdBy: user.id`
   - Update → `updatedBy: user.id`
5. **Delete = permanent** — `DELETE` always performs an irreversible hard delete (`prisma.[model].delete()`). There is no soft delete. Archiving is a separate status-toggle action handled via `PATCH`.
6. **List filtering** — use destructuring to separate pagination/sorting from filters: `const { page, pageSize, sort, ...filters } = params;`. By default, filter out archived records (`isArchived: false`) unless the query explicitly passes `isArchived: true`. Spread `filters` directly into the `where` clause. Do not use global search or partial string matching (`contains`) unless explicitly requested.
7. **No `Promise.all` for database queries** — use `prisma.$transaction([])` for concurrent queries or serial await calls up to 2-3 requests.
8. **Archive / Restore** — handled via `PATCH` with `{ isArchived: true/false }`. The route MUST automatically set `archivedAt` and `archivedBy` when `isArchived` changes (set on `true`, clear to `null` on `false`). **Batch archive/restore** uses `PATCH /api/[module]` with `{ ids: [...], isArchived: true/false }`. Import `BatchDeleteSchema` and `BatchArchiveSchema` from `@/lib/schemas/common`.
9. **Response contract**:
   | Operation | Response |
   |-----------|----------|
   | List | `createPaginatedNextResponse(data, total, { page, pageSize })` from `@/lib/utils/pagination` |
   | Create | `NextResponse.json(record, { status: 201 })` |
   | Get / Update / Delete | `NextResponse.json(record)` — no `{ data }` envelope |
   | Not found | `throw new NotFoundError("...")` from `@/lib/utils/error-handler` |
10. **Prisma types** — import `{ type Prisma } from "@prisma/client"` and use the camelCase where-input type (e.g., `Prisma.sourcesWhereInput`). The generated Prisma v7 types use camelCase model names matching the `prisma.schema` model name. **Never use `any`** for the `where` clause.

---

## Step 6 — Custom Hooks (3 files)

Each module MUST create 3 hook files under `src/lib/hooks/[module]/`:

### 1. `use[Module]UrlState.ts` — URL State Management

Uses **`nuqs`** (not `useSearchParams` + `useRouter`) for URL state persistence. Every table state parameter is synced bidirectionally with URL query params.

```typescript
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

export function use[Module]UrlState() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("-createdAt"));
  const [isArchived, setIsArchived] = useQueryState("isArchived", parseAsString.withDefault("false"));
  // ... module-specific filters

  return { page, setPage, pageSize, setPageSize, search, setSearch, sort, setSort, isArchived, setIsArchived, /* ... */ };
}
```

### 2. `use[Module]Query.ts` — Data Fetching

Single query hook that accepts all URL state params and passes them to the API:

```typescript
import { useQuery } from "@tanstack/react-query";

export function use[Module]Query(params: { page?: number; pageSize?: number; search?: string; sort?: string; isArchived?: boolean }) {
  return useQuery({
    queryKey: ["[module]", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.append(key, String(value));
      });
      const res = await fetch(`/api/[module]?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}
```

### 3. `use[Module]Mutations.ts` — CRUD Mutations

All 6 mutations in one hook: `createMutation`, `updateMutation`, `deleteMutation`, `archiveMutation`, `batchArchiveMutation`, `batchDeleteMutation`. Each invalidates the query key on success.

---

## Step 7 — UI Pages & Components

### Architecture Overview

```
src/
├── app/[locale]/[module]/
│   ├── page.tsx                          ← Server Component (list)
│   └── [id]/page.tsx                     ← Server Component (view)
├── components/modules/[module]/
│   ├── [Module]DataTable.tsx             ← TanStack Table orchestrator
│   ├── [Module]Columns.tsx               ← Column definitions
│   ├── [Module]Drawer.tsx                ← Side Drawer for Create/Update
│   ├── [Module]BulkToolbar.tsx           ← Sticky bulk action toolbar
│   ├── [Module]DeleteDialog.tsx          ← Hard-delete confirmation dialog
│   ├── [Module]View.tsx                  ← Single record detail view
│   └── [Module]CardView.tsx              ← Mobile card layout
└── lib/hooks/[module]/
    ├── use[Module]Query.ts               ← Query hook with URL sync
    ├── use[Module]Mutations.ts           ← All CRUD mutations
    └── use[Module]UrlState.ts            ← URL state management (nuqs)
```

### Hard rules (non-negotiable)

- **Server Components for Pages** — `page.tsx` files MUST NOT have `"use client"`. They should handle metadata, static SEO content, and pass necessary props to client components.
- **Client Components for UI** — All interactivity, `useQuery`, `useMutation`, and hooks MUST live in client components under `src/components/modules/[module]/`.
- **Data fetching** — `useQuery` / `useMutation` from `@tanstack/react-query` inside client components. All calls go through the API routes created in Step 5.
- **Navigation** — always import `Link`, `useRouter`, `redirect` from `@/lib/i18n/routing`.
- **Toasts** — `import toast from "react-hot-toast"` (default import, not named) for success feedback ONLY. **Zero toasts for validation errors** — inline field-level errors only.
- **i18n** — use `getTranslations` (server) or `useTranslations` (client) from `next-intl`. Use `useTranslations()` (no namespace arg) and reference keys as `t("ModuleName.key")` with PascalCase namespaces.
- **Forms** — `react-hook-form` + `@hookform/resolvers/zod` + Zod schemas. Show inline field-level validation errors anchored below the field with ARIA descriptions and iconography.
- **Type safety** — Every page component and `generateMetadata` function MUST use the global `PageProps<"/route-literal">` helper.
- **Async Props** — In Next.js 16+, `params` and `searchParams` are Promises. You MUST `await` them before access (e.g., `const { id } = await props.params`).
- **Response shape** — list endpoints return `PaginatedResponse<T>`. Batch operations (like delete) send an array of IDs.
- **No duplicate imports** — never import from the same package in two separate `import` statements. Merge them into one (e.g., `import { useLocale, useTranslations } from "next-intl"`).
- **ESLint suppress** — add `// eslint-disable-next-line react-hooks/incompatible-library` above `useReactTable()` calls. This is a known TanStack Table warning, not a bug.

### 1. Enterprise Data Table (Read Operation)

The DataTable is the central orchestrator. It MUST implement this structure:

```
┌─────────────────────────────────────────────────────┐
│ Page Header (title + subtitle count + Create button)│
├─────────────────────────────────────────────────────┤
│ Toolbar (search + filter toggle + archive + columns)│
├─────────────────────────────────────────────────────┤
│ Filter Panel (collapsible, module-specific filters) │
├─────────────────────────────────────────────────────┤
│ Table (sticky headers, zebra stripes, sortable)     │
├─────────────────────────────────────────────────────┤
│ Bulk Action Toolbar (when rows selected)            │
├─────────────────────────────────────────────────────┤
│ Pagination ("Showing X to Y of Z" + Prev/Next)     │
├─────────────────────────────────────────────────────┤
│ Drawers & Dialogs (Sheet + Delete confirmation)     │
└─────────────────────────────────────────────────────┘
```

Technical requirements:
- **TanStack Table** — Use `useReactTable` with `getCoreRowModel`. Configure `manualPagination: true` and `manualSorting: true` (server-side).
- **pageCount** — pass `totalPages` from the API response to `pageCount` in useReactTable config.
- **Sorting handler** — use `Updater<SortingState>` type (import from `@tanstack/react-table`). Convert TanStack sorting state to/from URL sort string (`+field` / `-field`). Use optional chaining (`newSorting[0]?.desc`) to avoid undefined errors.
- **Sticky headers** — Apply `sticky top-0 z-10 bg-background` to `<thead>`.
- **Zebra stripes** — Apply `even:bg-muted/30` for scan readability.
- **Column visibility** — TanStack `columnVisibility` state + dropdown toggle.
- **Semantic HTML** — prefer native `<table>` elements.
- **Page Header** — positioned above the toolbar with `<h1>` title, subtitle showing total count, and primary Create button.
- **Debounced search** — 300ms debounce with `useState` + `useEffect` + `setTimeout`.
- **Pagination** — positioned below the bulk toolbar, showing "Showing X to Y of Z" with Previous/Next buttons and page indicator (`page / totalPages`). Use `Common.showing`, `Common.previous`, `Common.next` i18n keys.

### 2. Mobile Responsive — Card View

For screens `< md` breakpoint:

- Transform the data table into a **Card View** that stacks header-value pairs vertically.
- Each card MUST show: primary label (e.g. name), secondary info, status badge, and an action menu.
- Use `useMediaQuery` or CSS `hidden md:block` / `block md:hidden` patterns.
- Cards must include the checkbox for selection, supporting bulk actions on mobile.

### 3. URL State Persistence (nuqs)

- **All table state must persist in URL query params** via `nuqs`: `page`, `pageSize`, `sort`, `search`, and any active filters.
- Use the `use[Module]UrlState` hook (see Step 6) that wraps `useQueryState` from `nuqs`.
- On page reload or shared link, the table MUST rehydrate its exact state from the URL.
- Apply **debouncing** (300ms) on text search inputs to avoid excessive URL mutations.
- **Never expose sensitive data in the URL.**

### 4. Side Drawer for Create & Update

- Use shadcn `Sheet` (side="right") instead of modals for high-density forms.
- The drawer slides from the right, allowing the user to see the background table as a referential anchor.
- **Desktop**: Single-column vertical layout with rhythmic spacing groups.
- **Mobile**: Fragment the form into a **multi-step wizard** to reduce touch anxiety. Use step indicators (1/3, 2/3, 3/3) with Previous/Next/Submit buttons.
- The same `[Module]Drawer.tsx` handles both Create (no initial data) and Update (pre-populated) modes.
- On successful mutation, close the drawer + invalidate the query cache.

### 5. Archive & Delete Flows

- **Archive (status toggle)**: The "Archive" action is a non-destructive status change (`isArchived: true` via `PATCH`). Use a lightweight confirmation or an optimistic toggle — no heavy dialog needed. The record can be restored from an "Archived" filter view via `PATCH` with `{ isArchived: false }`. This is **not** a delete operation.
- **Delete (permanent)**: The only `DELETE` operation is an irreversible hard delete. Introduce **cognitive friction** — the user MUST type the record's unique alphanumeric identifier (e.g. the record ID or a short code) into a confirmation input. The "Confirm Delete" button stays disabled until the transcribed text matches exactly.
- Use the `[Module]DeleteDialog.tsx` component for this pattern.

### 6. Bulk Actions

- **Persistent checkboxes** on the left margin of every row.
- Upon selection, display a **Sticky Bulk Action Toolbar** at the bottom or top of the table.
- The toolbar MUST:
  - Show dynamic selection count with `aria-live="polite"` for screen reader announcements.
  - Expose **primary, non-destructive actions** (e.g. "Activate", "Archive") as visible buttons.
  - Hide **destructive/irreversible actions** (e.g. "Delete Permanently") inside an overflow `DropdownMenu`.
  - Include a "Deselect All" button.
- Use `[Module]BulkToolbar.tsx` component.

### 7. Optimistic UI & Error Handling

- Use **Optimistic Updates** (React 19's `useOptimistic` or manual cache manipulation via `queryClient.setQueryData`) for fast non-destructive actions (e.g. toggling `isActive` status). The UI reacts instantly while the request dispatches in the background.
- Implement **automatic retry with exponential backoff** (TanStack Query's `retry` + `retryDelay` options) to tolerate micro network outages before showing errors.
- **Zero toasts for form validation errors**: Validation errors MUST appear as inline messages anchored permanently below the respective field, using ARIA descriptions (`aria-describedby`) and supporting iconography (⚠️ icon). Never cover or obscure the input.
- **Empty States**: The table MUST show proactive empty states:
  - No data at all → friendly message ("No [items] yet"), context explanation, and a clear CTA button ("Add [Item]").
  - No search results → "No [items] match your search" with a "Clear filters" button.
  - Archived view empty → "No archived [items]".
- **Loading skeletons** — show animated skeleton rows during initial load, and a subtle spinner for background refetches.
- **Rollback mechanism** — if an optimistic update fails, revert the cache to the previous state and show an inline error notification (not a blocking modal).

### Design freedom

The examples in `examples/` are **starting points, not templates to copy**. You are expected to:

- Improve the layout, spacing, and visual hierarchy for the specific module's data.
- Add charts, stats cards, or summary panels if they make sense for the data.
- Use colour, badges, or icons meaningfully (e.g. status indicators, category colours).
- Compose and organise sub-components however best suits the module.
- Ensure the interface feels premium, responsive, and alive with micro-animations and hover effects.

The only constraints are the hard rules above. Everything else is a design decision — make it excellent.

---

## Step 8 — Internationalization

Update `src/lib/i18n/messages/en.json` and `es.json`. Use `resources/i18n-template.json` as the key structure reference.

### Key naming convention

- **PascalCase namespaces** — `Sources.title`, `AssetDocuments.fields.name` (not `sources.title`)
- **Common keys** — shared labels go under `Common.*` (e.g., `Common.showing`, `Common.previous`, `Common.next`, `Common.save`)
- **Module-specific keys** — under `[ModuleName].*` (e.g., `Sources.title`, `Sources.subtitle`, `Sources.fields.*`)

Required key groups:
- `[Module].title` — page title
- `[Module].subtitle` — subtitle with `{count}` interpolation (e.g., `"{count} registered sources"`)
- `[Module].description` — SEO meta description
- `[Module].emptyState` — empty state message
- `[Module].fields.*` — table column headers and form field labels
- `[Module].actions.*` — button labels (createNew, search, edit, view, archive, restore, delete)
- `[Module].drawer.*` — drawer titles, descriptions, field labels, placeholders
- `[Module].toast.*` — success messages (created, updated, archived, restored, deleted, batchDeleted, batchArchived, batchRestored)
- `[Module].status.*` — status labels (active, inactive, archived)
- `[Module].enums.*` — enum display values (e.g., `Sources.enums.On_chain`)
- `Common.showing` — `"Showing {from} to {to} of {total}"`
- `Common.previous` — `"Previous"`
- `Common.next` — `"Next"`

---

## Step 9 — Required shadcn/ui Components

Ensure the following shadcn/ui components are installed. If any are missing, install them:

```bash
npx shadcn@latest add sheet dialog dropdown-menu checkbox table badge button input label select separator card form command popover tooltip
```

Additional dependencies that MUST be present:
- `@tanstack/react-table` — table engine
- `@tanstack/react-query` — data fetching
- `react-hook-form` + `@hookform/resolvers` — form management
- `lucide-react` — icons
- `react-hot-toast` — success notifications only (default import: `import toast from "react-hot-toast"`)
- `next-intl` — i18n
- `nuqs` — URL state management (replaces `useSearchParams` + `useRouter().replace()`)

---

## Step 10 — Verification Checklist

Before marking the module complete, verify:

- [ ] TanStack Table renders with sortable columns and column visibility toggle
- [ ] `manualPagination: true` and `manualSorting: true` are set
- [ ] `pageCount: totalPages` is passed to `useReactTable`
- [ ] Sorting handler uses `Updater<SortingState>` type with optional chaining
- [ ] `// eslint-disable-next-line react-hooks/incompatible-library` above `useReactTable()`
- [ ] Sticky headers work on vertical scroll
- [ ] Zebra stripes are visible
- [ ] Page header shows title, subtitle with count, and Create button
- [ ] Pagination shows "Showing X to Y of Z" + Previous/Next buttons + page indicator
- [ ] Mobile card view activates below `md` breakpoint
- [ ] URL reflects current page, sort, search, and filter state (via `nuqs`)
- [ ] Page reload restores exact table state from URL
- [ ] Search input debounces at 300ms
- [ ] Side Drawer opens for Create (empty) and Update (pre-populated)
- [ ] Mobile form shows multi-step wizard
- [ ] Archive toggles `isArchived` status; record appears in "Archived" filter
- [ ] Restore from "Archived" view sets `isArchived: false`
- [ ] Delete (permanent) requires typing the record identifier
- [ ] Bulk selection shows sticky toolbar with count
- [ ] Bulk toolbar has overflow menu for destructive actions
- [ ] `aria-live="polite"` announces selection count changes
- [ ] Form validation errors appear inline below fields (no toasts)
- [ ] Empty states show appropriate messages and CTAs
- [ ] Loading skeletons display during data fetch
- [ ] All i18n keys are defined in both `en.json` and `es.json` with PascalCase namespaces
- [ ] Full keyboard navigation works (Tab, Enter, Escape)
- [ ] No `any` types — use `Prisma.xxxWhereInput` in routes and `Updater<SortingState>` in tables
- [ ] No duplicate imports from the same package
- [ ] `toast` imported as default: `import toast from "react-hot-toast"`
- [ ] API routes import `{ type Prisma } from "@prisma/client"`
