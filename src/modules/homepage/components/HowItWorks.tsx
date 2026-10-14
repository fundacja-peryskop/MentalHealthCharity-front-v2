import { Section, Typography, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { howItWorksHeadingKey, howItWorksSteps } from "../content";
import { Carousel } from "./Carousel";
import { PageContainer } from "../../layout/PageContainer";
import { StepCard } from "./StepCard";

/**
 * Left padding that aligns a full-bleed element's left edge with the centered
 * `PageContainer` measure (max-width 1200 + gutter), while its right side runs
 * past the viewport edge. Mirrors `PageContainer`'s gutter: 16px by default,
 * 24px on the `sm` (≤800px) breakpoint.
 */
const BLEED_CLASS = "howitworks-bleed";
const BLEED_STYLE = `.${BLEED_CLASS}{padding-left:max(16px,calc((100vw - 1200px) / 2 + 16px));}@media (max-width:800px){.${BLEED_CLASS}{padding-left:24px;}}`;

/**
 * The carousel lives in the right-bleed container, so its pagination dots would
 * otherwise centre within that padded box (shifted right of the viewport). This
 * shifts the dots left by half the bleed padding so they centre to the viewport
 * - i.e. under the centred "Jak działamy?" heading.
 */
const DOTS_CLASS = "howitworks-dots";
const DOTS_STYLE = `.${DOTS_CLASS}{transform:translateX(calc(-0.5 * max(16px, (100vw - 1200px) / 2 + 16px)));}@media (max-width:800px){.${DOTS_CLASS}{transform:translateX(-12px);}}`;

/**
 * §4.6 - "Jak działamy?" section. The heading sits on the shared left measure;
 * the carousel starts at that same left edge and bleeds past the right edge of
 * the viewport, so the next step card always peeks in from the right. Four
 * intake steps; the carousel shows ~1 card on mobile and ~2 on desktop.
 */
export function HowItWorks() {
    const { t } = useTranslation();
    const heading = t(howItWorksHeadingKey);
    return (
        <Section paddingVertical="$xxxl" width="100%" alignItems="stretch">
            <YStack width="100%" gap="$xl">
                <PageContainer>
                    <Typography variant="title2" tag="h2" align="center">
                        {heading}
                    </Typography>
                </PageContainer>

                <style>{BLEED_STYLE + DOTS_STYLE}</style>
                <div className={BLEED_CLASS} style={{ width: "100%" }}>
                    <Carousel
                        items={howItWorksSteps}
                        ariaLabel={heading}
                        visibleCount={{ base: 1, md: 2 }}
                        getKey={(step) => step.number}
                        renderItem={(step) => <StepCard step={step} />}
                        dotsClassName={DOTS_CLASS}
                    />
                </div>
            </YStack>
        </Section>
    );
}
