import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type must be one of the allowed types
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code
        "refactor", // A code change that neither fixes a bug nor adds a feature
        "perf", // A code change that improves performance
        "test", // Adding missing tests or correcting existing tests
        "build", // Changes that affect the build system or external dependencies
        "ci", // Changes to CI configuration files and scripts
        "chore", // Other changes that don't modify src or test files
        "revert", // Reverts a previous commit
      ],
    ],
    // Type cannot be empty
    "type-empty": [2, "never"],
    // Scope must be lowercase if provided
    "scope-case": [2, "always", "lower-case"],
    // Subject cannot be empty
    "subject-empty": [2, "never"],
    // Subject must be in sentence case (e.g. "Fix a bug.")
    "subject-case": [2, "always", "sentence-case"],
    // Allow subject to end with a period
    "subject-full-stop": [0, "always", "."],
    // Header max length (type + scope + subject)
    "header-max-length": [2, "always", 150],
    // Body must have a blank line before it
    "body-leading-blank": [1, "always"],
    // Footer must have a blank line before it
    "footer-leading-blank": [1, "always"],
  },
};

export default config;
