---
description: Scaffolds a full enterprise-grade CRUD module including Prisma model, Zod schemas, API routes, and UI pages with TanStack Table, Side Drawer, Bulk Actions, Optimistic UI, and Mobile Card View
---

# Create Module Skill — Enterprise-Grade CRUD

This skill defines the canonical workflow for scaffolding a new feature module. Every module MUST implement full CRUD with **enterprise-grade UX**. Backend rules are **strict and non-negotiable**. UI rules define required behaviour, patterns, and component architecture — the visual polish and exact styling are yours to make excellent.

You are acting as a **Senior Frontend Architect & UX Expert** specialising in corporate SaaS systems and high-data-density B2B applications.

**Reference examples** (in `examples/`):

| File | Purpose |
|------|---------|
| `category.schema.ts` | Zod schemas (Create, Update, Query) |
| `category.route.list.ts` | List + Create + Batch Delete API route |
| `category.route.single.ts` | Get / Update / Delete API route |
| `category.page.tsx` | Server Component — list page |
| `category.view.page.tsx` | Server Component — view page |
| `category.data-table.tsx` | TanStack Table + column visibility + sticky headers + zebra stripes + mobile card view |
| `category.columns.tsx` | Column definitions with select, sortable headers, row actions |
| `category.drawer.tsx` | Side Drawer (Sheet) for Create/Update with multi-step mobile support |
| `category.bulk-toolbar.tsx` | Sticky Bulk Action Toolbar with aria-live + overflow menu |
| `category.delete-dialog.tsx` | Permanent delete confirmation with ID transcription friction |

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

---

## Step 6 — UI Pages & Components

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
    └── use[Module]UrlState.ts            ← URL state management
```

### Hard rules (non-negotiable)

- **Server Components for Pages** — `page.tsx` files MUST NOT have `"use client"`. They should handle metadata, static SEO content, and pass necessary props to client components.
- **Client Components for UI** — All interactivity, `useQuery`, `useMutation`, and hooks MUST live in client components under `src/components/modules/[module]/`.
- **Data fetching** — `useQuery` / `useMutation` from `@tanstack/react-query` inside client components. All calls go through the API routes created in Step 5.
- **Navigation** — always import `Link`, `useRouter`, `redirect` from `@/lib/i18n/routing`.
- **Toasts** — `import { toast } from "react-hot-toast"` for success feedback ONLY. **Zero toasts for validation errors** — inline field-level errors only.
- **i18n** — use `getTranslations` (server) or `useTranslations` (client) from `next-intl`.
- **Forms** — `react-hook-form` + `@hookform/resolvers/zod` + Zod schemas. Show inline field-level validation errors anchored below the field with ARIA descriptions and iconography.
- **Type safety** — Every page component and `generateMetadata` function MUST use the global `PageProps<"/route-literal">` helper.
- **Async Props** — In Next.js 16+, `params` and `searchParams` are Promises. You MUST `await` them before access (e.g., `const { id } = await props.params`).
- **Response shape** — list endpoints return `PaginatedResponse<T>`. Batch operations (like delete) send an array of IDs.

### 1. Enterprise Data Table (Read Operation)

The table MUST implement:

- **TanStack Table integration** — Use `@tanstack/react-table` with `useReactTable`, `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`.
- **Sticky headers** — Apply `sticky top-0 z-10 bg-background` to `<thead>` so column headers remain visible during vertical scroll.
- **Zebra stripes** — Apply moderate alternating row backgrounds (`even:bg-muted/30`) for horizontal scan readability.
- **Column visibility** — Use TanStack Table's `columnVisibility` state + a dropdown toggle component so users can show/hide/reorganise columns (e.g. HR needs 30 columns, a manager needs 5).
- **Semantic HTML** — Ensure `role="table"`, `role="rowgroup"`, `scope="col"` attributes if using custom `<div>`-based layouts. Prefer native `<table>` elements.
- **Keyboard navigation** — Full Tab/Enter/Escape support across all interactive elements.

### 2. Mobile Responsive — Card View

For screens `< md` breakpoint:

- Transform the data table into a **Card View** that stacks header-value pairs vertically.
- Each card MUST show: primary label (e.g. name), secondary info, status badge, and an action menu.
- Use `useMediaQuery` or CSS `hidden md:block` / `block md:hidden` patterns.
- Cards must include the checkbox for selection, supporting bulk actions on mobile.

### 3. Analytical Memory Persistence — URL Sync

- **All table state must persist in URL query params**: `page`, `pageSize`, `sort`, `search`, and any active filters.
- Use `useSearchParams` + `useRouter().replace()` to sync state bidirectionally.
- On page reload or shared link, the table MUST rehydrate its exact state from the URL.
- Apply **debouncing** (300ms) on text search inputs to avoid excessive URL mutations and network requests.
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

## Step 7 — Internationalization

Update `src/lib/i18n/messages/en.json` and `es.json`. Use `resources/i18n-template.json` as the key structure reference.

Required key groups:
- Page title & breadcrumb labels
- Table column headers
- Form field labels, placeholders, and hint text
- Button labels (Save, Cancel, Delete, Archive, Restore, Edit, Duplicate, etc.)
- Success and error toast messages
- Confirmation dialog text (including hard-delete challenge prompt)
- Empty state and loading messages
- Bulk action toolbar labels
- Multi-step form step labels
- Status labels (Active, Inactive, Archived)
- Column visibility dropdown labels

---

## Step 8 — Required shadcn/ui Components

Ensure the following shadcn/ui components are installed. If any are missing, install them:

```bash
npx shadcn@latest add sheet dialog dropdown-menu checkbox table badge button input label select separator card form command popover tooltip
```

Additional dependencies that MUST be present:
- `@tanstack/react-table` — table engine
- `@tanstack/react-query` — data fetching
- `react-hook-form` + `@hookform/resolvers` — form management
- `lucide-react` — icons
- `react-hot-toast` — success notifications only
- `next-intl` — i18n

---

## Step 9 — Verification Checklist

Before marking the module complete, verify:

- [ ] TanStack Table renders with sortable columns and column visibility toggle
- [ ] Sticky headers work on vertical scroll
- [ ] Zebra stripes are visible
- [ ] Mobile card view activates below `md` breakpoint
- [ ] URL reflects current page, sort, search, and filter state
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
- [ ] Optimistic toggle updates UI instantly
- [ ] Failed optimistic update rolls back cache
- [ ] Form validation errors appear inline below fields (no toasts)
- [ ] Empty states show appropriate messages and CTAs
- [ ] Loading skeletons display during data fetch
- [ ] All i18n keys are defined in both `en.json` and `es.json`
- [ ] Full keyboard navigation works (Tab, Enter, Escape)
