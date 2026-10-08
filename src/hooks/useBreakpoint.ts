import { useEffect, useState } from "react";

function useMediaQueryMatch(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== "undefined") {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mql.addEventListener("change", handler);
        setMatches(mql.matches);
        return () => mql.removeEventListener("change", handler);
    }, [query]);

    return matches;
}

/** Replaces useMediaQuery(theme.breakpoints.down("md")) - true when < 900px */
export function useIsMobile(): boolean {
    return useMediaQueryMatch("(max-width: 899px)");
}

/** Replaces useMediaQuery(theme.breakpoints.down("sm")) - true when < 600px */
export function useIsSmallMobile(): boolean {
    return useMediaQueryMatch("(max-width: 599px)");
}

/** Replaces useMediaQuery("(max-width: 600px)") */
export function useIsCompact(): boolean {
    return useMediaQueryMatch("(max-width: 600px)");
}

/** Replaces useMediaQuery("(max-width: 1100px)") */
export function useIsTablet(): boolean {
    return useMediaQueryMatch("(max-width: 1100px)");
}
