const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      ecmaVersion: 13,
      sourceType: "module",

      parserOptions: {
        extraFileExtensions: [".cjs", ".mjs"],
      },

      globals: {
        ...globals.browser,
        $: "readonly",
        pf2e: "readonly",
        globalThis: "readonly",
        isEmpty: "readonly",
        libWrapper: "readonly",
        socketlib: "readonly",
        fromUuidSync: "readonly",
      },
    },

    extends: compat.extends(
      "eslint:recommended",
      "@typhonjs-fvtt/eslint-config-foundry.js/0.8.0",
      "plugin:prettier/recommended"
    ),

    plugins: {},

    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    files: ["./*.js", "./*.cjs", "./*.mjs"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  globalIgnores(["**/dist"]),
]);
