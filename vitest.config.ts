import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Standalone Vitest config: we intentionally do NOT reuse vite.config.ts so the
// Tamagui / Tailwind plugins aren't pulled into the test run. Current tests
// cover pure domain logic and run in a plain Node environment.
export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
});
