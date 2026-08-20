import { Stack, XStack, useMedia } from "@fundacja-peryskop/ui";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** Gap between slides, in px (matches the DS `$lg` space token). */
const SLIDE_GAP = 16;
const SCROLLER_CLASS = "peryskop-carousel-scroller";

export interface CarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    /** Slides visible at once per breakpoint. Defaults to `{ base: 1, md: 2 }`. */
    visibleCount?: { base: number; md: number };
    /** Accessible name for the carousel region. */
    ariaLabel: string;
    getKey?: (item: T, index: number) => React.Key;
}

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/**
 * §7 — dependency-free, content-agnostic carousel. Uses native CSS scroll-snap
 * for pointer drag / touch swipe, exposes keyboard navigation (arrow/Home/End)
 * on a focusable region, and renders real pagination-dot buttons that reflect
 * and control the active slide. Respects `prefers-reduced-motion`. It knows
 * nothing about what it renders, so it can be reused for any slide content.
 */
export function Carousel<T>({
    items,
    renderItem,
    visibleCount = { base: 1, md: 2 },
    ariaLabel,
    getKey,
}: CarouselProps<T>) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const media = useMedia();

    const visible = media.md ? visibleCount.md : visibleCount.base;
    const slideBasis = `calc((100% - ${SLIDE_GAP * (visible - 1)}px) / ${visible})`;

    const scrollToIndex = useCallback((index: number) => {
        const scroller = scrollerRef.current;
        const slide = scroller?.children[index] as HTMLElement | undefined;
        if (!scroller || !slide) return;
        scroller.scrollTo({
            left: slide.offsetLeft,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    }, []);

    const handleScroll = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const { scrollLeft } = scroller;
        let nearest = 0;
        let nearestDelta = Infinity;
        Array.from(scroller.children).forEach((child, index) => {
            const delta = Math.abs((child as HTMLElement).offsetLeft - scrollLeft);
            if (delta < nearestDelta) {
                nearestDelta = delta;
                nearest = index;
            }
        });
        setActiveIndex(nearest);
    }, []);

    // Keep the active dot correct after breakpoint/layout changes.
    useEffect(() => {
        handleScroll();
    }, [handleScroll, visible]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const lastIndex = items.length - 1;
        if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollToIndex(Math.min(activeIndex + 1, lastIndex));
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollToIndex(Math.max(activeIndex - 1, 0));
        } else if (event.key === "Home") {
            event.preventDefault();
            scrollToIndex(0);
        } else if (event.key === "End") {
            event.preventDefault();
            scrollToIndex(lastIndex);
        }
    };

    return (
        <Stack width="100%" gap="$lg">
            {/* Scoped rule to hide the native scrollbar under the snap track. */}
            <style>{`.${SCROLLER_CLASS}{scrollbar-width:none;-ms-overflow-style:none;}.${SCROLLER_CLASS}::-webkit-scrollbar{display:none;}`}</style>

            <div
                ref={scrollerRef}
                className={SCROLLER_CLASS}
                role="group"
                aria-roledescription="carousel"
                aria-label={ariaLabel}
                tabIndex={0}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                style={{
                    position: "relative",
                    display: "flex",
                    gap: SLIDE_GAP,
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    paddingBottom: 4,
                    outline: "none",
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={getKey ? getKey(item, index) : index}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} z ${items.length}`}
                        style={{
                            flex: `0 0 ${slideBasis}`,
                            scrollSnapAlign: "start",
                            display: "flex",
                        }}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>

            <XStack justifyContent="center" alignItems="center" gap="$sm">
                {items.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <Stack
                            key={getKey ? getKey(item, index) : index}
                            tag="button"
                            role="button"
                            aria-label={`Przejdź do kroku ${index + 1}`}
                            aria-current={isActive || undefined}
                            onPress={() => scrollToIndex(index)}
                            width={isActive ? 24 : 10}
                            height={10}
                            padding={0}
                            borderRadius="$full"
                            borderWidth={0}
                            cursor="pointer"
                            backgroundColor={isActive ? "$primary" : "$borderColor"}
                            hoverStyle={{ backgroundColor: isActive ? "$primary" : "$borderColorHover" }}
                        />
                    );
                })}
            </XStack>
        </Stack>
    );
}
