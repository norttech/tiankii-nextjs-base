import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import-x";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  // ─────────────────────────────────────────────────────────────────────────
  // GLOBAL IGNORES
  // ─────────────────────────────────────────────────────────────────────────
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "node_modules/**",
    ".git/**",
    "prisma/generated/**",
    "src/components/ui/**",
    ".agents/**",
    "coverage/**",
  ]),

  // ─────────────────────────────────────────────────────────────────────────
  // BASE CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: ["./tsconfig.json"],
      },
      globals: {
        React: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
      "import-x": importPlugin,
    },
    rules: {
      // ─── ESLint Core ──────────────────────────────────────────────────
      ...js.configs.recommended.rules,

      // ─── Best Practices ───────────────────────────────────────────────
      "prefer-const": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-unused-expressions": ["warn", { allowShortCircuit: true, allowTernary: true }],
      "no-var": "error",
      "object-shorthand": ["warn", "always"],
      "prefer-template": "warn",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-undef": "off", // disabled because of global.d.ts

      // ─── TypeScript ───────────────────────────────────────────────────
      ...tseslint.configs.recommendedTypeChecked.rules,
      ...tseslint.configs.stylisticTypeChecked.rules,

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksConditionals: true,
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",

      // ─── React Hooks ──────────────────────────────────────────────────
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ─── Next.js ──────────────────────────────────────────────────────
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",

      // ─── Imports ───────────────────────────────────────────────────────
      "import-x/no-default-export": "off",
      "import-x/no-anonymous-default-export": "off",
      "import-x/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // REACT (eslint-react — ESLint 10 compatible)
  // ─────────────────────────────────────────────────────────────────────────
  {
    files: ["**/*.{jsx,tsx}"],
    ...eslintReact.configs["recommended-type-checked"],
    rules: {
      ...eslintReact.configs["recommended-type-checked"].rules,
      "@eslint-react/no-useless-fragment": "warn",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TypeScript Files Only
  // ─────────────────────────────────────────────────────────────────────────
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "warn",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRETTIER (must be last)
  // ─────────────────────────────────────────────────────────────────────────
  eslintConfigPrettier,
]);

export default eslintConfig;
