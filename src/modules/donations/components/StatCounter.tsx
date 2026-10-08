import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useEffect, useRef, useState } from "react";

interface Props {
    /** Final number to count up to. */
    value: number;
    /** Rendered right after the number, e.g. "+", "%", " zł". */
    suffix?: string;
    /** Caption under the number. */
    label: string;
    /** Count-up duration in ms. */
    durationMs?: number;
}

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/**
 * A single trust statistic whose number counts up when it first scrolls into
 * view - a small, friendly flourish. Honours `prefers-reduced-motion` (and SSR /
 * no-IntersectionObserver): it then just shows the final value. The animated
 * number is `aria-hidden`; the real, final value is exposed to assistive tech.
 */
export function StatCounter({ value, suffix = "", label, durationMs = 1200 }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));

    useEffect(() => {
        if (prefersReducedMotion() || value === 0) {
            setDisplay(value);
            return;
        }
        const node = ref.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            setDisplay(value);
            return;
        }

        let raf = 0;
        const run = () => {
            const start = performance.now();
            const tick = (now: number) => {
                const progress = Math.min(1, (now - start) / durationMs);
                // easeOutCubic for a natural settle.
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplay(Math.round(eased * value));
                if (progress < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    run();
                    observer.disconnect();
                }
            },
            { threshold: 0.4 }
        );
        observer.observe(node);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [value, durationMs]);

    return (
        <YStack ref={ref} alignItems="center" gap="$xs" aria-label={`${value}${suffix} ${label}`}>
            <Typography variant="title2" tag="span" color="$primary" aria-hidden style={{ fontWeight: 700 }}>
                {display}
                {suffix}
            </Typography>
            <Typography variant="smallRegular" muted align="center" aria-hidden>
                {label}
            </Typography>
        </YStack>
    );
}
