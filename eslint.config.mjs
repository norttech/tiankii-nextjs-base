import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Build outputs
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "node_modules/**",
    // Shadcn auto-generated files — do not lint these
    "src/components/ui/**",
    // Agents
    ".agents/**",
  ]),
  // Prettier integration (must be last to override formatting rules)
  eslintPluginPrettierRecommended,
  {
    rules: {
      // ─── Best Practices ───────────────────────────────────────────────
      "prefer-const": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-unused-expressions": ["warn", { allowShortCircuit: true, allowTernary: true }],

      // ─── TypeScript ───────────────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",

      // ─── React ────────────────────────────────────────────────────────
      "react/self-closing-comp": ["warn", { component: true, html: true }],
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],

      // ─── Imports ──────────────────────────────────────────────────────
      "import/no-default-export": "off", // Next.js pages require default exports
    },
  },
]);

export default eslintConfig;
