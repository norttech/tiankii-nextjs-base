#!/bin/bash
# Description: Standard scaffolding for a new enterprise-grade CRUD module in tiankii-next-base
# Usage: ./scaffold.sh <module_name_lowercase>
#
# Creates the full directory structure for:
# - API routes (list, single record)
# - Zod schemas
# - UI pages (localized with [locale])
# - Client components (DataTable, Columns, Drawer, BulkToolbar, DeleteDialog, CardView, View)
# - Custom hooks (queries, mutations, URL state)

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Error: Please provide a module name (lowercase, plural preferred)."
    exit 1
fi

echo "🚀 Scaffolding enterprise-grade module: $MODULE_NAME..."

# 1. API Structure
mkdir -p "src/app/api/$MODULE_NAME/[id]"
echo "✅ Created API folders: src/app/api/$MODULE_NAME"

# 2. Schema Structure
mkdir -p "src/lib/schemas/$MODULE_NAME"
echo "✅ Created Schema folder: src/lib/schemas/$MODULE_NAME"

# 3. UI Pages (Localized)
mkdir -p "src/app/[locale]/$MODULE_NAME/[id]"
echo "✅ Created UI page folders: src/app/[locale]/$MODULE_NAME"

# 4. Client Components
mkdir -p "src/components/modules/$MODULE_NAME"
echo "✅ Created Components folder: src/components/modules/$MODULE_NAME"

# 5. Custom Hooks
mkdir -p "src/lib/hooks/$MODULE_NAME"
echo "✅ Created Hooks folder: src/lib/hooks/$MODULE_NAME"

echo ""
echo "✨ Enterprise structure for '$MODULE_NAME' is ready!"
echo ""
echo "📁 Structure created:"
echo "   src/app/api/$MODULE_NAME/          — API routes (route.ts + [id]/route.ts)"
echo "   src/app/api/$MODULE_NAME/[id]/     — Single record API route"
echo "   src/lib/schemas/$MODULE_NAME/      — Zod schemas"
echo "   src/app/[locale]/$MODULE_NAME/     — List page"
echo "   src/app/[locale]/$MODULE_NAME/[id] — View page"
echo "   src/components/modules/$MODULE_NAME/ — Client components:"
echo "     ├── DataTable.tsx                — TanStack Table orchestrator"
echo "     ├── Columns.tsx                  — Column definitions"
echo "     ├── Drawer.tsx                   — Side Drawer (Create/Update)"
echo "     ├── BulkToolbar.tsx              — Sticky bulk actions toolbar"
echo "     ├── DeleteDialog.tsx             — Hard-delete confirmation"
echo "     ├── CardView.tsx                 — Mobile card layout"
echo "     └── View.tsx                     — Single record view"
echo "   src/lib/hooks/$MODULE_NAME/        — Custom hooks"
echo ""
echo "Now implement the code according to SKILL.md rules."
