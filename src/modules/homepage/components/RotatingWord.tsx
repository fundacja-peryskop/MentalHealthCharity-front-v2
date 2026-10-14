import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
    /** The words to cycle through. The first is shown on mount. */
    words: string[];
    /** Time each word stays visible, in ms. */
    intervalMs?: number;
    /** Colour of the animated word (any CSS colour). */
    color?: string;
}

/**
 * A single word that cross-fades through a list on a timer - used for the last
 * word of the hero heading. Purely decorative: it is marked `aria-hidden` so
 * screen readers read the heading's stable accessible name instead of a word
 * that changes under them. Honours `prefers-reduced-motion` (no timer, no
 * motion - it simply renders the first word).
 *
 * `inline-grid` with both the outgoing and incoming word stacked in the same
 * cell keeps the word on the baseline and lets the box size to the widest
 * word, so the surrounding text never reflows mid-animation.
 */
export function RotatingWord({ words, intervalMs = 2200, color = "currentColor" }: Props) {
    const reduceMotion = useReducedMotion();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (reduceMotion || words.length <= 1) return;
        const id = window.setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, intervalMs);
        return () => window.clearInterval(id);
    }, [reduceMotion, words.length, intervalMs]);

    if (reduceMotion) {
        return (
            <span aria-hidden style={{ color }}>
                {words[0]}
            </span>
        );
    }

    return (
        <span aria-hidden style={{ display: "inline-grid", color, verticalAlign: "bottom" }}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={words[index]}
                    initial={{ y: "0.5em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-0.5em", opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ gridArea: "1 / 1", whiteSpace: "nowrap" }}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
