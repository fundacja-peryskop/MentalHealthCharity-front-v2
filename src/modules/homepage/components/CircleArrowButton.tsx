import { Stack } from "@fundacja-peryskop/ui";
import { ArrowRight } from "lucide-react";
import type { PitchTone } from "../content";

interface Props {
    tone: PitchTone;
    size?: number;
}

/**
 * §8 — circular arrow affordance shown in the corner of the pitch/step cards.
 * It echoes the card's primary CTA and hints "this whole card is an entry
 * point". It is purely decorative (`aria-hidden`): the real action is the
 * card's labelled CTA button, so this must not add a second tab stop.
 */
export function CircleArrowButton({ tone, size = 44 }: Props) {
    return (
        <Stack
            width={size}
            height={size}
            borderRadius="$full"
            alignItems="center"
            justifyContent="center"
            backgroundColor={tone === "help" ? "$danger" : "$primary"}
            aria-hidden
        >
            <ArrowRight size={size * 0.45} color="white" strokeWidth={2.5} />
        </Stack>
    );
}
