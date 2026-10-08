import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
    /** Full list of paragraphs (plain strings). */
    paragraphs: string[];
    /** How many paragraphs to show before the fold. */
    initialCount?: number;
    moreLabel: string;
    lessLabel: string;
    /** Resolved icon colour for the toggle chevron. */
    accentColor: string;
}

/**
 * A block of body paragraphs that shows the first few and tucks the rest behind
 * a "read more" toggle - keeping long, trust-building copy available without
 * overwhelming the page. The hidden part fades/slides in (framer-motion, which
 * disables the motion under `prefers-reduced-motion`).
 */
export function ReadMoreProse({ paragraphs, initialCount = 3, moreLabel, lessLabel, accentColor }: Props) {
    const [expanded, setExpanded] = useState(false);
    const head = paragraphs.slice(0, initialCount);
    const tail = paragraphs.slice(initialCount);
    const hasMore = tail.length > 0;

    return (
        <YStack gap="$md" width="100%">
            {head.map((text, index) => (
                <Typography key={index} variant="regularRegular" muted width="100%">
                    {text}
                </Typography>
            ))}

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="tail"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                        {tail.map((text, index) => (
                            <Typography key={index} variant="regularRegular" muted width="100%">
                                {text}
                            </Typography>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {hasMore && (
                <Stack
                    tag="button"
                    role="button"
                    aria-expanded={expanded}
                    onPress={() => setExpanded((prev) => !prev)}
                    alignSelf="flex-start"
                    borderWidth={0}
                    backgroundColor="$backgroundTransparent"
                    cursor="pointer"
                    marginTop="$xs"
                >
                    <XStack alignItems="center" gap="$xs">
                        <Typography variant="regularSemibold" color="$primary">
                            {expanded ? lessLabel : moreLabel}
                        </Typography>
                        <Stack
                            style={{
                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.25s ease",
                            }}
                        >
                            <ChevronDown size={18} color={accentColor} />
                        </Stack>
                    </XStack>
                </Stack>
            )}
        </YStack>
    );
}
