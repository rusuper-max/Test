// .eslintrc.cjs
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "src/data/portfolioManifest.ts", // auto-generated
    "scripts/*.cjs",                 // skripte ne lintujemo
  ],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
        ],
      },
    },
    {
      files: ["**/*.cjs", "**/*.js", "scripts/*.cjs"],
      rules: {
        // jer koristimo require() u CJS skriptama za manifest
        "@typescript-eslint/no-require-imports": "off",
      },
    },
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "react-hooks/exhaustive-deps": "warn",
  },
};