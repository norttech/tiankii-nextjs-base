---
description: Scaffolds a full module including Prisma model, schemas, API routes, and Pages
---

# Create Module Workflow

This skill defines a standardized workflow for scaffolding new features/modules in the application. As this is a base-project, it is **CRITICAL** that every module generated strictly follows these rules and implements complete CRUD functionality dynamically and robustly.

## 1. Gather Requirements

- Ask the user to define the fields and structure of the new model (e.g., prompt for a structure parameter or definition) before proceeding.
- Validate the requirements with the user before generating code.

## 2. Scaffolding (Automated)

- **// turbo**
  Run the scaffolding script to create the directory structure:
  `bash .agents/skills/create-module/scripts/scaffold.sh <module_name>`
- Review the **`examples/`** folder in this skill for the reference implementation of models, schemas, and pages.
- Use **`resources/i18n-template.json`** as a base for adding new strings to `messages/en.json`.

## 3. Prisma Model Definition

- **MANDATORY**: Every model must include the following standard audit fields:
  ```prisma
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?
  updatedBy String?
  deletedAt DateTime?
  deletedBy String?
  isActive  Boolean  @default(true)
  ```
- **// turbo**
  Run `yarn db:generate` to generate the Prisma client.
- **// turbo**
  Run `yarn db:migrate` to run outstanding migrations. Note: you may need to prompt for a migration name or let Prisma prompt you interactively if configured.

## 3. Schema & Validation

- Create a validation schema (using Zod) in `src/lib/schemas/[module]/[module].schema.ts`.
- Include specific schemas for:
  - **Create**: Omit auto-generated audit fields (`createdAt`, `updatedAt`, `deletedAt`, etc.).
  - **Update**: Make all fields optional, excluding immutable audit fields.
  - **Query**: MUST extend `QueryBaseSchema` imported from `src/lib/schemas/common` (which provides `page`, `pageSize`, `search`, and a `sort` parser supporting multiple fields like `+name,-createdAt`). Add module-specific filters if needed.

## 4. API Implementation

- Implement robust Next.js App Router API endpoints enforcing the audit fields (injecting user IDs from the session).
- **CRITICAL**: Return standardized JSON responses for all endpoints. For paginated List (`GET`) endpoints, you MUST import and return `createPaginatedNextResponse` from `@/lib/utils/pagination`. For single records, use `{ data, error }`. Provide standard HTTP status codes (400, 404, 500).
- `src/app/api/[module]/route.ts`:
  - `GET` (List): MUST implement pagination, sorting, and search filtering. MUST filter out soft-deleted records (`deletedAt: null` AND `isActive: true`) by default. MUST use `createPaginatedNextResponse(data, total, { page, pageSize })` from `@/lib/utils/pagination` to format and return the data.
  - `POST` (Create): Validate payload with Zod schemas, populate `createdBy`.
- `src/app/api/[module]/[id]/route.ts`:
  - `GET` (Read): Retrieve single record.
  - `PATCH`/`PUT` (Update): Validate payload with Zod schemas, populate `updatedBy`.
  - `DELETE` (Soft delete): Update `deletedAt` with current date, `isActive` to `false`, and populate `deletedBy`.
- Implement an endpoint or server action for a custom "**Duplicate/Copy**" action that takes an ID, duplicates the data (omitting unique constraints where needed), and creates a new record.

## 5. UI Pages & Components

- Create Next.js pages under `src/app/[locale]/[module]/...`.
- Ensure you utilize libraries like `react-hook-form` and `@hookform/resolvers/zod` with the backend schemas to validate forms seamlessly.
- **List Page (`src/app/[locale]/[module]/page.tsx`)**:
  - MUST include a Data Table representing the list of records.
  - MUST include a global action button: "**Add New [Module]**" (routes to creation form or opens modal).
  - The table MUST support pagination, sorting, and filtering.
  - Every row in the Data Table MUST contain an **Action column/dropdown** with the following actions:
    - **View**: Navigates to the details page.
    - **Edit**: Navigates to the edit page (or opens edit modal).
    - **Duplicate/Copy**: Triggers the duplication endpoint.
    - **Delete**: Prompts for confirmation and triggers the soft-delete API.
- **View Page (`src/app/[locale]/[module]/[id]/page.tsx`)**:
  - Displays all details of the selected record in a visually structured format.
  - MUST include action buttons globally at the top to: **Edit, Duplicate/Copy, Print, and Delete**.
- **Edit Form (`src/app/[locale]/[module]/[id]/edit/page.tsx` or modal)**:
  - Form pre-filled with the existing record's data. Contains validation errors.
- **Create Form (`src/app/[locale]/[module]/create/page.tsx` or modal)**:
  - Clean form with client-side validation using the Zod schemas created in Step 3.

## 6. Internationalization (i18n)

- Automatically update the project's translation files (e.g., `messages/en.json` or equivalent) with the new module's strings:
  - Page titles, button labels, table headers, form labels, and standard success/error toast messages.
