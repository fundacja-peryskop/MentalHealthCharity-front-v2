import { PeryskopProvider } from "@fundacja-peryskop/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./locales/i18n.ts";
import "./main.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <PeryskopProvider defaultTheme="light">
            <App />
        </PeryskopProvider>
    </StrictMode>
);
