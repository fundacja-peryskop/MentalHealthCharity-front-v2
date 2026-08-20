import { useTheme } from "@fundacja-peryskop/ui";

/**
 * Resolves design-system colour tokens to concrete values for use with
 * non-Tamagui elements (e.g. `lucide-react` icons, which take a plain CSS
 * colour string). Keeps icon colours on the DS palette instead of hardcoding.
 */
export function useIconColor() {
    const theme = useTheme();
    const read = (value?: { val?: unknown; get?: () => unknown }): string | undefined => {
        if (!value) return undefined;
        // `.get()` is the platform-aware accessor (a CSS var string on web);
        // `.val` is the raw resolved value. Either works as a CSS colour.
        const resolved = typeof value.get === "function" ? value.get() : value.val;
        return resolved as string | undefined;
    };

    return {
        muted: read(theme.colorMuted),
        color: read(theme.color),
        primary: read(theme.primary),
        danger: read(theme.danger),
        secondary: read(theme.secondary),
        inverse: read(theme.colorInverse),
    };
}
