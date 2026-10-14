import { Stack, XStack, useMedia } from "@fundacja-peryskop/ui";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

/** Gap between slides, in px (matches the DS `$lg` space token). */
const SLIDE_GAP = 16;

export interface CarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    /** Slides visible at once per breakpoint. Defaults to `{ base: 1, md: 2 }`. */
    visibleCount?: { base: number; md: number };
    /** Accessible name for the carousel region. */
    ariaLabel: string;
    getKey?: (item: T, index: number) => React.Key;
    /**
     * Extra class on the pagination-dots row. Useful when the carousel is in a
     * full-bleed container but the dots should stay centred to the page measure.
     */
    dotsClassName?: string;
}

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/**
 * §7 - content-agnostic carousel built on Embla (accessible, pointer/touch drag,
 * keyboard navigable, lightweight). It knows nothing about what it renders, so
 * it is reused for any slide content. The number of slides visible at once is
 * responsive; real pagination-dot buttons reflect and control the active snap.
 * Respects `prefers-reduced-motion` (instant scroll, no snap animation).
 */
export function Carousel<T>({
    items,
    renderItem,
    visibleCount = { base: 1, md: 2 },
    ariaLabel,
    getKey,
    dotsClassName,
}: CarouselProps<T>) {
    const media = useMedia();
    const visible = media.md ? visibleCount.md : visibleCount.base;
    const slideBasis = `calc((100% - ${SLIDE_GAP * (visible - 1)}px) / ${visible})`;

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        containScroll: "trimSnaps",
        duration: prefersReducedMotion() ? 0 : 22,
    });

    const [snaps, setSnaps] = useState<number[]>([]);
    const [selected, setSelected] = useState(0);

    const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => setSelected(api.selectedScrollSnap()), []);

    useEffect(() => {
        if (!emblaApi) return;
        const sync = () => {
            setSnaps(emblaApi.scrollSnapList());
            onSelect(emblaApi);
        };
        sync();
        emblaApi.on("select", onSelect).on("reInit", sync);
        return () => {
            emblaApi.off("select", onSelect).off("reInit", sync);
        };
    }, [emblaApi, onSelect]);

    // The slide basis changes with the breakpoint - let Embla remeasure.
    useEffect(() => {
        emblaApi?.reInit();
    }, [emblaApi, visible]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!emblaApi) return;
        if (event.key === "ArrowRight") {
            event.preventDefault();
            emblaApi.scrollNext();
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            emblaApi.scrollPrev();
        } else if (event.key === "Home") {
            event.preventDefault();
            emblaApi.scrollTo(0);
        } else if (event.key === "End") {
            event.preventDefault();
            emblaApi.scrollTo(items.length - 1);
        }
    };

    return (
        <Stack width="100%" gap="$lg">
            <div
                ref={emblaRef}
                role="group"
                aria-roledescription="carousel"
                aria-label={ariaLabel}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                style={{ overflow: "hidden", outline: "none" }}
            >
                <div style={{ display: "flex", gap: SLIDE_GAP }}>
                    {items.map((item, index) => (
                        <div
                            key={getKey ? getKey(item, index) : index}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${index + 1} z ${items.length}`}
                            style={{ flex: `0 0 ${slideBasis}`, minWidth: 0, display: "flex" }}
                        >
                            {renderItem(item, index)}
                        </div>
                    ))}
                </div>
            </div>

            <XStack className={dotsClassName} justifyContent="center" alignItems="center" gap="$sm">
                {snaps.map((_, index) => {
                    const isActive = index === selected;
                    return (
                        <Stack
                            key={index}
                            tag="button"
                            role="button"
                            aria-label={`Przejdź do kroku ${index + 1}`}
                            aria-current={isActive || undefined}
                            onPress={() => emblaApi?.scrollTo(index)}
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
