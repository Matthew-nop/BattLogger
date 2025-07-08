import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginJsonc from "eslint-plugin-jsonc";

export default [
  {
    ignores: ["dist/"],
  },
  pluginJs.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
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
    files: ["jest.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-undef": "error",
    }
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