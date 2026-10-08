/**
 * §8 - decorative "highlight marker" icon for the topics grid. Renders the
 * shared `deco_marker-highlight.svg` as a CSS mask so a single asset can be
 * recoloured per topic from the Peryskop brand palette. Purely decorative (the
 * adjacent label carries the meaning), so it is `aria-hidden`.
 */

import marker from "@/assets/static/homepage/deco_marker-highlight.svg";

export type TopicId = "relationship" | "negativeThoughts" | "lowMood" | "depression" | "addiction" | "other";

/** One distinct brand colour per topic so consecutive rows read as distinct. */
const MARKER_COLORS: Record<TopicId, string> = {
    relationship: "#06b7a7",
    negativeThoughts: "#ffc15c",
    lowMood: "#ff5247",
    depression: "#05897d",
    addiction: "#7dde86",
    other: "#83dbd3",
};

interface Props {
    id: TopicId;
    size?: number;
}

export function TopicIcon({ id, size = 36 }: Props) {
    const color = MARKER_COLORS[id];
    const mask = `url(${marker}) center / contain no-repeat`;

    return (
        <span
            aria-hidden="true"
            style={{
                display: "inline-block",
                width: size,
                height: size,
                flexShrink: 0,
                backgroundColor: color,
                WebkitMask: mask,
                mask,
            }}
        />
    );
}
