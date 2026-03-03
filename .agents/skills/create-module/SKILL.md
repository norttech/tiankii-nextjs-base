---
description: Scaffolds a full module including Prisma model, Zod schemas, API routes, and UI pages
---

# Create Module Skill

This skill defines the canonical workflow for scaffolding a new feature module. Every module MUST implement full CRUD and follow these patterns exactly.

**Reference implementation:** see `examples/` inside this skill folder for complete, working code:
- `category.schema.ts` — Zod schemas (Create, Update, Query)
- `category.route.list.ts` — `GET` list + `POST` create
- `category.route.single.ts` — `GET` / `PATCH` / `DELETE` by ID

---

## Step 1 — Gather Requirements

Before writing any code:

1. Ask the user for the **module name** (e.g. `ProductCategory`).
   - PascalCase for types/schemas: `ProductCategory`
   - kebab-case for file paths and URLs: `product-category`
   - camelCase for Prisma model: `productCategory`
2. Ask for the **model fields**: name, type, required/optional, unique constraints.
3. Ask for any **module-specific query filters** to extend the base schema.
4. Confirm with the user before generating code.

---

## Step 2 — Scaffold Directory Structure

// turbo
Run the scaffold script to create all directories and placeholder files:

```bash
bash .agents/skills/create-module/scripts/scaffold.sh <module_name>
```

---

## Step 3 — Prisma Model

Add the model to `prisma/schema.prisma`.

Every model MUST include the following audit fields — no exceptions:

```prisma
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt
createdBy   String?
updatedBy   String?
deletedAt   DateTime?
deletedBy   String?
isActive    Boolean   @default(true)
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

See `examples/category.schema.ts` for the full reference. Create three schemas:

- **Create** — omit all auto-generated/audit fields (`id`, timestamps, audit strings, `isActive`).
- **Update** — same as Create but fully `.partial()`. No immutable fields.
- **Query** — MUST extend `QueryBaseSchema` from `@/lib/schemas/common`, which provides:
  - `page`, `pageSize` (0 = no limit / fetch all), `search`, and multi-field `sort` (`+name,-createdAt`).
  - Add module-specific filters as optional fields on top.

Export inferred types for all three schemas.

---

## Step 5 — API Routes

See `examples/category.route.list.ts` and `examples/category.route.single.ts` for the full reference.

### Critical Rules

1. **`withGuards` is mandatory** for every handler — import from `@/middlewares/api/with-guards`. **Never use `try/catch`** — all errors are caught and handled centrally by `withGuards` → `handleApiError`.
2. **Body validation via `withGuards`** — pass `schema` in options. `ctx.body` will be typed as `z.infer<typeof Schema>` automatically. Do not call `.parse()` manually in the handler.
3. **Dynamic params typing** — type the second argument as `RouteContext<"/api/[module]/[id]">`. This is **globally available** after `next build` / `next typegen`. **Do not import it.**
4. **Audit fields** — always inject `user.id` from `ctx.user`:
   - Create → `createdBy: user.id`
   - Update → `updatedBy: user.id`
   - Delete → `deletedBy: user.id`
5. **Soft delete only** — never hard-delete. Set `isActive: false`, `deletedAt: new Date()`.
6. **Default list filtering** — always include `{ isActive: true, deletedAt: null }` in list `where` clauses.
7. **Response format**:
   - List      → `createPaginatedNextResponse(data, total, { page, pageSize })` from `@/lib/utils/pagination`
   - Created   → `NextResponse.json(record, { status: 201 })`
   - Single    → `NextResponse.json(record)` — **no `{ data }` envelope**
   - Not found → `throw new NotFoundError()` from `@/lib/utils/error-handler`

### Files to create

- `src/app/api/[module]/route.ts` — `GET` (list), `POST` (create)
- `src/app/api/[module]/[id]/route.ts` — `GET`, `PATCH`, `DELETE`

---

## Step 6 — UI Pages & Components

Create pages under `src/app/[locale]/[module]/`. Use `react-hook-form` + `@hookform/resolvers/zod` with the Zod schemas from Step 4.

- **List page** (`page.tsx`) — data table with pagination, sorting, search. Global **"Add New"** button. Per-row **Actions** dropdown: View, Edit, Duplicate, Delete (with confirmation).
- **View page** (`[id]/page.tsx`) — all fields displayed. Top action buttons: Edit, Duplicate, Print, Delete.
- **Edit form** (`[id]/edit/page.tsx`) — pre-filled form, inline validation errors.
- **Create form** (`create/page.tsx`) — empty form, client-side Zod validation.

---

## Step 7 — Internationalization

Update `messages/en.json` and `messages/es.json`. Use `resources/i18n-template.json` as the structure reference.

Include keys for: page title, breadcrumbs, table column headers, form field labels and placeholders, button labels, and success/error toast messages.
