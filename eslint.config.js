import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginJsonc from "eslint-plugin-jsonc";

export default [
  {
    ignores: ["out/"],
  },
  pluginJs.configs.recommended,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn", 
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "require-yield": "off",
      "no-self-assign": "off",
      "no-empty": "off",
      "no-cond-assign": "off",
      "indent": ["warn", "tab"]
    }
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    files: ["data/**/*.json", "data/**/*.jsonc"],
    plugins: {
      jsonc: pluginJsonc,
    },
    rules: {
      "jsonc/no-dupe-keys": "error",
      "jsonc/sort-keys": "warn",
      "jsonc/indent": ["warn", "tab"]
    },
  },
];