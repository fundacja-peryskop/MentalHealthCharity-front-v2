import { Section, XStack } from "@fundacja-peryskop/ui";
import { pitchCards } from "../content";
import { PageContainer } from "../../layout/PageContainer";
import { PitchCard } from "./PitchCard";

/**
 * §4.4 — the two side-by-side pitch cards ("Potrzebuję pomocy" / "Chcę
 * pomagać"). Equal width on desktop; stacks to one column below the `md`
 * breakpoint.
 */
export function PitchCards() {
    return (
        <Section paddingVertical="$xl" alignItems="center">
            <PageContainer>
                <XStack gap="$lg" flexDirection="column" $md={{ flexDirection: "row" }}>
                    {pitchCards.map((card) => (
                        <PitchCard key={card.tone} {...card} />
                    ))}
                </XStack>
            </PageContainer>
        </Section>
    );
}
