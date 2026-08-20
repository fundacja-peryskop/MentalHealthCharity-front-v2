/**
 * §8 — decorative "paint stroke" icons for the topics grid. One distinct
 * organic blob shape + colour per topic. Purely decorative (the adjacent label
 * carries the meaning), so each is rendered `aria-hidden`.
 *
 * Colours are drawn from the Peryskop brand palette. These live here (not as DS
 * tokens) because they are one-off decorative art, called out as custom assets
 * in the spec.
 */

export type TopicId = "relationship" | "negativeThoughts" | "lowMood" | "depression" | "addiction" | "other";

interface Blob {
    color: string;
    /** Organic blob path on a 40×40 viewBox. */
    path: string;
}

const BLOBS: Record<TopicId, Blob> = {
    relationship: {
        color: "#06b7a7",
        path: "M20 3c9 0 16 5 16 15 0 8-4 12-9 16-5 4-13 4-18-1S1 20 5 12 11 3 20 3Z",
    },
    negativeThoughts: {
        color: "#ffc15c",
        path: "M21 4c8-1 15 4 15 13 0 7-2 11-8 15-7 5-16 3-21-3S3 15 9 9s4-4 12-5Z",
    },
    lowMood: {
        color: "#ff5247",
        path: "M19 4c10-1 18 6 17 16-1 9-8 16-18 15S2 27 4 17 9 5 19 4Z",
    },
    depression: {
        color: "#05897d",
        path: "M20 5c9 0 15 7 15 16s-8 15-17 14S3 26 4 17 11 5 20 5Z",
    },
    addiction: {
        color: "#7dde86",
        path: "M22 4c8 1 14 8 13 17-1 8-8 14-17 14S3 28 4 18 6 8 14 5s0-2 8-1Z",
    },
    other: {
        color: "#83dbd3",
        path: "M20 4c9 0 16 6 16 16 0 9-7 15-16 15S4 28 4 19 11 4 20 4Z",
    },
};

interface Props {
    id: TopicId;
    size?: number;
}

export function TopicIcon({ id, size = 36 }: Props) {
    const blob = BLOBS[id];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
        >
            <path d={blob.path} fill={blob.color} opacity={0.9} />
        </svg>
    );
}
