---
description: Bootstrap a new Next.js project using the custom base architecture
---

Please help me build a new Next.js application for "[App Name]".

---

## Ground Rules (apply for the entire session)

- Use **Yarn exclusively** for installing dependencies and running scripts.
  The one exception is `npx --yes` for one-off CLI tools that are not project
  dependencies (e.g. npm-check-updates).
- Never use `npm install` or `pnpm` for any command.
- All commands must be run in **PowerShell**.
- If any file is missing, any instruction is ambiguous, or anything fails —
  **stop immediately and report the full error output**. Never assume.
  Never invent patterns. Never attempt to fix failures silently.
- Do not proceed to the next step without explicit confirmation from me.

---

## Step 1 — Initialize the Project

> After each command, check for errors. If any command fails, stop and report
> the full error output — do not attempt to continue or fix it silently.

### 1.1 — Verify prerequisites

Run the following and report the output of each:
// turbo
- `git --version`
// turbo
- `node --version`
// turbo
- `yarn --version`

If any of these fail, stop and report. Do not continue until all three
are confirmed.

### 1.2 — Clone the repository

// turbo
- `git clone https://github.com/norttech/tiankii-nextjs-base .`

If the directory is not empty, stop and report — do not proceed.
If the clone fails for any reason, stop and report — do not attempt
any workaround.

### 1.3 — Upgrade dependencies

// turbo
- `npx --yes npm-check-updates -u`

### 1.4 — Install dependencies

// turbo
- `yarn install`

If this fails, report the full error. Common causes on Windows:
missing build tools (node-gyp / Python) or Node version mismatch.
Do not attempt to fix silently.

### 1.5 — Configure environment

// turbo
- `Copy-Item .env.example .env`
- Open `.env` and list every variable that still has a placeholder
  value (e.g. `YOUR_SECRET`, `localhost`, `changeme`).
- Do NOT create or use `.env.local` — all environment config lives
  in `.env` only.

**Stop here and wait for confirmation that the environment is fully
configured before running any database commands.**

### 1.6 — Set up local database and generate Prisma client

Only run these after receiving environment confirmation from me,
in this exact order:

1. `yarn prisma migrate dev --name init` — creates and applies the
   initial migration against the local Postgres database defined in `.env`.
2. `yarn db:generate` — generates the Prisma client from the migrated schema.

Report the full output of steps 1 and 2.

**Stop and wait for my confirmation before continuing to Step 2.**

---

## Step 2 — Understand the Architecture

Read each of the following files **completely**:

- `README.md`
- `.agents/skills/create-module/SKILL.md`
- Every file inside `.agents/skills/create-module/examples/`

After reading, respond with:
1. A brief summary of the stack and folder structure
2. The key rules for building a module (API patterns, schema conventions,
   soft delete, audit fields, guard usage, etc.)
3. Any questions or ambiguities you found in the documentation

Every module built in this project — now and in the future — must
strictly follow the patterns defined in those files. Do not invent
new patterns or deviate from the examples.

**Wait for my confirmation before continuing to Step 3.**

---

## Step 3 — Define the Application

Before writing any code, we will define the full shape of the application.
Read the specifications below and then respond with a structured summary
of what you understood. Wait for my confirmation before touching any file.

### 3.1 — Branding & Theme

- App name: `[App Name]`
- Primary color: `[hex or Tailwind token]`
- Secondary color: `[hex or Tailwind token]`
- Font: `[font name or "use base default"]`
- Logo: `[path to asset or "none yet"]`
- Dark mode: `[yes / no / system default]`

### 3.2 — Dashboard Layout & Sidebar

- Layout type: `[sidebar left / top nav / hybrid]`
- Sidebar style: `[collapsible / fixed / icon-only on collapse]`
- Sidebar sections and items:

Section: "[Section Name]"

[Label] → /[route]
[Label] → /[route]


Section: "[Section Name]"

[Label] → /[route]

- Header content: `[app name / logo / user menu / notifications / etc.]`
- Footer: `[yes / no — content if yes]`

### 3.3 — Navigation & Routes

List all top-level routes and their purpose:
/dashboard         — main overview
/[module]          — [description]
/[module]/[id]     — [description]
/[module]/create   — [description]

### 3.4 — Modules & Relationships

List every module the app will contain. For each one, describe its
fields and its relationship to other modules.

Module: [ModuleName]
Fields:
name         — String, required
description  — String, optional
[field]      — [type], [required/optional]

Relations:
belongs to [OtherModule] via [foreignKey]
has many [OtherModule]

Module: [ModuleName]
...

**After summarizing your understanding, wait for my confirmation
before writing any code.**

---

## Step 4 — Build the Modules

Build one module at a time following the create-module SKILL.md exactly.
After completing each module, summarize what was created and
wait for my confirmation before starting the next.

> The standard audit fields (createdAt, updatedAt, createdBy, updatedBy,
> deletedAt, deletedBy, isActive) are added automatically by the skill —
> do not add them again.

For each module use this structure:

### Module: `[ModuleName]`

**Prisma fields:**
- `name` — String, required
- `[field]` — [type], [required/optional]

**Active locales:** `en`, `es` *(update both message files)*

**List page:**
- Columns: …
- Filters: …
- Default sort: …

**View page:**
- Sections/fields to display: …

**Create / Edit form:**
- Fields and any special input types (select, date picker, etc.): …
- Validation rules beyond the schema defaults: …

---

## Step 5 — Verify

Once all modules are built, run in this order:
1. `yarn prisma migrate dev` — confirm all migrations apply cleanly
2. `yarn build` — confirm no TypeScript or build errors

Report the full output of steps 1 and 2. If there are
any errors in any step, fix them and re-run before reporting back.
