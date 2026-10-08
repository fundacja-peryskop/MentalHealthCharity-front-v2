import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["dist/**/*", "node_modules/**/*"],
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
            prettier: prettierPlugin,
        },
        rules: {
            "prettier/prettier": "error",
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-unused-expressions": "off",
            "react/prop-types": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        // Node tooling scripts (not part of the browser bundle).
        files: ["scripts/**/*.js"],
        languageOptions: {
            globals: {
                process: "readonly",
                console: "readonly",
            },
        },
    },
];
