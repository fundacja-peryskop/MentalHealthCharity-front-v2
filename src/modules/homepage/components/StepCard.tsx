import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import type { HowItWorksStep } from "../content";
import { ChatWindowMockup } from "../illustrations/ChatWindowMockup";
import { PersonWithBubblesIllustration } from "../illustrations/PersonWithBubblesIllustration";
import { useIconColor } from "../../layout/useIconColor";

/** Soft background + matching strong accent, cycled by step number. */
const TONE_CYCLE = [
    { soft: "$secondarySoft", accent: "secondary" },
    { soft: "$dangerSoft", accent: "danger" },
    { soft: "$primarySoft", accent: "primary" },
] as const;

/**
 * A single how-it-works slide: a giant outlined numeral, a heading, subtext and
 * the step's illustration. Colours cycle per step so consecutive slides read as
 * distinct (yellow → pink → mint), matching the reference.
 */
export function StepCard({ step }: { step: HowItWorksStep }) {
    const colors = useIconColor();
    const tone = TONE_CYCLE[(step.number - 1) % TONE_CYCLE.length];
    const accentColor = colors[tone.accent];

    return (
        <YStack
            flex={1}
            minHeight={300}
            padding="$xl"
            borderRadius="$lg"
            backgroundColor={tone.soft}
            justifyContent="space-between"
            gap="$md"
            overflow="hidden"
        >
            <YStack gap="$sm">
                <Typography
                    tag="span"
                    aria-hidden
                    style={{
                        fontSize: 88,
                        lineHeight: "88px",
                        fontWeight: 700,
                        color: "transparent",
                        WebkitTextStroke: `2px ${accentColor ?? "currentColor"}`,
                    }}
                >
                    {step.number}
                </Typography>
                <Typography variant="title3" tag="h3">
                    {step.title}
                </Typography>
                <Typography variant="regularRegular">{step.subtitle}</Typography>
            </YStack>

            <XStack justifyContent="flex-end">
                {step.illustration === "bubbles" ? (
                    <PersonWithBubblesIllustration flex={1} maxWidth={160} />
                ) : (
                    <ChatWindowMockup flex={1} maxWidth={160} />
                )}
            </XStack>
        </YStack>
    );
}
