import { PeryskopProvider } from "@fundacja-peryskop/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./locales/i18n.ts";
import "./main.css";

// The app is light-only. Earlier versions let people pick a dark theme, saved
// as localStorage "theme" and applied as a `dark` class on <html>; with the
// design system's light surfaces that renders light text on light
// backgrounds. Drop the legacy preference and make sure the class is gone.
try {
    localStorage.removeItem("theme");
} catch {
    // Storage unavailable (e.g. privacy mode) - nothing was saved then either.
}
document.documentElement.classList.remove("dark");

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <PeryskopProvider defaultTheme="light">
            <App />
        </PeryskopProvider>
    </StrictMode>
);
