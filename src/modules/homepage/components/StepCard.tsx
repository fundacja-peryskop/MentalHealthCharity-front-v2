import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import type { HowItWorksStep } from "../content";
import { ChatWindowMockup } from "../illustrations/ChatWindowMockup";
import { PersonWithBubblesIllustration } from "../illustrations/PersonWithBubblesIllustration";

/**
 * Per-step palette, cycled by step number. Each tone pairs a pale card
 * background with a slightly stronger tint for the giant background numeral:
 *
 * - secondary (yellow): number `Secondary/Light` on `Secondary/Lighter`
 * - danger (red):       number `Red/Lighter`     on `Red/Lightest`
 * - primary (mint):     number `Primary/Lighter`  on `Primary/Lightest`
 */
const TONE_CYCLE = [
    { background: "$secondaryLighter", numeral: "$secondaryLight" },
    { background: "$redLightest", numeral: "$redLighter" },
    { background: "$primaryLightest", numeral: "$primaryLighter" },
] as const;

/**
 * A single how-it-works slide (see the reference): a giant filled numeral sits
 * in the background, the heading and subtext are centred on top of it, and the
 * step's illustration is shown large and centred along the bottom. Colours cycle
 * per step so consecutive slides read as distinct.
 */
export function StepCard({ step }: { step: HowItWorksStep }) {
    const { t } = useTranslation();
    const tone = TONE_CYCLE[(step.number - 1) % TONE_CYCLE.length];

    return (
        <YStack
            flex={1}
            minHeight={460}
            padding="$xl"
            borderRadius="$lg"
            backgroundColor={tone.background}
            overflow="hidden"
        >
            {/* Header zone: the oversized numeral behind the centred copy. */}
            <YStack position="relative" alignItems="center" justifyContent="center" minHeight={260}>
                <Typography
                    tag="span"
                    aria-hidden
                    color={tone.numeral}
                    position="absolute"
                    style={{
                        fontSize: "clamp(180px, 34vw, 300px)",
                        lineHeight: "1",
                        fontWeight: 800,
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                >
                    {step.number}
                </Typography>

                <YStack zIndex={1} alignItems="center" gap="$sm" maxWidth={420}>
                    <Typography variant="title3" tag="h3" align="center">
                        {t(step.titleKey)}
                    </Typography>
                    <Typography variant="regularRegular" align="center" muted>
                        {t(step.subtitleKey)}
                    </Typography>
                </YStack>
            </YStack>

            {/* Illustration: large and centred along the bottom. */}
            <XStack justifyContent="center" marginTop="auto" paddingTop="$lg">
                <Stack width="100%" maxWidth={300} alignItems="center">
                    {step.illustration === "bubbles" ? (
                        <PersonWithBubblesIllustration width="100%" />
                    ) : (
                        <ChatWindowMockup width="100%" />
                    )}
                </Stack>
            </XStack>
        </YStack>
    );
}
