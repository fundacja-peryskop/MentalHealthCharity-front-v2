import { tamaguiPlugin } from "@tamagui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fixReactVirtualized from "esbuild-plugin-react-virtualized";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        esbuildOptions: {
            plugins: [fixReactVirtualized],
        },
    },
    plugins: [
        tailwindcss(),
        react(),
        // Wires the Peryskop design system (Tamagui) into the app: loads the DS
        // Tamagui config and aliases react-native -> react-native-web on the web.
        tamaguiPlugin({
            config: "./node_modules/@fundacja-peryskop/ui/src/config/tamagui.config.ts",
            components: ["tamagui", "@fundacja-peryskop/ui"],
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        port: 3000,
    },
});
