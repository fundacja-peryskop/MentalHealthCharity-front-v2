import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function getStoredTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") return stored;
    } catch {
        // localStorage unavailable
    }
    // The UI exposes no theme switch - the product is light-only by design - so
    // default to light rather than following the OS ("system").
    return "light";
}

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
}

// External store for theme state
let currentTheme: Theme = getStoredTheme();
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function getSnapshot(): Theme {
    return currentTheme;
}

function setThemeValue(theme: Theme) {
    currentTheme = theme;
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // localStorage unavailable
    }
    applyTheme(theme);
    listeners.forEach((l) => l());
}

// Apply on load
if (typeof document !== "undefined") {
    applyTheme(currentTheme);
}

export function useTheme() {
    const theme = useSyncExternalStore(subscribe, getSnapshot);

    const resolvedTheme = useMemo<"light" | "dark">(() => {
        return theme === "system" ? getSystemTheme() : theme;
    }, [theme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeValue(t);
    }, []);

    // Listen for system theme changes when in "system" mode
    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => applyTheme("system");
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    return { theme, setTheme, resolvedTheme };
}
