/**
 * Deterministic category → colour mapping for article tags.
 *
 * Article categories are free-form strings (e.g. "świadomość", "relacje"), so
 * rather than storing a colour per category we derive one from the label. A
 * stable hash picks from a small, hand-picked set of *light* tint/ink pairs,
 * all drawn from the Peryskop palette - so every tag is on-brand, readable, and
 * the same category always gets the same colour across the app.
 */

export interface CategoryColor {
    /** Soft background tint. */
    bg: string;
    /** Readable ink for the label on that tint. */
    text: string;
}

/**
 * Light tint + readable ink pairs, each a single palette family so the tag
 * reads as one swatch (see `PeryskopUI/src/tokens/palette.ts`).
 */
const CATEGORY_COLORS: readonly CategoryColor[] = [
    { bg: "#c1ede9", text: "#035c54" }, // primary: lightest → darker (teal)
    { bg: "#fff0d6", text: "#80612e" }, // secondary: lightest → darker (amber)
    { bg: "#ffe5e5", text: "#d3180c" }, // red: lightest → darkest (rose)
    { bg: "#ecfce5", text: "#05897d" }, // green tint → primary dark (mint)
    { bg: "#e3e5e5", text: "#404446" }, // sky: light → ink base (slate)
];

/** djb2 string hash → unsigned 32-bit, for stable, well-spread bucketing. */
function hash(input: string): number {
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
        h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
    }
    return h;
}

/** Pick the on-palette tag colour for a category label (case/space-insensitive). */
export function categoryColor(label: string): CategoryColor {
    const key = label.trim().toLowerCase();
    return CATEGORY_COLORS[hash(key) % CATEGORY_COLORS.length];
}
