import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default [
    {
        // Build output, dependencies, the Tamagui compiler cache and test coverage.
        ignores: ["dist/**/*", "node_modules/**/*", ".tamagui/**/*", "coverage/**/*"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "unused-imports": unusedImportsPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            "prettier/prettier": "error",
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-unused-expressions": "off",
            "react/prop-types": "off",
            // A conditional hook call breaks React's hook order and crashes at runtime.
            "react-hooks/rules-of-hooks": "error",
            // Advisory: some existing effects omit dependencies on purpose.
            "react-hooks/exhaustive-deps": "warn",
            // Auto-fixable, so lint-staged removes unused imports on commit.
            "unused-imports/no-unused-imports": "error",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        // Node tooling scripts (not part of the browser bundle).
        files: ["scripts/**/*.js", "tests/**/*.js"],
        languageOptions: {
            globals: {
                process: "readonly",
                console: "readonly",
            },
        },
    },
];
