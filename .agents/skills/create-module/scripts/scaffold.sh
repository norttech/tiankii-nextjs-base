#!/bin/bash
# Description: Standard scaffolding for a new module in tiankii-next-base
# Usage: ./scaffold.sh <module_name_lowercase>

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Error: Please provide a module name (lowercase, plural preferred)."
    exit 1
fi

echo "🚀 Scaffolding module: $MODULE_NAME..."

# 1. API Structure
mkdir -p "src/app/api/$MODULE_NAME/[id]"
echo "✅ Created API folders: src/app/api/$MODULE_NAME"

# 2. Schema Structure
mkdir -p "src/lib/schemas/$MODULE_NAME"
echo "✅ Created Schema folder: src/lib/schemas/$MODULE_NAME"

# 3. UI Structure (Localized)
# We assume the user creates it under [locale], so we use a placeholder or assume 'en'
# Actually, we create the structure under [locale] generally:
mkdir -p "src/app/[locale]/$MODULE_NAME/create"
mkdir -p "src/app/[locale]/$MODULE_NAME/[id]/edit"
echo "✅ Created UI folders: src/app/[locale]/$MODULE_NAME"

echo "✨ Base structure for '$MODULE_NAME' is ready! Now implement the code according to SKILL.md rules."
