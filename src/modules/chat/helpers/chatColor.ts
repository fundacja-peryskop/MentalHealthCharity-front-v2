/**
 * Deterministic colour + initials for a chat, derived from its name.
 *
 * Chats are named rooms (a mentee's name, a group title, a support thread), so
 * instead of storing a colour per chat we derive a stable one from the name. A
 * hash picks from a small set of on-brand tint/ink pairs - every avatar is
 * readable, light-theme friendly, and the *same* chat always gets the *same*
 * colour regardless of session, device or render order.
 *
 * This lives in the chat domain module (not a single component) on purpose: the
 * colour will also be used outside the chat view in the future (notifications,
 * dashboards, mentions), so it is exported as a plain, side-effect-free function.
 *
 * All colours are Peryskop palette values (see
 * `@fundacja-peryskop/ui` → `tokens/palette`). We keep raw hex here rather than
 * `$token` strings so the result is usable in any context - inline styles, SVG,
 * canvas, email - not only inside a Tamagui theme.
 */

export interface ChatColor {
    /** Soft background tint for the avatar circle. */
    bg: string;
    /** Readable ink for the initials on that tint. */
    text: string;
    /** Slightly stronger tone for a subtle ring / selected accent. */
    border: string;
}

/**
 * Light tint + readable ink pairs, each inside a single palette family so the
 * avatar reads as one calm swatch. Chosen for strong contrast (dark ink on a
 * light tint) so initials stay legible for older users (WCAG-friendly), and
 * spread across distinct hues so neighbouring chats look different.
 */
const CHAT_COLORS: readonly ChatColor[] = [
    { bg: "#c1ede9", text: "#035c54", border: "#83dbd3" }, // teal   (primary)
    { bg: "#fff0d6", text: "#80612e", border: "#ffe0ae" }, // amber  (secondary)
    { bg: "#ffe5e5", text: "#d3180c", border: "#ff9898" }, // rose   (red)
    { bg: "#ecfce5", text: "#05897d", border: "#7dde86" }, // mint   (green)
    { bg: "#e3e5e5", text: "#303437", border: "#cdcfd0" }, // slate  (sky/ink)
    { bg: "#83dbd3", text: "#022e2a", border: "#44c9bd" }, // deep teal (primary)
];

/**
 * djb2 string hash → unsigned 32-bit. Stable and well-spread across buckets,
 * and deterministic across devices: it reads UTF-16 code units, which are the
 * same for a given JS string everywhere (so Polish letters and emoji hash
 * identically on every platform).
 */
function hash(input: string): number {
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
        h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
    }
    return h;
}

/** Normalise a name so trivial differences (case, surrounding spaces) share a colour. */
function normalize(name: string): string {
    return (name ?? "").trim().toLocaleLowerCase("pl-PL");
}

/**
 * Pick the on-palette colour for a chat name. Always returns a valid colour -
 * empty names, whitespace, special characters and Polish letters are all
 * handled (they simply hash to one of the buckets).
 */
export function chatColor(name: string): ChatColor {
    const key = normalize(name);
    return CHAT_COLORS[hash(key) % CHAT_COLORS.length];
}

/**
 * Up to two uppercase initials for a chat avatar ("Jan Kowalski" → "JK",
 * "Wsparcie" → "W"). Falls back to "?" when there is nothing to show, so the
 * avatar never renders blank. Uppercasing is locale-aware for Polish.
 */
export function chatInitials(name: string): string {
    const words = (name ?? "").trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "?";

    const letters =
        words.length === 1
            ? words[0].slice(0, 2) // single word → first two letters
            : words[0][0] + words[words.length - 1][0]; // first + last word initial

    return letters.toLocaleUpperCase("pl-PL");
}
