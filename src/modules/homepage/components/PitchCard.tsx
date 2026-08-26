import { Stack, XStack, YStack, Typography } from "@fundacja-peryskop/ui";
import type { PitchCardContent } from "../content";
import { ChatWindowMockup } from "../illustrations/ChatWindowMockup";
import { EmptyChairIllustration } from "../illustrations/EmptyChairIllustration";
import { PersonWithBubblesIllustration } from "../illustrations/PersonWithBubblesIllustration";
import { CircleArrowButton } from "./CircleArrowButton";
import { CtaButton } from "../../layout/CtaButton";

/** Per-tone artwork rendered at the bottom of the card (spec §4.4 / §8). */
function PitchIllustration({ tone }: { tone: PitchCardContent["tone"] }) {
    if (tone === "help") {
        return (
            <XStack alignItems="flex-end" gap="$sm" flex={1} maxWidth={260}>
                <PersonWithBubblesIllustration flex={1} maxWidth={150} />
                <ChatWindowMockup flex={1} maxWidth={110} />
            </XStack>
        );
    }
    return <EmptyChairIllustration flex={1} maxWidth={240} />;
}

/**
 * §4.4 — a single "pitch" card: a large soft-rounded, colour-tinted entry point
 * with a heading, subtext, a pill CTA, tone artwork, and a decorative circular
 * arrow. Instantiated twice (help / volunteer) with different colour, copy,
 * illustration and href. Stacks to a single column on narrow viewports.
 */
export function PitchCard({ tone, title, subtitle, cta }: PitchCardContent) {
    const isHelp = tone === "help";

    return (
        <YStack
            flex={1}
            minHeight={360}
            padding="$xl"
            borderRadius="$lg"
            backgroundColor={isHelp ? "$dangerSoft" : "$primarySoft"}
            justifyContent="space-between"
            overflow="hidden"
            gap="$lg"
        >
            <YStack gap="$md" maxWidth={360} zIndex={1}>
                <Typography variant="title2" tag="h3" $sm={{ fontSize: 26, lineHeight: 32 }}>
                    {title}
                </Typography>
                <Typography variant="regularRegular">{subtitle}</Typography>
                <XStack>
                    <CtaButton href={cta.href} variant={isHelp ? "danger" : "primary"}>
                        {cta.label}
                    </CtaButton>
                </XStack>
            </YStack>

            <XStack alignItems="flex-end" justifyContent="space-between" gap="$md">
                <PitchIllustration tone={tone} />
                <Stack alignSelf="flex-end">
                    <CircleArrowButton tone={tone} />
                </Stack>
            </XStack>
        </YStack>
    );
}
